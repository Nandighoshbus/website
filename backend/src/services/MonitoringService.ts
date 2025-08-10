import { Logger } from '../utils/logger';
import { CacheService } from './CacheService';
import { supabaseAdmin } from '../config/supabase';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    cache: HealthCheck;
    memory: HealthCheck;
    disk?: HealthCheck;
  };
  metrics: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

export interface HealthCheck {
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message: string;
  details?: any;
}

export interface Metrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  activeConnections: number;
  startTime: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private logger: Logger;
  private cache: CacheService;
  private metrics: Metrics;
  private readonly version: string;
  private readonly environment: string;

  private constructor() {
    this.logger = Logger.getInstance();
    this.cache = CacheService.getInstance();
    this.version = process.env.npm_package_version || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      activeConnections: 0,
      startTime: Date.now()
    };
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Parallel health checks
      const [databaseCheck, cacheCheck, memoryCheck] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkCache(),
        this.checkMemory()
      ]);

      const checks = {
        database: this.getCheckResult(databaseCheck),
        cache: this.getCheckResult(cacheCheck),
        memory: this.getCheckResult(memoryCheck)
      };

      // Determine overall status
      const overallStatus = this.determineOverallStatus(checks);

      // Calculate metrics
      const metrics = this.calculateMetrics();

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: this.getUptime(),
        version: this.version,
        environment: this.environment,
        checks,
        metrics
      };

      const responseTime = Date.now() - startTime;
      this.logger.info('Health check completed', { 
        status: overallStatus, 
        responseTime,
        checks: Object.keys(checks).reduce((acc, key) => {
          acc[key] = checks[key as keyof typeof checks].status;
          return acc;
        }, {} as Record<string, string>)
      });

      return result;

    } catch (error: any) {
      this.logger.error('Health check failed', { error: error.message });
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: this.getUptime(),
        version: this.version,
        environment: this.environment,
        checks: {
          database: { status: 'fail', message: 'Health check failed' },
          cache: { status: 'fail', message: 'Health check failed' },
          memory: { status: 'fail', message: 'Health check failed' }
        },
        metrics: this.calculateMetrics()
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simple query to check database connectivity
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          status: 'fail',
          responseTime,
          message: `Database error: ${error.message}`,
          details: { error: error.message }
        };
      }

      if (responseTime > 5000) {
        return {
          status: 'warn',
          responseTime,
          message: 'Database response time is high',
          details: { responseTime }
        };
      }

      return {
        status: 'pass',
        responseTime,
        message: 'Database connection healthy'
      };

    } catch (error: any) {
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Database connection failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check cache health
   */
  private async checkCache(): Promise<HealthCheck> {
    const startTime = Date.now();
    const testKey = 'health-check-test';
    const testValue = { timestamp: Date.now() };

    try {
      // Test cache write
      const setResult = await this.cache.set(testKey, testValue, 10);
      if (!setResult) {
        return {
          status: 'fail',
          responseTime: Date.now() - startTime,
          message: 'Cache write failed'
        };
      }

      // Test cache read
      const getValue = await this.cache.get(testKey);
      if (!getValue) {
        return {
          status: 'fail',
          responseTime: Date.now() - startTime,
          message: 'Cache read failed'
        };
      }

      // Cleanup
      await this.cache.del(testKey);

      const responseTime = Date.now() - startTime;

      if (responseTime > 1000) {
        return {
          status: 'warn',
          responseTime,
          message: 'Cache response time is high'
        };
      }

      return {
        status: 'pass',
        responseTime,
        message: 'Cache is healthy'
      };

    } catch (error: any) {
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Cache error: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthCheck> {
    try {
      const memUsage = process.memoryUsage();
      const totalMemoryMB = Math.round(memUsage.rss / 1024 / 1024);
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

      const memoryWarningThreshold = 512; // MB
      const memoryCriticalThreshold = 1024; // MB

      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Memory usage is normal';

      if (totalMemoryMB > memoryCriticalThreshold) {
        status = 'fail';
        message = `Memory usage critical: ${totalMemoryMB}MB`;
      } else if (totalMemoryMB > memoryWarningThreshold) {
        status = 'warn';
        message = `Memory usage high: ${totalMemoryMB}MB`;
      }

      return {
        status,
        message,
        details: {
          rss: `${totalMemoryMB}MB`,
          heapUsed: `${heapUsedMB}MB`,
          heapTotal: `${heapTotalMB}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        }
      };

    } catch (error: any) {
      return {
        status: 'fail',
        message: `Memory check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Get result from settled promise
   */
  private getCheckResult(settledResult: PromiseSettledResult<HealthCheck>): HealthCheck {
    if (settledResult.status === 'fulfilled') {
      return settledResult.value;
    } else {
      return {
        status: 'fail',
        message: `Health check failed: ${settledResult.reason?.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(checks: HealthCheckResult['checks']): HealthCheckResult['status'] {
    const checkValues = Object.values(checks);
    
    if (checkValues.some(check => check.status === 'fail')) {
      return 'unhealthy';
    }
    
    if (checkValues.some(check => check.status === 'warn')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Calculate performance metrics
   */
  private calculateMetrics(): HealthCheckResult['metrics'] {
    const cacheTotal = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? (this.metrics.cacheHits / cacheTotal) * 100 : 0;
    const errorRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.failedRequests / this.metrics.totalRequests) * 100 : 0;
    const averageResponseTime = this.metrics.totalRequests > 0 ? 
      this.metrics.totalResponseTime / this.metrics.totalRequests : 0;

    return {
      totalRequests: this.metrics.totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  }

  /**
   * Get system uptime
   */
  private getUptime(): number {
    return Math.floor((Date.now() - this.metrics.startTime) / 1000);
  }

  /**
   * Record request metrics
   */
  recordRequest(responseTime: number, success: boolean): void {
    this.metrics.totalRequests++;
    this.metrics.totalResponseTime += responseTime;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
  }

  /**
   * Record cache metrics
   */
  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  /**
   * Record active connection
   */
  recordConnection(increment: boolean): void {
    if (increment) {
      this.metrics.activeConnections++;
    } else {
      this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    }
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): Metrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      activeConnections: this.metrics.activeConnections, // Keep current connections
      startTime: Date.now()
    };
    
    this.logger.info('Metrics reset');
  }

  /**
   * Log system statistics
   */
  logSystemStats(): void {
    const memUsage = process.memoryUsage();
    const metrics = this.getCurrentMetrics();
    
    this.logger.info('System statistics', {
      uptime: this.getUptime(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      },
      metrics: {
        totalRequests: metrics.totalRequests,
        activeConnections: metrics.activeConnections,
        averageResponseTime: metrics.totalRequests > 0 ? 
          Math.round((metrics.totalResponseTime / metrics.totalRequests) * 100) / 100 : 0,
        errorRate: metrics.totalRequests > 0 ? 
          Math.round((metrics.failedRequests / metrics.totalRequests) * 100 * 100) / 100 : 0
      }
    });
  }

  /**
   * Log authentication events for security monitoring
   */
  async logAuthEvent(eventType: string, data: any): Promise<void> {
    try {
      const eventData = {
        event_type: eventType,
        timestamp: new Date().toISOString(),
        user_id: data.userId || null,
        email: data.email || null,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
        role: data.role || null,
        error: data.error || null,
        duration: data.duration || null,
        severity: this.getEventSeverity(eventType),
        metadata: data
      };

      // Log to file
      this.logger.info(`Auth event: ${eventType}`, eventData);

      // Store in database for audit trail
      await supabaseAdmin
        .from('auth_audit_logs')
        .insert([eventData]);

      // Cache recent failed attempts for security monitoring
      if (eventType.includes('failed') || eventType.includes('locked')) {
        await this.cache.set(
          `security_event:${eventType}:${Date.now()}`,
          eventData,
          3600 // 1 hour
        );
      }

    } catch (error) {
      this.logger.error('Failed to log auth event', { 
        eventType, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Determine severity level for auth events
   */
  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
      'login_success': 'low',
      'logout_success': 'low',
      'registration_success': 'low',
      'email_verification': 'low',
      'token_refresh': 'low',
      'login_failed': 'medium',
      'registration_failed': 'medium',
      'password_reset': 'medium',
      'account_locked': 'high',
      'suspicious_activity': 'critical'
    };

    return severityMap[eventType] || 'medium';
  }
}
