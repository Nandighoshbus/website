import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import busRoutes from './routes/busRoutes';
import routeRoutes from './routes/routeRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import agentRoutes from './routes/agentRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

class Server {
  public app: Application;
  private readonly PORT: string | number;

  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 5000;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression and parsing middleware
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (process.env.NODE_ENV !== 'production') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
  }

  private initializeRoutes(): void {
    const apiVersion = process.env.API_VERSION || 'v1';
    
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use(`/api/${apiVersion}/auth`, authRoutes);
    this.app.use(`/api/${apiVersion}/users`, userRoutes);
    this.app.use(`/api/${apiVersion}/buses`, busRoutes);
    this.app.use(`/api/${apiVersion}/routes`, routeRoutes);
    this.app.use(`/api/${apiVersion}/bookings`, bookingRoutes);
    this.app.use(`/api/${apiVersion}/payments`, paymentRoutes);
    this.app.use(`/api/${apiVersion}/agents`, agentRoutes);

    // Welcome route
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'Welcome to Nandighosh Bus Service API',
        version: apiVersion,
        documentation: `/api/${apiVersion}/docs`
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.PORT, () => {
      console.log(`🚌 Nandighosh Bus Service API is running on port ${this.PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📚 API Documentation: http://localhost:${this.PORT}/api/${process.env.API_VERSION}/docs`);
    });
  }
}

// Initialize and start server
const server = new Server();
server.listen();

export default server.app;
