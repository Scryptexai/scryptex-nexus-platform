
import { Request, Response } from 'express';
import { TradingService } from '@/services/TradingService';
import { logger } from '@/utils/logger';
import { validationResult } from 'express-validator';

export class TradingController {
  private tradingService: TradingService;

  constructor() {
    this.tradingService = new TradingService();
  }

  getSwapQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { chainId, tokenIn, tokenOut, amountIn } = req.body;

      const quote = await this.tradingService.getSwapQuote({
        chainId,
        tokenIn,
        tokenOut,
        amountIn
      });

      res.json({
        success: true,
        data: quote,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get swap quote', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get swap quote',
        timestamp: new Date().toISOString()
      });
    }
  };

  executeSwap = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const {
        chainId,
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        recipient,
        deadline
      } = req.body;

      const result = await this.tradingService.executeSwap({
        chainId,
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        recipient,
        deadline
      });

      res.json({
        success: true,
        data: result,
        message: 'Swap executed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to execute swap', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute swap',
        timestamp: new Date().toISOString()
      });
    }
  };

  addLiquidity = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const {
        chainId,
        tokenA,
        tokenB,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        recipient,
        deadline
      } = req.body;

      const result = await this.tradingService.addLiquidity({
        chainId,
        tokenA,
        tokenB,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        recipient,
        deadline
      });

      res.json({
        success: true,
        data: result,
        message: 'Liquidity added successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to add liquidity', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add liquidity',
        timestamp: new Date().toISOString()
      });
    }
  };

  getTradingPairs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainId } = req.query;

      const pairs = await this.tradingService.getTradingPairs(
        chainId ? parseInt(chainId as string) : undefined
      );

      res.json({
        success: true,
        data: pairs,
        count: pairs.length,
        chainId: chainId ? parseInt(chainId as string) : 'all'
      });
    } catch (error) {
      logger.error('Failed to get trading pairs', { error, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to get trading pairs',
        timestamp: new Date().toISOString()
      });
    }
  };

  getTradingPair = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenA, tokenB } = req.params;
      const { chainId } = req.query;

      if (!chainId) {
        res.status(400).json({
          success: false,
          error: 'Chain ID is required'
        });
        return;
      }

      const pair = await this.tradingService.getTradingPair(
        tokenA,
        tokenB,
        parseInt(chainId as string)
      );

      if (!pair) {
        res.status(404).json({
          success: false,
          error: 'Trading pair not found'
        });
        return;
      }

      res.json({
        success: true,
        data: pair
      });
    } catch (error) {
      logger.error('Failed to get trading pair', { error, params: req.params, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to get trading pair',
        timestamp: new Date().toISOString()
      });
    }
  };

  getTokenPrice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      const { chainId } = req.query;

      if (!chainId) {
        res.status(400).json({
          success: false,
          error: 'Chain ID is required'
        });
        return;
      }

      // Find trading pair with native token or stable coin
      const nativeToken = '0x0000000000000000000000000000000000000000';
      const pair = await this.tradingService.getTradingPair(
        address,
        nativeToken,
        parseInt(chainId as string)
      );

      if (!pair) {
        res.status(404).json({
          success: false,
          error: 'Price data not available'
        });
        return;
      }

      // Calculate price based on reserves
      const price = parseFloat(pair.reserveA) / parseFloat(pair.reserveB);
      const priceChange24h = (Math.random() - 0.5) * 20; // Mock 24h change

      res.json({
        success: true,
        data: {
          price: price.toString(),
          priceChange24h: priceChange24h.toFixed(2)
        }
      });
    } catch (error) {
      logger.error('Failed to get token price', { error, params: req.params, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to get token price',
        timestamp: new Date().toISOString()
      });
    }
  };
}
