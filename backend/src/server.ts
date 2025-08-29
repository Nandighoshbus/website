import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import prometheus from 'prom-client';
import Redis from 'ioredis';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import busRoutes from './routes/busRoutes';
import routeRoutes from './routes/routeRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import agentRoutes from './routes/agentRoutes';
import agentRegistrationRoutes from './routes/agentRegistration';
import adminRoutes from './routes/adminRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { databaseMiddleware } from './middleware/database';

// Load environment variables first
dotenv.config();

// Initialize Prometheus metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Initialize Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Initialize Redis client (optional - falls back to in-memory if not available)
let redisClient: Redis | null = null;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info('Redis connected successfully');
  }
} catch (error) {
  logger.warn('Redis connection failed, using in-memory cache', { error });
}

class ScalableServer {
  public app: Application;
  private readonly PORT: string | number;
  private server: any;
  private isShuttingDown: boolean = false;

  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 5000;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeGracefulShutdown();
    
    // Register Prometheus metrics
    prometheus.register.setDefaultLabels({
      app: 'nandighosh-bus-api',
      version: process.env.npm_package_version || '1.0.0'
    });
    
    logger.info('Server initialized successfully');
  }

  private initializeMiddleware(): void {
    // Request ID middleware (should be first)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const requestId = uuidv4();
      req.headers['x-request-id'] = requestId;
      res.setHeader('x-request-id', requestId);
      next();
    });

    // Metrics middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/metrics' || req.path === '/health') {
        return next();
      }

      const startTime = Date.now();
      activeConnections.inc();

      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any, cb?: any) {
        const responseTime = (Date.now() - startTime) / 1000;
        const route = req.route?.path || req.path;
        
        httpRequestDuration
          .labels(req.method, route, res.statusCode.toString())
          .observe(responseTime);
        
        httpRequestsTotal
          .labels(req.method, route, res.statusCode.toString())
          .inc();
        
        activeConnections.dec();
        
        logger.info('HTTP Request', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime: `${responseTime}s`,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          requestId: req.headers['x-request-id']
        });

        return originalEnd.call(this, chunk, encoding, cb);
      };

      next();
    });

    // Trust proxy for load balancers
    this.app.set('trust proxy', parseInt(process.env.TRUST_PROXY || '1'));

    // Security middleware with enhanced configuration
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
    
    // Enhanced CORS configuration
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://www.nandighoshbus.com',
      'https://nandighoshbus.com',
      'https://nandighosh-bus-service.vercel.app',
      'https://nandighosh-bus-service.netlify.app'
    ];
    
    if (process.env.ADDITIONAL_ORIGINS) {
      allowedOrigins.push(...process.env.ADDITIONAL_ORIGINS.split(','));
    }
    
    logger.info('CORS allowed origins:', allowedOrigins);
    
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        // In development, allow all localhost origins
        if (process.env.NODE_ENV === 'development') {
          if (!origin || origin.startsWith('http://localhost') || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
        } else {
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
        }
        
        logger.warn('CORS blocked origin', { origin, allowedOrigins });
        return callback(null, true); // Allow all origins in development for now
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-request-id'],
      preflightContinue: false,
      optionsSuccessStatus: 200,
      maxAge: 86400 // 24 hours
    }));

    // Enhanced rate limiting with Redis store if available
    const createRateLimiter = () => {
      const config: any = {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        message: {
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req: Request) => {
          return req.path === '/health' || req.path === '/metrics';
        },
        handler: (req: Request, res: Response) => {
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            requestId: req.headers['x-request-id']
          });
          res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.round(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
          });
        }
      };

      // Use Redis store if available for distributed rate limiting
      if (redisClient) {
        const RedisStore = require('rate-limit-redis');
        config.store = new RedisStore({
          client: redisClient,
          prefix: 'rl:',
        });
        logger.info('Using Redis for distributed rate limiting');
      } else {
        logger.warn('Using in-memory rate limiting (not suitable for multiple instances)');
      }

      return rateLimit(config);
    };

    this.app.use('/api/', createRateLimiter());

    // Enhanced compression
    this.app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req: Request, res: Response) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      }
    }));

    // Body parsing with enhanced limits
    this.app.use(express.json({ 
      limit: process.env.MAX_BODY_SIZE || '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: process.env.MAX_BODY_SIZE || '10mb' 
    }));

    // Database middleware - attach database pool to requests
    this.app.use(databaseMiddleware);

    // Enhanced logging
    if (process.env.NODE_ENV === 'production') {
      this.app.use(morgan('combined', {
        stream: { 
          write: (message) => logger.info(message.trim(), { type: 'access_log' }) 
        },
        skip: (req) => req.path === '/health' || req.path === '/metrics'
      }));
    } else {
      this.app.use(morgan('dev', {
        skip: (req) => req.path === '/health' || req.path === '/metrics'
      }));
    }

    logger.info('Enhanced middleware initialized successfully');
  }

  private initializeRoutes(): void {
    const apiVersion = process.env.API_VERSION || 'v1';
    
    // Health check endpoint with detailed information
    this.app.get('/health', async (_req: Request, res: Response) => {
      try {
        const healthCheck = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV,
          version: process.env.npm_package_version || '1.0.0',
          pid: process.pid,
          memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
          },
          connections: {
            active: 0 // Will be updated by metrics collection
          }
        };

        // Check Redis connection if available
        if (redisClient) {
          try {
            await redisClient.ping();
            (healthCheck as any).redis = 'connected';
          } catch (error) {
            (healthCheck as any).redis = 'disconnected';
            (healthCheck as any).status = 'degraded';
          }
        }

        const statusCode = (healthCheck as any).status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthCheck);
      } catch (error: any) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        });
      }
    });

    // Metrics endpoint for Prometheus
    this.app.get('/metrics', async (_req: Request, res: Response) => {
      try {
        const metrics = await prometheus.register.metrics();
        res.set('Content-Type', prometheus.register.contentType);
        res.send(metrics);
      } catch (error: any) {
        logger.error('Metrics collection failed', { error: error.message });
        res.status(500).json({ error: 'Metrics collection failed' });
      }
    });

    // Readiness probe
    this.app.get('/ready', (_req: Request, res: Response) => {
      if (this.isShuttingDown) {
        return res.status(503).json({ status: 'shutting down' });
      }
      return res.json({ status: 'ready', timestamp: new Date().toISOString() });
    });

    // API routes with enhanced versioning
    this.app.use(`/api/${apiVersion}/auth`, authRoutes);
    this.app.use(`/api/${apiVersion}/users`, userRoutes);
    this.app.use(`/api/${apiVersion}/buses`, busRoutes);
    this.app.use(`/api/${apiVersion}/routes`, routeRoutes);
    this.app.use(`/api/${apiVersion}/schedules`, scheduleRoutes);
    this.app.use(`/api/${apiVersion}/bookings`, bookingRoutes);
    this.app.use(`/api/${apiVersion}/payments`, paymentRoutes);
    this.app.use(`/api/${apiVersion}/agents`, agentRoutes);
    this.app.use(`/api/${apiVersion}/agents`, agentRegistrationRoutes); // Additional agent registration routes
    this.app.use(`/api/${apiVersion}/admin`, adminRoutes);

    // API documentation endpoint
    this.app.get(`/api/${apiVersion}/docs`, (_req: Request, res: Response) => {
      res.json({
        message: 'Nandighosh Bus Service API Documentation',
        version: apiVersion,
        endpoints: {
          auth: `POST /api/${apiVersion}/auth/login`,
          bookings: `GET /api/${apiVersion}/bookings`,
          routes: `GET /api/${apiVersion}/routes`,
          health: 'GET /health',
          metrics: 'GET /metrics',
          ready: 'GET /ready'
        },
        documentation: process.env.API_DOCS_URL || 'https://api-docs.nandighosh.com'
      });
    });

    // Welcome route
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'Welcome to Nandighosh Bus Service API',
        version: apiVersion,
        status: 'online',
        timestamp: new Date().toISOString(),
        documentation: `/api/${apiVersion}/docs`,
        health: '/health',
        environment: process.env.NODE_ENV
      });
    });

    logger.info('Enhanced routes initialized successfully');
  }

  private initializeErrorHandling(): void {
    // Handle 404 errors
    this.app.use(notFound);
    
    // Enhanced global error handler
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      const requestId = req.headers['x-request-id'] as string;
      
      logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        requestId,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      // Call the original error handler
      errorHandler(error, req, res, next);
    });
    
    // Uncaught exception handler
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception - Shutting down gracefully', { 
        error: error.message, 
        stack: error.stack 
      });
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Promise Rejection - Shutting down gracefully', { 
        reason: reason?.message || reason
      });
      this.gracefulShutdown('UNHANDLED_REJECTION');
    });

    logger.info('Enhanced error handling initialized');
  }

  private initializeGracefulShutdown(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach(signal => {
      process.on(signal, () => {
        logger.info(`${signal} received - Starting graceful shutdown`);
        this.gracefulShutdown(signal);
      });
    });

    logger.info('Graceful shutdown handlers initialized');
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    logger.info('Starting graceful shutdown', { signal });

    // Set a timeout for forced shutdown
    const forceShutdownTimeout = setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, parseInt(process.env.SHUTDOWN_TIMEOUT || '30000')); // 30 seconds

    try {
      // Stop accepting new requests
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            logger.info('HTTP server closed');
            resolve();
          });
        });
      }

      // Close Redis connection if exists
      if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed');
      }

      // Clear metrics
      prometheus.register.clear();
      logger.info('Metrics cleared');

      clearTimeout(forceShutdownTimeout);
      logger.info('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error: any) {
      logger.error('Error during graceful shutdown', { error: error.message });
      clearTimeout(forceShutdownTimeout);
      process.exit(1);
    }
  }

  public listen(): void {
    const port = typeof this.PORT === 'string' ? parseInt(this.PORT) : this.PORT;
    
    this.server = this.app.listen(port, '0.0.0.0', () => {
      const memUsage = process.memoryUsage();
      
      logger.info('🚌 Nandighosh Bus Service API started successfully', {
        port,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        pid: process.pid,
        workerId: process.env.pm_id || cluster.worker?.id || 'single',
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
        }
      });

      console.log(`🚌 Nandighosh Bus Service API is running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`� Health: http://localhost:${port}/health`);
      console.log(`📈 Metrics: http://localhost:${port}/metrics`);
      console.log(`📚 API Docs: http://localhost:${port}/api/${process.env.API_VERSION || 'v1'}/docs`);

      // Log system resources periodically
      setInterval(() => {
        const currentMemUsage = process.memoryUsage();
        logger.info('System Resources', {
          memory: {
            rss: `${Math.round(currentMemUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(currentMemUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(currentMemUsage.external / 1024 / 1024)}MB`
          },
          uptime: `${Math.floor(process.uptime())}s`,
          cpu: process.cpuUsage()
        });
      }, parseInt(process.env.HEALTH_CHECK_INTERVAL || '300000')); // 5 minutes
    });

    this.server.on('error', (error: any) => {
      logger.error('Server error', { error: error.message, code: error.code });
      
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
        process.exit(1);
      }
      
      if (error.code === 'EACCES') {
        logger.error(`Permission denied to bind to port ${port}`);
        process.exit(1);
      }
    });

    // Handle server connection events
    this.server.on('connection', (socket: any) => {
      activeConnections.inc();
      socket.on('close', () => {
        activeConnections.dec();
      });
    });

    logger.info('Server listening initialized successfully');
  }

  // Cluster management for horizontal scaling
  public static initializeCluster(): void {
    const numWorkers = parseInt(process.env.CLUSTER_WORKERS || os.cpus().length.toString());
    
    if (cluster.isPrimary && process.env.NODE_ENV === 'production' && process.env.ENABLE_CLUSTERING === 'true') {
      logger.info(`Primary process ${process.pid} is running`);
      logger.info(`Starting ${numWorkers} worker processes`);

      // Fork workers
      for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
      }

      // Handle worker events
      cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        logger.info('Starting a new worker');
        cluster.fork();
      });

      cluster.on('online', (worker) => {
        logger.info(`Worker ${worker.process.pid} is online`);
      });

    } else {
      // Worker process or single instance
      const server = new ScalableServer();
      server.listen();
    }
  }
}

// Initialize clustering or single instance
if (require.main === module) {
  ScalableServer.initializeCluster();
}

export default ScalableServer;
