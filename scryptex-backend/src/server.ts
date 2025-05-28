
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/models';
import { connectRedis } from '@/config/redis';
import { initializeWebSocket } from '@/websockets';
import { startBackgroundJobs } from '@/jobs';
import routes from '@/routes';
import { errorMiddleware } from '@/middleware/error.middleware';
import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';
import { loggingMiddleware } from '@/middleware/logging.middleware';
import { corsMiddleware } from '@/middleware/cors.middleware';

class ScryptexServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
  }

  private async initializeSentry(): Promise<void> {
    if (config.sentry.dsn && config.env === 'production') {
      Sentry.init({
        dsn: config.sentry.dsn,
        environment: config.env,
        tracesSampleRate: 1.0,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: this.app })
        ]
      });

      this.app.use(Sentry.Handlers.requestHandler());
      this.app.use(Sentry.Handlers.tracingHandler());
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "ws:"]
        }
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS middleware
    this.app.use(corsMiddleware);

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Logging middleware
    if (config.env !== 'test') {
      this.app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
    }
    this.app.use(loggingMiddleware);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy for rate limiting behind reverse proxy
    this.app.set('trust proxy', 1);
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        environment: config.env
      });
    });

    // API routes
    this.app.use(config.api.prefix, routes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
      });
    });

    // Error handling middleware (must be last)
    if (config.sentry.dsn && config.env === 'production') {
      this.app.use(Sentry.Handlers.errorHandler());
    }
    this.app.use(errorMiddleware);
  }

  private async connectServices(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      logger.info('Database connected successfully');

      // Connect to Redis
      await connectRedis();
      logger.info('Redis connected successfully');

    } catch (error) {
      logger.error('Failed to connect to services:', error);
      throw error;
    }
  }

  private async startServices(): Promise<void> {
    try {
      // Initialize WebSocket server
      if (config.features.websockets) {
        initializeWebSocket(this.io);
        logger.info('WebSocket server initialized');
      }

      // Start background jobs
      if (config.features.backgroundJobs) {
        await startBackgroundJobs();
        logger.info('Background jobs started');
      }

    } catch (error) {
      logger.error('Failed to start services:', error);
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      // Stop accepting new connections
      this.server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }

        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize Sentry
      await this.initializeSentry();

      // Setup middleware
      this.setupMiddleware();

      // Connect to external services
      await this.connectServices();

      // Setup routes
      this.setupRoutes();

      // Start additional services
      await this.startServices();

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Start server
      this.server.listen(config.server.port, () => {
        logger.info(`🚀 SCRYPTEX Backend Server started`);
        logger.info(`📍 Environment: ${config.env}`);
        logger.info(`🌐 Server running on port ${config.server.port}`);
        logger.info(`🔌 WebSocket server on port ${config.websocket.port || config.server.port}`);
        logger.info(`📊 Health check: http://localhost:${config.server.port}/health`);
        logger.info(`📖 API Documentation: http://localhost:${config.server.port}${config.api.prefix}/docs`);
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new ScryptexServer();
  server.start().catch((error) => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

export default ScryptexServer;
