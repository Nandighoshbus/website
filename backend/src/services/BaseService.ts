import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase';
import { CacheService } from './CacheService';
import { Logger } from '../utils/logger';

export abstract class BaseService {
  protected db: SupabaseClient;
  protected cache: CacheService;
  protected logger: Logger;

  constructor() {
    this.db = supabaseAdmin;
    this.cache = CacheService.getInstance();
    this.logger = Logger.getInstance();
  }

  /**
   * Generate cache key with consistent formatting
   */
  protected generateCacheKey(prefix: string, ...keys: (string | number)[]): string {
    return `${prefix}:${keys.join(':')}`;
  }

  /**
   * Execute query with caching support
   */
  protected async executeWithCache<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedData = await this.cache.get<T>(cacheKey);
      if (cachedData) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        return cachedData;
      }

      // Execute query
      this.logger.debug(`Cache miss for key: ${cacheKey}, executing query`);
      const data = await queryFn();

      // Cache the result
      if (data) {
        await this.cache.set(cacheKey, data, ttl);
      }

      return data;
    } catch (error) {
      this.logger.error('Error in executeWithCache', { cacheKey, error });
      throw error;
    }
  }

  /**
   * Invalidate related cache keys
   */
  protected async invalidateCache(patterns: string[]): Promise<void> {
    try {
      await Promise.all(patterns.map(pattern => this.cache.del(pattern)));
      this.logger.debug('Cache invalidated', { patterns });
    } catch (error) {
      this.logger.warn('Failed to invalidate cache', { patterns, error });
    }
  }

  /**
   * Execute transaction with retry logic
   */
  protected async executeTransaction<T>(
    operations: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operations();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.code === '23505' || error.code === '23503') { // Unique constraint, foreign key
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms`, { error });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}
