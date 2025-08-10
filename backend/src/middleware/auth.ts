import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from './errorHandler';
import { UserProfile } from '../types';
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
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('Authentication required', 401, 'NO_TOKEN');
    }

    // Check token blacklist (scalable feature)
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError('Token is blacklisted', 401, 'TOKEN_BLACKLISTED');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Try cache first for performance
    let user = await cache.get(`user:${decoded.sub}`) as UserProfile;
    
    if (!user) {
      // Fallback to database
      const { data: userData, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', decoded.sub)
        .single();

      if (error || !userData) {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }

      user = userData;
      // Cache user for 10 minutes
      await cache.set(`user:${decoded.sub}`, user, 600);
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
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies as fallback
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  
  return null;
};

const getRateLimitKey = (req: Request): string => {
  if (req.userId) {
    return `user:${req.userId}`;
  }
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  return `ip:${ip}`;
};
