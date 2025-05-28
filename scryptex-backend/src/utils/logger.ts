
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '@/config/environment';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    if (stack) {
      msg += `\n${stack}`;
    }
    
    return msg;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} ${level}: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata, null, 2)}`;
    }
    
    return msg;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport
if (config.logging.console) {
  transports.push(
    new winston.transports.Console({
      format: config.env === 'development' ? consoleFormat : logFormat,
      level: config.logging.level
    })
  );
}

// File transport with rotation
if (config.logging.file) {
  // General logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: config.logging.level
    })
  );

  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
      level: 'error'
    })
  );

  // Blockchain operation logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/blockchain-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: 'info'
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
  silent: config.env === 'test'
});

// Create specialized loggers
export const blockchainLogger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new DailyRotateFile({
      filename: 'logs/blockchain-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ],
  defaultMeta: { service: 'blockchain' }
});

export const bridgeLogger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new DailyRotateFile({
      filename: 'logs/bridge-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ],
  defaultMeta: { service: 'bridge' }
});

export const tradingLogger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new DailyRotateFile({
      filename: 'logs/trading-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ],
  defaultMeta: { service: 'trading' }
});

export const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      format: logFormat
    })
  ],
  defaultMeta: { service: 'security' }
});

// Log unhandled exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

logger.rejections.handle(
  new winston.transports.File({ filename: 'logs/rejections.log' })
);

// Helper functions for structured logging
export const loggers = {
  // Authentication & Security
  auth: {
    login: (address: string, success: boolean, ip?: string) => 
      securityLogger.info('User login attempt', { address, success, ip, type: 'auth_login' }),
    
    walletConnect: (address: string, success: boolean, ip?: string) => 
      securityLogger.info('Wallet connection', { address, success, ip, type: 'wallet_connect' }),
    
    apiAccess: (address: string, endpoint: string, ip?: string) => 
      securityLogger.info('API access', { address, endpoint, ip, type: 'api_access' })
  },

  // Blockchain Operations
  blockchain: {
    transaction: (chainId: number, hash: string, type: string, status: string) => 
      blockchainLogger.info('Blockchain transaction', { chainId, hash, type, status }),
    
    contractCall: (chainId: number, contract: string, method: string, success: boolean) => 
      blockchainLogger.info('Contract call', { chainId, contract, method, success }),
    
    error: (chainId: number, error: string, context?: any) => 
      blockchainLogger.error('Blockchain error', { chainId, error, context })
  },

  // Bridge Operations
  bridge: {
    initiate: (txId: string, fromChain: number, toChain: number, amount: string, token: string) => 
      bridgeLogger.info('Bridge initiated', { txId, fromChain, toChain, amount, token }),
    
    status: (txId: string, status: string, progress?: number) => 
      bridgeLogger.info('Bridge status update', { txId, status, progress }),
    
    complete: (txId: string, duration: number, fee: string) => 
      bridgeLogger.info('Bridge completed', { txId, duration, fee })
  },

  // Trading Operations
  trading: {
    swap: (user: string, tokenIn: string, tokenOut: string, amountIn: string, amountOut: string) => 
      tradingLogger.info('Token swap', { user, tokenIn, tokenOut, amountIn, amountOut }),
    
    liquidity: (user: string, action: 'add' | 'remove', tokenA: string, tokenB: string, amount: string) => 
      tradingLogger.info('Liquidity operation', { user, action, tokenA, tokenB, amount }),
    
    priceUpdate: (token: string, chainId: number, price: string, volume24h: string) => 
      tradingLogger.info('Price update', { token, chainId, price, volume24h })
  },

  // Performance Monitoring
  performance: {
    apiResponse: (endpoint: string, method: string, duration: number, status: number) => 
      logger.info('API response time', { endpoint, method, duration, status, type: 'performance' }),
    
    dbQuery: (query: string, duration: number, success: boolean) => 
      logger.debug('Database query', { query, duration, success, type: 'db_performance' }),
    
    cacheHit: (key: string, hit: boolean) => 
      logger.debug('Cache access', { key, hit, type: 'cache_performance' })
  }
};

// Export default logger
export default logger;
