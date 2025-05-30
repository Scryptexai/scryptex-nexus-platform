
import { Router } from 'express';
import { TradingController } from '@/controllers/TradingController';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '@/middleware/auth.middleware';
import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';

const router = Router();
const tradingController = new TradingController();

// Swap quote validation
const swapQuoteValidation = [
  body('chainId').isInt().withMessage('Chain ID must be an integer'),
  body('tokenIn').isEthereumAddress().withMessage('Invalid token in address'),
  body('tokenOut').isEthereumAddress().withMessage('Invalid token out address'),
  body('amountIn').isNumeric().withMessage('Amount in must be numeric')
];

// Execute swap validation
const executeSwapValidation = [
  body('chainId').isInt().withMessage('Chain ID must be an integer'),
  body('tokenIn').isEthereumAddress().withMessage('Invalid token in address'),
  body('tokenOut').isEthereumAddress().withMessage('Invalid token out address'),
  body('amountIn').isNumeric().withMessage('Amount in must be numeric'),
  body('amountOutMin').isNumeric().withMessage('Amount out min must be numeric'),
  body('recipient').isEthereumAddress().withMessage('Invalid recipient address'),
  body('deadline').isInt({ min: 1 }).withMessage('Deadline must be a positive integer')
];

// Add liquidity validation
const addLiquidityValidation = [
  body('chainId').isInt().withMessage('Chain ID must be an integer'),
  body('tokenA').isEthereumAddress().withMessage('Invalid token A address'),
  body('tokenB').isEthereumAddress().withMessage('Invalid token B address'),
  body('amountA').isNumeric().withMessage('Amount A must be numeric'),
  body('amountB').isNumeric().withMessage('Amount B must be numeric'),
  body('amountAMin').isNumeric().withMessage('Amount A min must be numeric'),
  body('amountBMin').isNumeric().withMessage('Amount B min must be numeric'),
  body('recipient').isEthereumAddress().withMessage('Invalid recipient address'),
  body('deadline').isInt({ min: 1 }).withMessage('Deadline must be a positive integer')
];

// Trading pair validation
const tradingPairValidation = [
  param('tokenA').isEthereumAddress().withMessage('Invalid token A address'),
  param('tokenB').isEthereumAddress().withMessage('Invalid token B address'),
  query('chainId').isInt().withMessage('Chain ID must be an integer')
];

// Token price validation
const tokenPriceValidation = [
  param('address').isEthereumAddress().withMessage('Invalid token address'),
  query('chainId').isInt().withMessage('Chain ID must be an integer')
];

// Routes
router.post(
  '/quote',
  rateLimitMiddleware(100, 60 * 1000), // 100 requests per minute
  swapQuoteValidation,
  tradingController.getSwapQuote
);

router.post(
  '/swap',
  rateLimitMiddleware(10, 60 * 1000), // 10 swaps per minute
  authMiddleware,
  executeSwapValidation,
  tradingController.executeSwap
);

router.post(
  '/liquidity',
  rateLimitMiddleware(5, 60 * 1000), // 5 liquidity operations per minute
  authMiddleware,
  addLiquidityValidation,
  tradingController.addLiquidity
);

router.get(
  '/pairs',
  rateLimitMiddleware(50, 60 * 1000), // 50 requests per minute
  query('chainId').optional().isInt().withMessage('Chain ID must be an integer'),
  tradingController.getTradingPairs
);

router.get(
  '/pair/:tokenA/:tokenB',
  rateLimitMiddleware(100, 60 * 1000), // 100 requests per minute
  tradingPairValidation,
  tradingController.getTradingPair
);

router.get(
  '/price/:address',
  rateLimitMiddleware(100, 60 * 1000), // 100 requests per minute
  tokenPriceValidation,
  tradingController.getTokenPrice
);

export default router;
