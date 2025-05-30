
import { Request, Response } from 'express';
import { TokenService } from '@/services/TokenService';
import { logger } from '@/utils/logger';
import { validationResult } from 'express-validator';

export class TokenController {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  createToken = async (req: Request, res: Response): Promise<void> => {
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
        name,
        symbol,
        totalSupply,
        decimals = 18,
        description,
        logoUrl,
        chainId,
        creator,
        autoLiquidity = false,
        liquidityAmount
      } = req.body;

      const tokenInfo = await this.tokenService.createToken({
        name,
        symbol,
        totalSupply,
        decimals,
        description,
        logoUrl,
        chainId,
        creator,
        autoLiquidity,
        liquidityAmount
      });

      res.status(201).json({
        success: true,
        data: tokenInfo,
        message: 'Token created successfully'
      });
    } catch (error) {
      logger.error('Token creation failed', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: error.message || 'Token creation failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  getToken = async (req: Request, res: Response): Promise<void> => {
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

      const token = await this.tokenService.getToken(address, parseInt(chainId as string));

      if (!token) {
        res.status(404).json({
          success: false,
          error: 'Token not found'
        });
        return;
      }

      res.json({
        success: true,
        data: token
      });
    } catch (error) {
      logger.error('Failed to get token', { error, params: req.params, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to get token',
        timestamp: new Date().toISOString()
      });
    }
  };

  getUserTokens = async (req: Request, res: Response): Promise<void> => {
    try {
      const { creator } = req.params;
      const { chainId } = req.query;

      const tokens = await this.tokenService.getUserTokens(
        creator,
        chainId ? parseInt(chainId as string) : undefined
      );

      res.json({
        success: true,
        data: tokens,
        count: tokens.length
      });
    } catch (error) {
      logger.error('Failed to get user tokens', { error, params: req.params, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to get user tokens',
        timestamp: new Date().toISOString()
      });
    }
  };

  getTokensByChain = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainId } = req.params;
      const { limit = '50' } = req.query;

      const tokens = await this.tokenService.getTokensByChain(
        parseInt(chainId),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: tokens,
        count: tokens.length,
        chainId: parseInt(chainId)
      });
    } catch (error) {
      logger.error('Failed to get tokens by chain', { error, params: req.params, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to get tokens by chain',
        timestamp: new Date().toISOString()
      });
    }
  };

  searchTokens = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query } = req.query;
      const { chainId } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      const tokens = await this.tokenService.searchTokens(
        query,
        chainId ? parseInt(chainId as string) : undefined
      );

      res.json({
        success: true,
        data: tokens,
        count: tokens.length,
        query
      });
    } catch (error) {
      logger.error('Failed to search tokens', { error, query: req.query });
      res.status(500).json({
        success: false,
        error: 'Failed to search tokens',
        timestamp: new Date().toISOString()
      });
    }
  };

  updateTokenMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      const { chainId, volume24h, holders, marketCap } = req.body;

      await this.tokenService.updateTokenMetrics(address, chainId, {
        volume24h,
        holders,
        marketCap
      });

      res.json({
        success: true,
        message: 'Token metrics updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update token metrics', { error, params: req.params, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Failed to update token metrics',
        timestamp: new Date().toISOString()
      });
    }
  };
}
