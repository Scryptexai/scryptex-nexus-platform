
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { apiRoutes } from '@/routes';
import { errorMiddleware } from '@/middleware/error.middleware';
import { WebSocketService } from '@/services/websocket.service';
import { apiRateLimit } from '@/middleware/rate-limit.middleware';

class App {
  public express: express.Application;
  public server: any;
  public websocketService: WebSocketService;

  constructor() {
    this.express = express();
    this.server = createServer(this.express);
    this.websocketService = new WebSocketService();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.express.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.express.use(cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Request parsing
    this.express.use(express.json({ limit: '10mb' }));
    this.express.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.env !== 'test') {
      this.express.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim())
        }
      }));
    }

    // Rate limiting
    this.express.use(apiRateLimit);

    // Request ID middleware
    this.express.use((req, res, next) => {
      req.requestId = Math.random().toString(36).substring(2, 15);
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });

    // Request logging
    this.express.use((req, res, next) => {
      logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestId: req.requestId
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Root endpoint
    this.express.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'SCRYPTEX Multi-Chain Bridge Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        documentation: '/api/docs',
        health: '/api/health'
      });
    });

    // API routes
    this.express.use(config.api.prefix, apiRoutes);

    // 404 handler
    this.express.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeWebSocket(): void {
    this.websocketService.initialize(this.server);
    logger.info('WebSocket service initialized');
  }

  private initializeErrorHandling(): void {
    this.express.use(errorMiddleware);

    // Global error handlers
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection', { reason });
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  }

  public listen(): void {
    this.server.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`, {
        environment: config.env,
        port: config.server.port,
        apiPrefix: config.api.prefix
      });
    });
  }

  public getServer() {
    return this.server;
  }

  public getWebSocketService(): WebSocketService {
    return this.websocketService;
  }
}

export default App;
