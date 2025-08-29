import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from './errorHandler';
import { UserProfile, UserRole } from '../types';
import { CacheService } from '../services/CacheService';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
      userId?: string;
      userRole?: string;
      sessionId?: string;
      correlationId?: string;
      db: SupabaseClient;
    }
  }
}

// Initialize cache service for enhanced performance
const cache = CacheService.getInstance();

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('=== AUTHENTICATION MIDDLEWARE CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
  
  try {
    const token = extractToken(req);
    console.log('=== AUTHENTICATION DEBUG ===');
    console.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    if (!token) {
      console.log('ERROR: No token provided');
      throw new AppError('Authentication required', 401, 'NO_TOKEN');
    }

    // Check if token is blacklisted
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      console.log('ERROR: Token is blacklisted');
      throw new AppError('Token is blacklisted', 401, 'TOKEN_BLACKLISTED');
    }

    let user: UserProfile;
    let userId: string;

    try {
      // Try JWT verification first for agent tokens
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.sub || decoded.userId;
      console.log('JWT decoded successfully:', { 
        decoded: { sub: decoded.sub, userId: decoded.userId, iat: decoded.iat, exp: decoded.exp }, 
        extractedUserId: userId, 
        tokenLength: token.length,
        fullDecoded: decoded
      });
    } catch (jwtError: any) {
      console.log('JWT verification failed:', jwtError.message);
      console.log('Trying Supabase auth fallback...');
      // Fallback to Supabase token verification
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !supabaseUser) {
        console.log('Supabase auth also failed:', error?.message || 'No user returned');
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }
      userId = supabaseUser.id;
      console.log('Supabase auth successful, userId:', userId);
    }
    
    // Try cache first for performance
    user = await cache.get(`user:${userId}`) as UserProfile;
    
    if (!user) {
      // Try user_profiles table first
      const { data: userData, error: userError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData && !userError) {
        user = userData;
      } else {
        // Fallback to agents table for agent authentication
        console.log('Looking for agent with ID:', userId);
        let { data: agentData, error: agentError } = await supabaseAdmin
          .from('agents')
          .select('id, user_id, business_name, contact_person, phone, is_active, commission_rate, business_address')
          .eq('id', userId)
          .single();

        console.log('Agent query result:', { agentData, agentError });

        // If not found by id, try by user_id (for backward compatibility with old tokens)
        if (agentError && agentError.code === 'PGRST116') {
          console.log('Agent not found by ID, trying user_id field:', userId);
          const { data: agentByUserId, error: userIdError } = await supabaseAdmin
            .from('agents')
            .select('id, user_id, business_name, contact_person, phone, is_active, commission_rate, business_address')
            .eq('user_id', userId)
            .single();
          
          console.log('Agent by user_id result:', { agentByUserId, userIdError });
          
          if (agentByUserId && !userIdError) {
            agentData = agentByUserId;
            agentError = null;
            console.log('Found agent by user_id, using this record');
          }
        }

        if (agentError || !agentData) {
          console.log('Agent not found, checking if user_id exists in agents table at all');
          const { data: allAgents } = await supabaseAdmin
            .from('agents')
            .select('user_id, email, id, business_name')
            .limit(10);
          console.log('All agents in database:', allAgents);
          console.log('Looking for user_id:', userId);
          console.log('Agent query error:', agentError);
          
          // Try to find agent by ID field instead of user_id
          const { data: agentById } = await supabaseAdmin
            .from('agents')
            .select('user_id, email, id, business_name')
            .eq('id', userId)
            .single();
          console.log('Agent found by id field:', agentById);
          
          if (agentById) {
            // Use the agent found by ID
            user = {
              id: agentById.id,
              email: agentById.email,
              role: 'agent' as UserRole,
              is_active: true,
              is_verified: true,
              full_name: agentById.business_name,
              phone: '',
              created_at: new Date(),
              updated_at: new Date()
            } as UserProfile;
          } else {
            throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
          }
        } else {
          // Convert agent data to user profile format
          user = {
            id: agentData.id, // Use agent.id as the user ID
            email: agentData.business_address?.email || '',
            role: 'agent' as UserRole,
            is_active: agentData.is_active,
            is_verified: true, // Agents are verified when approved
            full_name: agentData.contact_person || agentData.business_name,
            phone: agentData.business_address?.phone || agentData.phone,
            created_at: new Date(),
            updated_at: new Date()
          } as UserProfile;
        }
      }

      // Cache user for 10 minutes
      await cache.set(`user:${userId}`, user, 600);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update last activity (non-blocking)
    setImmediate(() => {
      cache.set(`last_activity:${user.id}`, new Date().toISOString(), 3600);
    });
    
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'NO_AUTH');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      // Check blacklist
      const isBlacklisted = await cache.get(`blacklist:${token}`);
      if (!isBlacklisted) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          
          // Try cache first
          let user = await cache.get(`user:${decoded.sub}`) as UserProfile;
          
          if (!user) {
            const { data: userData } = await supabaseAdmin
              .from('user_profiles')
              .select('*')
              .eq('id', decoded.sub)
              .single();

            if (userData && userData.is_active) {
              user = userData;
              await cache.set(`user:${decoded.sub}`, user, 600);
            }
          }

          if (user && user.is_active) {
            req.user = user;
            req.userId = user.id;
            req.userRole = user.role;
            req.sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Update activity
            setImmediate(() => {
              cache.set(`last_activity:${user.id}`, new Date().toISOString(), 3600);
            });
          }
        } catch (tokenError) {
          // Invalid token - continue without auth
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Rate limiting middleware
export const rateLimit = (maxAttempts: number, windowMinutes: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = getRateLimitKey(req);
      const windowMs = windowMinutes * 60 * 1000;
      
      const attempts = await cache.get(`rate_limit:${key}`) as number || 0;
      
      if (attempts >= maxAttempts) {
        throw new AppError(
          `Too many requests. Try again in ${windowMinutes} minutes.`,
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      // Increment counter
      await cache.set(`rate_limit:${key}`, attempts + 1, windowMs / 1000);
      
      // Set response headers
      res.setHeader('X-RateLimit-Limit', maxAttempts);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAttempts - attempts - 1));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper functions
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  console.log('=== TOKEN EXTRACTION DEBUG ===');
  console.log('Authorization header:', authHeader);
  console.log('All headers:', JSON.stringify(req.headers, null, 2));
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('Token extracted from Bearer header:', token ? `${token.substring(0, 20)}...` : 'EMPTY');
    return token;
  }
  
  // Check cookies as fallback
  if (req.cookies && req.cookies.access_token) {
    console.log('Token found in cookies');
    return req.cookies.access_token;
  }
  
  console.log('No token found in headers or cookies');
  return null;
};

const getRateLimitKey = (req: Request): string => {
  if (req.userId) {
    return `user:${req.userId}`;
  }
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  return `ip:${ip}`;
};
