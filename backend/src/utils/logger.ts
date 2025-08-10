import winston from 'winston';
import path from 'path';

export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private logger!: winston.Logger;
  private requestId?: string;
  private defaultContext?: any;

  private constructor() {
    this.initializeLogger();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private initializeLogger(): void {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const nodeEnv = process.env.NODE_ENV || 'development';

    // Custom format for structured logging
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf((info) => {
        const { timestamp, level, message, requestId, ...meta } = info;
        
        const logObject = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...(requestId ? { requestId } : {}),
          ...(Object.keys(meta).length > 0 && { meta })
        };

        return JSON.stringify(logObject);
      })
    );

    // Console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf((info) => {
        const { timestamp, level, message, requestId, ...meta } = info;
        let logMessage = `${timestamp} [${level}]: ${message}`;
        
        if (requestId) {
          logMessage += ` [RequestId: ${requestId}]`;
        }
        
        if (Object.keys(meta).length > 0) {
          logMessage += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return logMessage;
      })
    );

    const transports: winston.transport[] = [];

    // Console transport for development
    if (nodeEnv === 'development') {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          level: logLevel
        })
      );
    } else {
      // Structured JSON logs for production
      transports.push(
        new winston.transports.Console({
          format: logFormat,
          level: logLevel
        })
      );
    }

    // File transports for production
    if (nodeEnv === 'production') {
      const logsDir = process.env.LOGS_DIR || 'logs';
      
      // Error logs
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          format: logFormat,
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 5
        })
      );

      // Combined logs
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          format: logFormat,
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 5
        })
      );

      // Access logs
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'access.log'),
          level: 'info',
          format: logFormat,
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 10
        })
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: logFormat,
      transports,
      // Don't exit on handled exceptions
      exitOnError: false,
      // Handle uncaught exceptions
      exceptionHandlers: [
        new winston.transports.Console({
          format: consoleFormat
        })
      ],
      // Handle unhandled promise rejections
      rejectionHandlers: [
        new winston.transports.Console({
          format: consoleFormat
        })
      ]
    });
  }

  /**
   * Set request ID for tracking across logs
   */
  setRequestId(requestId: string): Logger {
    const newLogger = Object.create(this);
    newLogger.requestId = requestId;
    return newLogger;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, { ...context, requestId: this.requestId });
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(message, { ...context, requestId: this.requestId });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, { ...context, requestId: this.requestId });
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void {
    this.logger.error(message, { ...context, requestId: this.requestId });
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    this.logger.info(`Performance: ${operation}`, {
      ...context,
      duration,
      operation,
      type: 'performance',
      requestId: this.requestId
    });
  }

  /**
   * Log HTTP request
   */
  httpRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.logger.info(`HTTP ${method} ${url}`, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'http_request',
      requestId: this.requestId
    });
  }

  /**
   * Log database query
   */
  dbQuery(query: string, duration: number, context?: LogContext): void {
    this.logger.debug(`Database query executed`, {
      ...context,
      query,
      duration,
      type: 'db_query',
      requestId: this.requestId
    });
  }

  /**
   * Log cache operation
   */
  cacheOperation(operation: 'hit' | 'miss' | 'set' | 'del', key: string, context?: LogContext): void {
    this.logger.debug(`Cache ${operation}: ${key}`, {
      ...context,
      operation,
      key,
      type: 'cache_operation',
      requestId: this.requestId
    });
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = Object.create(this);
    childLogger.defaultContext = { ...this.defaultContext, ...context };
    return childLogger;
  }

  /**
   * Get the underlying Winston logger
   */
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
