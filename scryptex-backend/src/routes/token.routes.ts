
import { Router } from 'express';
import { TokenController } from '@/controllers/TokenController';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';

const router = Router();
const tokenController = new TokenController();

// Token creation validation
const createTokenValidation = [
  body('name').notEmpty().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('symbol').notEmpty().isLength({ min: 1, max: 10 }).withMessage('Symbol must be 1-10 characters'),
  body('totalSupply').notEmpty().isNumeric().withMessage('Total supply must be a number'),
  body('decimals').optional().isInt({ min: 0, max: 18 }).withMessage('Decimals must be 0-18'),
  body('chainId').isInt().withMessage('Chain ID must be an integer'),
  body('creator').isEthereumAddress().withMessage('Invalid creator address'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('logoUrl').optional().isURL().withMessage('Invalid logo URL'),
  body('autoLiquidity').optional().isBoolean().withMessage('Auto liquidity must be boolean'),
  body('liquidityAmount').optional().isNumeric().withMessage('Liquidity amount must be numeric')
];

// Get token validation
const getTokenValidation = [
  param('address').isEthereumAddress().withMessage('Invalid token address'),
  query('chainId').isInt().withMessage('Chain ID must be an integer')
];

// User tokens validation
const getUserTokensValidation = [
  param('creator').isEthereumAddress().withMessage('Invalid creator address'),
  query('chainId').optional().isInt().withMessage('Chain ID must be an integer')
];

// Chain tokens validation
const getChainTokensValidation = [
  param('chainId').isInt().withMessage('Chain ID must be an integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
];

// Search validation
const searchTokensValidation = [
  query('q').notEmpty().isLength({ min: 1, max: 50 }).withMessage('Query must be 1-50 characters'),
  query('chainId').optional().isInt().withMessage('Chain ID must be an integer')
];

// Update metrics validation
const updateMetricsValidation = [
  param('address').isEthereumAddress().withMessage('Invalid token address'),
  body('chainId').isInt().withMessage('Chain ID must be an integer'),
  body('volume24h').optional().isNumeric().withMessage('Volume must be numeric'),
  body('holders').optional().isInt({ min: 0 }).withMessage('Holders must be non-negative integer'),
  body('marketCap').optional().isNumeric().withMessage('Market cap must be numeric')
];

// Routes
router.post(
  '/create',
  rateLimitMiddleware(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  authMiddleware,
  createTokenValidation,
  tokenController.createToken
);

router.get(
  '/:address',
  rateLimitMiddleware(100, 60 * 1000), // 100 requests per minute
  getTokenValidation,
  tokenController.getToken
);

router.get(
  '/user/:creator',
  rateLimitMiddleware(50, 60 * 1000), // 50 requests per minute
  getUserTokensValidation,
  tokenController.getUserTokens
);

router.get(
  '/chain/:chainId',
  rateLimitMiddleware(50, 60 * 1000), // 50 requests per minute
  getChainTokensValidation,
  tokenController.getTokensByChain
);

router.get(
  '/search',
  rateLimitMiddleware(20, 60 * 1000), // 20 requests per minute
  searchTokensValidation,
  tokenController.searchTokens
);

router.put(
  '/:address/metrics',
  rateLimitMiddleware(10, 60 * 1000), // 10 requests per minute
  authMiddleware,
  updateMetricsValidation,
  tokenController.updateTokenMetrics
);

export default router;
