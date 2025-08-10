/**
 * Scalable Authentication Service
 * Handles all authentication operations with enterprise-grade features
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CacheService } from './CacheService';
import { QueueService } from './QueueService';
import { MonitoringService } from './MonitoringService';
import { AppError } from '../middleware/errorHandler';
import { 
  AuthUser, 
  AuthSession, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest,
  UserProfile,
  AuthResponse 
} from '../types/auth';

export class ScalableAuthService {
  private supabase: SupabaseClient;
  private cache: CacheService;
  private queue: QueueService;
  private monitor: MonitoringService;
  
  // Token expiration times (in seconds)
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
  private readonly SESSION_CACHE_EXPIRY = 10 * 60; // 10 minutes
  
  // Security constants
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60; // 30 minutes
  private readonly PASSWORD_MIN_LENGTH = 8;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    this.cache = CacheService.getInstance();
    this.queue = QueueService.getInstance();
    this.monitor = MonitoringService.getInstance();
  }

  /**
   * Register a new user with comprehensive validation and security
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const startTime = Date.now();
    
    try {
      // Validate input
      await this.validateRegistrationData(data);
      
      // Check if user already exists
      await this.checkUserExists(data.email);
      
      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await this.supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: false, // We'll handle verification ourselves
        user_metadata: {
          full_name: data.full_name,
          phone: data.phone,
          registration_source: 'web'
        }
      });

      if (authError || !authUser.user) {
        throw new AppError('Failed to create user account', 500, 'AUTH_CREATE_FAILED');
      }

      // Create extended user profile
      const userProfile = await this.createUserProfile({
        id: authUser.user.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role || 'customer',
        is_verified: false,
        is_active: true,
        metadata: {
          registration_ip: data.ip_address,
          user_agent: data.user_agent,
          registration_date: new Date().toISOString()
        }
      });

      // Generate secure tokens
      const tokens = await this.generateTokens(authUser.user.id, userProfile.role);
      
      // Cache user session for quick access
      await this.cacheUserSession(authUser.user.id, {
        user: userProfile,
        tokens,
        created_at: new Date()
      });

      // Queue verification email
      await this.queue.addJob(
        'send-verification-email', 
        JSON.stringify({
          userId: authUser.user.id,
          email: data.email,
          full_name: data.full_name
        }),
        { delay: 1000 }
      );

      // Log successful registration
      await this.monitor.logAuthEvent('registration_success', {
        userId: authUser.user.id,
        email: data.email,
        role: userProfile.role,
        duration: Date.now() - startTime
      });

      return {
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: userProfile,
          tokens,
          requires_verification: true
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.monitor.logAuthEvent('registration_failed', {
        email: data.email,
        error: errorMessage,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Login with advanced security features
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const startTime = Date.now();
    
    try {
      // Check for account lockout
      await this.checkAccountLockout(data.email);
      
      // Get user profile
      const userProfile = await this.getUserByEmail(data.email);
      if (!userProfile) {
        await this.recordFailedAttempt(data.email);
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Check account status
      if (!userProfile.is_active) {
        throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
      }

      // Verify password with Supabase
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError || !authData.user) {
        await this.recordFailedAttempt(data.email);
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Clear failed attempts on successful login
      await this.clearFailedAttempts(data.email);

      // Generate new tokens
      const tokens = await this.generateTokens(authData.user.id, userProfile.role);
      
      // Update last login
      await this.updateLastLogin(authData.user.id, {
        ip_address: data.ip_address,
        user_agent: data.user_agent
      });

      // Cache session
      await this.cacheUserSession(authData.user.id, {
        user: userProfile,
        tokens,
        created_at: new Date()
      });

      // Log successful login
      await this.monitor.logAuthEvent('login_success', {
        userId: authData.user.id,
        email: data.email,
        role: userProfile.role,
        duration: Date.now() - startTime
      });

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userProfile,
          tokens,
          requires_verification: !userProfile.is_verified
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.monitor.logAuthEvent('login_failed', {
        email: data.email,
        error: errorMessage,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      const userId = decoded.sub;

      // Check if token is blacklisted
      const isBlacklisted = await this.cache.get(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        throw new AppError('Token is blacklisted', 401, 'TOKEN_BLACKLISTED');
      }

      // Get user profile
      const userProfile = await this.getUserById(userId);
      if (!userProfile || !userProfile.is_active) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(userId, userProfile.role);
      
      // Blacklist old refresh token
      await this.cache.set(`blacklist:${refreshToken}`, true, this.REFRESH_TOKEN_EXPIRY);

      // Update cached session
      await this.updateCachedSession(userId, { tokens: newTokens });

      return newTokens;

    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Logout user and cleanup sessions
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      // Blacklist refresh token if provided
      if (refreshToken) {
        await this.cache.set(`blacklist:${refreshToken}`, true, this.REFRESH_TOKEN_EXPIRY);
      }

      // Remove cached session
      await this.cache.del(`session:${userId}`);

      // Sign out from Supabase
      await this.supabase.auth.admin.signOut(userId);

      // Log logout event
      await this.monitor.logAuthEvent('logout_success', { userId });

    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout failures
    }
  }

  /**
   * Verify user session and return user data
   */
  async verifySession(token: string): Promise<AuthUser | null> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.sub;

      // Try to get from cache first
      const cachedSession = await this.getCachedSession(userId);
      if (cachedSession) {
        return cachedSession.user;
      }

      // Fallback to database
      const userProfile = await this.getUserById(userId);
      if (!userProfile || !userProfile.is_active) {
        return null;
      }

      // Cache for future requests
      await this.cacheUserSession(userId, {
        user: userProfile,
        tokens: { access_token: token, refresh_token: '', token_type: 'Bearer', expires_in: 0, expires_at: new Date() },
        created_at: new Date()
      });

      return userProfile;

    } catch (error) {
      return null;
    }
  }

  /**
   * Generate secure JWT tokens
   */
  private async generateTokens(userId: string, role: string): Promise<AuthTokens> {
    const payload = { 
      sub: userId, 
      role,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID() // Unique token ID for tracking
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.ACCESS_TOKEN_EXPIRY,
      expires_at: new Date(Date.now() + this.ACCESS_TOKEN_EXPIRY * 1000)
    };
  }

  /**
   * Create user profile with validation
   */
  private async createUserProfile(data: any): Promise<UserProfile> {
    const { data: profile, error } = await this.supabase
      .from('user_profiles')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create user profile', 500, 'PROFILE_CREATE_ERROR');
    }

    return profile;
  }

  /**
   * Validation methods
   */
  private async validateRegistrationData(data: RegisterRequest): Promise<void> {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Password validation
    if (data.password.length < this.PASSWORD_MIN_LENGTH) {
      throw new AppError(`Password must be at least ${this.PASSWORD_MIN_LENGTH} characters`, 400, 'WEAK_PASSWORD');
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
    if (!phoneRegex.test(data.phone)) {
      throw new AppError('Invalid phone number format', 400, 'INVALID_PHONE');
    }
  }

  /**
   * Security and caching helper methods
   */
  private async checkUserExists(email: string): Promise<void> {
    const { data } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (data) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }
  }

  private async getUserByEmail(email: string): Promise<UserProfile | null> {
    const { data } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    return data;
  }

  private async getUserById(id: string): Promise<UserProfile | null> {
    const { data } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  private async checkAccountLockout(email: string): Promise<void> {
    const attempts = await this.cache.get(`failed_attempts:${email}`) as number || 0;
    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      throw new AppError('Account temporarily locked due to too many failed attempts', 429, 'ACCOUNT_LOCKED');
    }
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    const key = `failed_attempts:${email}`;
    const attempts = await this.cache.get(key) as number || 0;
    await this.cache.set(key, attempts + 1, this.LOCKOUT_DURATION);
  }

  private async clearFailedAttempts(email: string): Promise<void> {
    await this.cache.del(`failed_attempts:${email}`);
  }

  private async updateLastLogin(userId: string, data: any): Promise<void> {
    await this.supabase
      .from('user_profiles')
      .update({ 
        last_login: new Date().toISOString(),
        last_login_ip: data.ip_address,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  private async cacheUserSession(userId: string, session: AuthSession): Promise<void> {
    await this.cache.set(`session:${userId}`, session, this.SESSION_CACHE_EXPIRY);
  }

  private async getCachedSession(userId: string): Promise<AuthSession | null> {
    return await this.cache.get(`session:${userId}`);
  }

  private async updateCachedSession(userId: string, updates: Partial<AuthSession>): Promise<void> {
    const session = await this.getCachedSession(userId);
    if (session) {
      await this.cacheUserSession(userId, { ...session, ...updates });
    }
  }

  // Singleton pattern
  private static instance: ScalableAuthService;
  
  public static getInstance(): ScalableAuthService {
    if (!ScalableAuthService.instance) {
      ScalableAuthService.instance = new ScalableAuthService();
    }
    return ScalableAuthService.instance;
  }
}

export default ScalableAuthService;
