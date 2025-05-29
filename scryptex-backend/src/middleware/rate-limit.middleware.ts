
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '@/utils/logger';

export const rateLimitMiddleware = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    },
    keyGenerator: (req: Request) => {
      // Use user address if authenticated, otherwise use IP
      return req.user?.address || req.ip;
    }
  });
};

// Pre-configured rate limiters for different endpoints
export const authRateLimit = rateLimitMiddleware(5, 15 * 60 * 1000); // 5 requests per 15 minutes
export const apiRateLimit = rateLimitMiddleware(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const bridgeRateLimit = rateLimitMiddleware(10, 60 * 1000); // 10 requests per minute
export const tradingRateLimit = rateLimitMiddleware(50, 60 * 1000); // 50 requests per minute
export const questRateLimit = rateLimitMiddleware(20, 60 * 1000); // 20 requests per minute
