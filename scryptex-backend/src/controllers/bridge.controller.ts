
import { Request, Response } from 'express';
import { BridgeService } from '@/services/bridge.service';
import { logger } from '@/utils/logger';
import { validateAddress, validateChainId } from '@/utils/validation.utils';

export class BridgeController {
  private bridgeService: BridgeService;

  constructor() {
    this.bridgeService = new BridgeService();
  }

  async getQuote(req: Request, res: Response): Promise<void> {
    try {
      const { fromChain, toChain, fromToken, toToken, amount } = req.body;

      // Validate inputs
      if (!validateChainId(fromChain) || !validateChainId(toChain)) {
        res.status(400).json({
          success: false,
          error: 'Invalid chain ID'
        });
        return;
      }

      if (!validateAddress(fromToken) || !validateAddress(toToken)) {
        res.status(400).json({
          success: false,
          error: 'Invalid token address'
        });
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
        return;
      }

      const quote = await this.bridgeService.getBridgeQuote({
        fromChain: parseInt(fromChain),
        toChain: parseInt(toChain),
        fromToken,
        toToken,
        amount
      });

      res.json({
        success: true,
        data: quote
      });

    } catch (error) {
      logger.error('Error in getQuote', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async executeBridge(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, fromChain, toChain, fromToken, toToken, amount, recipient, slippage } = req.body;

      // Validate required inputs
      if (!validateAddress(userAddress)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user address'
        });
        return;
      }

      if (!validateChainId(fromChain) || !validateChainId(toChain)) {
        res.status(400).json({
          success: false,
          error: 'Invalid chain ID'
        });
        return;
      }

      if (!validateAddress(fromToken)) {
        res.status(400).json({
          success: false,
          error: 'Invalid token address'
        });
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
        return;
      }

      // Validate recipient if provided
      if (recipient && !validateAddress(recipient)) {
        res.status(400).json({
          success: false,
          error: 'Invalid recipient address'
        });
        return;
      }

      const bridgeId = await this.bridgeService.executeBridge({
        userAddress,
        fromChain: parseInt(fromChain),
        toChain: parseInt(toChain),
        fromToken,
        toToken,
        amount,
        recipient,
        slippage: slippage ? parseFloat(slippage) : undefined
      });

      res.json({
        success: true,
        data: {
          bridgeId,
          message: 'Bridge transaction initiated successfully'
        }
      });

    } catch (error) {
      logger.error('Error in executeBridge', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getBridgeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { bridgeId } = req.params;

      if (!bridgeId) {
        res.status(400).json({
          success: false,
          error: 'Bridge ID is required'
        });
        return;
      }

      const status = await this.bridgeService.getBridgeStatus(bridgeId);

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      logger.error('Error in getBridgeStatus', { error, bridgeId: req.params.bridgeId });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getBridgeHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress } = req.params;
      const { limit } = req.query;

      if (!validateAddress(userAddress)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user address'
        });
        return;
      }

      const limitNumber = limit ? parseInt(limit as string) : 50;
      if (limitNumber > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit cannot exceed 100'
        });
        return;
      }

      const history = await this.bridgeService.getBridgeHistory(userAddress, limitNumber);

      res.json({
        success: true,
        data: history
      });

    } catch (error) {
      logger.error('Error in getBridgeHistory', { error, userAddress: req.params.userAddress });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getSupportedChains(req: Request, res: Response): Promise<void> {
    try {
      const chains = await this.bridgeService.getSupportedChains();

      res.json({
        success: true,
        data: chains
      });

    } catch (error) {
      logger.error('Error in getSupportedChains', { error });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getBridgeVolume(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe } = req.query;
      
      const validTimeframes = ['24h', '7d', '30d'];
      const selectedTimeframe = validTimeframes.includes(timeframe as string) 
        ? (timeframe as '24h' | '7d' | '30d') 
        : '24h';

      const volume = await this.bridgeService.getBridgeVolume(selectedTimeframe);

      res.json({
        success: true,
        data: {
          timeframe: selectedTimeframe,
          ...volume
        }
      });

    } catch (error) {
      logger.error('Error in getBridgeVolume', { error, timeframe: req.query.timeframe });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getBridgeRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { fromChain, toChain } = req.query;

      if (!fromChain || !toChain) {
        res.status(400).json({
          success: false,
          error: 'Both fromChain and toChain are required'
        });
        return;
      }

      if (!validateChainId(parseInt(fromChain as string)) || !validateChainId(parseInt(toChain as string))) {
        res.status(400).json({
          success: false,
          error: 'Invalid chain ID'
        });
        return;
      }

      // For now, return available routes based on our bridge configuration
      const routes = [
        {
          path: [parseInt(fromChain as string), parseInt(toChain as string)],
          estimatedTime: 120, // 2 minutes average
          totalFees: '0.001',
          confidence: 95
        }
      ];

      res.json({
        success: true,
        data: routes
      });

    } catch (error) {
      logger.error('Error in getBridgeRoutes', { error, query: req.query });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async estimateBridgeFee(req: Request, res: Response): Promise<void> {
    try {
      const { fromChain, toChain, token, amount } = req.body;

      if (!validateChainId(fromChain) || !validateChainId(toChain)) {
        res.status(400).json({
          success: false,
          error: 'Invalid chain ID'
        });
        return;
      }

      if (!validateAddress(token)) {
        res.status(400).json({
          success: false,
          error: 'Invalid token address'
        });
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
        return;
      }

      const quote = await this.bridgeService.getBridgeQuote({
        fromChain,
        toChain,
        fromToken: token,
        toToken: token,
        amount
      });

      res.json({
        success: true,
        data: {
          bridgeFee: quote.bridgeFee,
          gasEstimate: quote.gasEstimate,
          totalCost: (parseFloat(quote.bridgeFee) + parseFloat(quote.gasEstimate)).toString()
        }
      });

    } catch (error) {
      logger.error('Error in estimateBridgeFee', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
