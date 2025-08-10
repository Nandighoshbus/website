import Redis, { Redis as RedisClient } from 'ioredis';
import { Logger } from '../utils/logger';

export class CacheService {
  private static instance: CacheService;
  private redis!: RedisClient;
  private logger: Logger;
  private isConnected: boolean = false;

  private constructor() {
    this.logger = Logger.getInstance();
    this.initializeRedis();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private initializeRedis(): void {
    try {
      // Use Redis URL from environment or fallback to local
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        family: 4,
        keyPrefix: 'nandighosh:',
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        this.logger.info('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.isConnected = false;
        this.logger.error('Redis connection error', { error });
      });

      this.redis.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Redis connection closed');
      });

    } catch (error) {
      this.logger.error('Failed to initialize Redis', { error });
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const serialized = JSON.stringify(value);
      const result = await this.redis.setex(key, ttlSeconds, serialized);
      return result === 'OK';
    } catch (error) {
      this.logger.error('Cache set error', { key, error });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      this.logger.error('Cache pattern delete error', { pattern, error });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Set hash field
   */
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const serialized = JSON.stringify(value);
      const result = await this.redis.hset(key, field, serialized);
      return result >= 0;
    } catch (error) {
      this.logger.error('Cache hset error', { key, field, error });
      return false;
    }
  }

  /**
   * Get hash field
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const value = await this.redis.hget(key, field);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Cache hget error', { key, field, error });
      return null;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const result = await this.redis.incr(key);
      
      if (ttl && result === 1) {
        await this.redis.expire(key, ttl);
      }
      
      return result;
    } catch (error) {
      this.logger.error('Cache incr error', { key, error });
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      if (!this.isConnected) {
        return { connected: false };
      }

      const info = await this.redis.info('memory');
      return {
        connected: this.isConnected,
        memory: info
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', { error });
      return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
      this.logger.info('Redis disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Redis', { error });
    }
  }
}
