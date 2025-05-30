
import { ChainRegistryService } from './ChainRegistryService';
import { logger } from '@/utils/logger';
import { ethers } from 'ethers';

export interface SwapParams {
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  recipient: string;
  deadline: number;
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: string;
  minimumAmountOut: string;
  route: string[];
  gasEstimate: string;
  fee: string;
}

export interface LiquidityParams {
  chainId: number;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  amountAMin: string;
  amountBMin: string;
  recipient: string;
  deadline: number;
}

export interface LiquidityPosition {
  id: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  shares: string;
  chainId: number;
  createdAt: Date;
}

export interface TradingPair {
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  price: string;
  volume24h: string;
  fee: string;
  chainId: number;
}

export class TradingService {
  private chainRegistry: ChainRegistryService;
  private readonly TRADING_FEE = 30; // 0.3%
  private readonly FEE_DENOMINATOR = 10000;

  constructor() {
    this.chainRegistry = new ChainRegistryService();
  }

  async getSwapQuote(params: Omit<SwapParams, 'amountOutMin' | 'recipient' | 'deadline'>): Promise<SwapQuote> {
    try {
      logger.info('Getting swap quote', { 
        chainId: params.chainId,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn
      });

      const chainService = this.chainRegistry.getChainService(params.chainId);
      if (!chainService) {
        throw new Error(`Chain ${params.chainId} not supported`);
      }

      // Get trading pair reserves
      const pair = await this.getTradingPair(params.tokenIn, params.tokenOut, params.chainId);
      if (!pair) {
        throw new Error('Trading pair not found');
      }

      // Calculate amount out using constant product formula
      const amountOut = this.calculateAmountOut(
        params.amountIn,
        pair.reserveA,
        pair.reserveB
      );

      // Calculate price impact
      const priceImpact = this.calculatePriceImpact(
        params.amountIn,
        amountOut,
        pair.reserveA,
        pair.reserveB
      );

      // Calculate minimum amount out with slippage
      const minimumAmountOut = this.calculateMinimumAmountOut(amountOut, 0.5); // 0.5% slippage

      // Estimate gas
      const gasEstimate = await this.estimateSwapGas(params, chainService);

      // Calculate fee
      const fee = this.calculateTradingFee(params.amountIn);

      return {
        amountOut,
        priceImpact: priceImpact.toString(),
        minimumAmountOut,
        route: [params.tokenIn, params.tokenOut],
        gasEstimate,
        fee
      };
    } catch (error) {
      logger.error('Failed to get swap quote', { error, params });
      throw new Error(`Swap quote failed: ${error.message}`);
    }
  }

  async executeSwap(params: SwapParams): Promise<{ transactionHash: string }> {
    try {
      logger.info('Executing swap', { 
        chainId: params.chainId,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn
      });

      const chainService = this.chainRegistry.getChainService(params.chainId);
      if (!chainService) {
        throw new Error(`Chain ${params.chainId} not supported`);
      }

      // Get DEX router contract address
      const routerAddress = await this.getDEXRouterAddress(params.chainId);

      // Create swap transaction
      const swapTx = {
        to: routerAddress,
        data: this.encodeSwapTransaction(params),
        value: this.isNativeToken(params.tokenIn) ? params.amountIn : '0',
        gasLimit: '300000'
      };

      // Execute transaction
      const result = await chainService.sendTransaction(swapTx);
      
      if (result.status !== 'confirmed') {
        throw new Error('Swap transaction failed');
      }

      logger.info('Swap executed successfully', { 
        txHash: result.hash,
        chainId: params.chainId 
      });

      return { transactionHash: result.hash };
    } catch (error) {
      logger.error('Failed to execute swap', { error, params });
      throw new Error(`Swap execution failed: ${error.message}`);
    }
  }

  async addLiquidity(params: LiquidityParams): Promise<{ transactionHash: string; liquidityTokens: string }> {
    try {
      logger.info('Adding liquidity', { 
        chainId: params.chainId,
        tokenA: params.tokenA,
        tokenB: params.tokenB,
        amountA: params.amountA,
        amountB: params.amountB
      });

      const chainService = this.chainRegistry.getChainService(params.chainId);
      if (!chainService) {
        throw new Error(`Chain ${params.chainId} not supported`);
      }

      // Get DEX router contract address
      const routerAddress = await this.getDEXRouterAddress(params.chainId);

      // Create add liquidity transaction
      const liquidityTx = {
        to: routerAddress,
        data: this.encodeAddLiquidityTransaction(params),
        value: this.calculateNativeValue(params),
        gasLimit: '400000'
      };

      // Execute transaction
      const result = await chainService.sendTransaction(liquidityTx);
      
      if (result.status !== 'confirmed') {
        throw new Error('Add liquidity transaction failed');
      }

      // Extract liquidity tokens from transaction receipt
      const liquidityTokens = await this.extractLiquidityTokens(result.hash, chainService);

      logger.info('Liquidity added successfully', { 
        txHash: result.hash,
        liquidityTokens,
        chainId: params.chainId 
      });

      return { 
        transactionHash: result.hash,
        liquidityTokens 
      };
    } catch (error) {
      logger.error('Failed to add liquidity', { error, params });
      throw new Error(`Add liquidity failed: ${error.message}`);
    }
  }

  async getTradingPairs(chainId?: number): Promise<TradingPair[]> {
    try {
      // In a real implementation, this would query the DEX contracts
      // For now, return mock data
      const mockPairs: TradingPair[] = [
        {
          tokenA: '0x0000000000000000000000000000000000000000', // ETH
          tokenB: '0x1234567890123456789012345678901234567890', // Mock USDC
          reserveA: ethers.parseEther('100').toString(),
          reserveB: ethers.parseEther('245000').toString(), // $2450 per ETH
          price: '2450',
          volume24h: ethers.parseEther('1000').toString(),
          fee: '0.3',
          chainId: chainId || 11155111
        }
      ];

      return chainId ? mockPairs.filter(pair => pair.chainId === chainId) : mockPairs;
    } catch (error) {
      logger.error('Failed to get trading pairs', { error, chainId });
      return [];
    }
  }

  async getTradingPair(tokenA: string, tokenB: string, chainId: number): Promise<TradingPair | null> {
    try {
      const pairs = await this.getTradingPairs(chainId);
      return pairs.find(pair => 
        (pair.tokenA === tokenA && pair.tokenB === tokenB) ||
        (pair.tokenA === tokenB && pair.tokenB === tokenA)
      ) || null;
    } catch (error) {
      logger.error('Failed to get trading pair', { error, tokenA, tokenB, chainId });
      return null;
    }
  }

  private calculateAmountOut(amountIn: string, reserveIn: string, reserveOut: string): string {
    try {
      const amountInBN = BigInt(amountIn);
      const reserveInBN = BigInt(reserveIn);
      const reserveOutBN = BigInt(reserveOut);

      // Apply trading fee
      const amountInWithFee = amountInBN * BigInt(this.FEE_DENOMINATOR - this.TRADING_FEE) / BigInt(this.FEE_DENOMINATOR);
      
      // Constant product formula: x * y = k
      const numerator = amountInWithFee * reserveOutBN;
      const denominator = reserveInBN + amountInWithFee;
      
      return (numerator / denominator).toString();
    } catch (error) {
      logger.error('Failed to calculate amount out', { error, amountIn, reserveIn, reserveOut });
      return '0';
    }
  }

  private calculatePriceImpact(amountIn: string, amountOut: string, reserveIn: string, reserveOut: string): number {
    try {
      const currentPrice = Number(reserveOut) / Number(reserveIn);
      const newPrice = (Number(reserveOut) - Number(amountOut)) / (Number(reserveIn) + Number(amountIn));
      
      return Math.abs((newPrice - currentPrice) / currentPrice) * 100;
    } catch (error) {
      logger.error('Failed to calculate price impact', { error });
      return 0;
    }
  }

  private calculateMinimumAmountOut(amountOut: string, slippage: number): string {
    try {
      const amountOutBN = BigInt(amountOut);
      const slippageBN = BigInt(Math.floor(slippage * 100)); // Convert to basis points
      
      return (amountOutBN * (BigInt(10000) - slippageBN) / BigInt(10000)).toString();
    } catch (error) {
      logger.error('Failed to calculate minimum amount out', { error, amountOut, slippage });
      return amountOut;
    }
  }

  private calculateTradingFee(amountIn: string): string {
    try {
      const amountInBN = BigInt(amountIn);
      return (amountInBN * BigInt(this.TRADING_FEE) / BigInt(this.FEE_DENOMINATOR)).toString();
    } catch (error) {
      logger.error('Failed to calculate trading fee', { error, amountIn });
      return '0';
    }
  }

  private async estimateSwapGas(params: any, chainService: any): Promise<string> {
    try {
      // Simple gas estimation for swaps
      return '200000'; // 200k gas units
    } catch (error) {
      logger.error('Failed to estimate swap gas', { error });
      return '300000'; // Safe default
    }
  }

  private async getDEXRouterAddress(chainId: number): Promise<string> {
    const chainService = this.chainRegistry.getChainService(chainId);
    if (!chainService) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    const envKey = `${chainService.config.name.toUpperCase()}_DEX_ROUTER`;
    const routerAddress = process.env[envKey];
    
    if (!routerAddress) {
      throw new Error(`DEX router not deployed on ${chainService.config.name}`);
    }

    return routerAddress;
  }

  private encodeSwapTransaction(params: SwapParams): string {
    try {
      const iface = new ethers.Interface([
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) external returns (uint[] amounts)',
        'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) external payable returns (uint[] amounts)',
        'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) external returns (uint[] amounts)'
      ]);

      const path = [params.tokenIn, params.tokenOut];

      if (this.isNativeToken(params.tokenIn)) {
        return iface.encodeFunctionData('swapExactETHForTokens', [
          params.amountOutMin,
          path,
          params.recipient,
          params.deadline
        ]);
      } else if (this.isNativeToken(params.tokenOut)) {
        return iface.encodeFunctionData('swapExactTokensForETH', [
          params.amountIn,
          params.amountOutMin,
          path,
          params.recipient,
          params.deadline
        ]);
      } else {
        return iface.encodeFunctionData('swapExactTokensForTokens', [
          params.amountIn,
          params.amountOutMin,
          path,
          params.recipient,
          params.deadline
        ]);
      }
    } catch (error) {
      logger.error('Failed to encode swap transaction', { error, params });
      throw error;
    }
  }

  private encodeAddLiquidityTransaction(params: LiquidityParams): string {
    try {
      const iface = new ethers.Interface([
        'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
        'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)'
      ]);

      if (this.isNativeToken(params.tokenA) || this.isNativeToken(params.tokenB)) {
        const token = this.isNativeToken(params.tokenA) ? params.tokenB : params.tokenA;
        const amountTokenDesired = this.isNativeToken(params.tokenA) ? params.amountB : params.amountA;
        const amountTokenMin = this.isNativeToken(params.tokenA) ? params.amountBMin : params.amountAMin;
        const amountETHMin = this.isNativeToken(params.tokenA) ? params.amountAMin : params.amountBMin;

        return iface.encodeFunctionData('addLiquidityETH', [
          token,
          amountTokenDesired,
          amountTokenMin,
          amountETHMin,
          params.recipient,
          params.deadline
        ]);
      } else {
        return iface.encodeFunctionData('addLiquidity', [
          params.tokenA,
          params.tokenB,
          params.amountA,
          params.amountB,
          params.amountAMin,
          params.amountBMin,
          params.recipient,
          params.deadline
        ]);
      }
    } catch (error) {
      logger.error('Failed to encode add liquidity transaction', { error, params });
      throw error;
    }
  }

  private calculateNativeValue(params: LiquidityParams): string {
    if (this.isNativeToken(params.tokenA)) {
      return params.amountA;
    } else if (this.isNativeToken(params.tokenB)) {
      return params.amountB;
    }
    return '0';
  }

  private async extractLiquidityTokens(txHash: string, chainService: any): Promise<string> {
    try {
      // In a real implementation, this would parse the transaction receipt
      // to extract the actual liquidity tokens minted
      return ethers.parseEther('1').toString(); // Mock value
    } catch (error) {
      logger.error('Failed to extract liquidity tokens', { error, txHash });
      return '0';
    }
  }

  private isNativeToken(address: string): boolean {
    return address === '0x0000000000000000000000000000000000000000' || 
           address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  }
}
