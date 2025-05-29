
import { ChainService } from '../base/ChainService';
import { ChainConfig, TransactionParams, ChainMetrics } from '@/types/chain.types';
import { ShredsMonitor } from './ShredsMonitor';
import { GigagasOptimizer } from './GigagasOptimizer';
import { logger } from '@/utils/logger';

export class RiseChainService extends ChainService {
  private shredsMonitor: ShredsMonitor;
  private gigagasOptimizer: GigagasOptimizer;
  private ultraFastBlockTime: number = 10; // 10ms blocks

  constructor(chainConfig: ChainConfig) {
    super(chainConfig);
    this.shredsMonitor = new ShredsMonitor(this.provider, this.websocketProvider);
    this.gigagasOptimizer = new GigagasOptimizer();
    this.initializeRiseChainSpecific();
  }

  private async initializeRiseChainSpecific(): Promise<void> {
    try {
      logger.info('Initializing RiseChain-specific features');
      
      // Start Shreds monitoring
      await this.shredsMonitor.startMonitoring();
      
      // Initialize Gigagas optimization
      await this.gigagasOptimizer.initialize();
      
      // Set up ultra-fast block monitoring
      await this.setupUltraFastMonitoring();
    } catch (error) {
      logger.error('Failed to initialize RiseChain-specific features', { error });
    }
  }

  private async setupUltraFastMonitoring(): Promise<void> {
    if (this.websocketProvider) {
      this.websocketProvider.on('block', (blockNumber) => {
        logger.debug(`New RiseChain block: ${blockNumber} (10ms)`);
        this.shredsMonitor.onNewBlock(blockNumber);
      });
    }
  }

  getSpecialFeatures(): string[] {
    return [
      'shreds',
      'parallel_execution',
      'gigagas',
      'ultra_fast_blocks',
      '10ms_block_time',
      '50k_tps',
      'optimistic_rollup'
    ];
  }

  async getOptimizedGasPrice(): Promise<bigint> {
    try {
      const baseGasPrice = await this.provider.getFeeData();
      const currentPrice = baseGasPrice.gasPrice || BigInt(1000000000); // 1 gwei default

      // Apply Gigagas optimization
      const optimizedPrice = await this.gigagasOptimizer.optimizeGasPrice(currentPrice);
      
      logger.debug('RiseChain Gigagas optimized gas price', {
        basePrice: currentPrice.toString(),
        optimizedPrice: optimizedPrice.toString(),
        savings: ((Number(currentPrice - optimizedPrice) / Number(currentPrice)) * 100).toFixed(2) + '%'
      });

      return optimizedPrice;
    } catch (error) {
      logger.error('Error calculating optimized gas price for RiseChain', { error });
      return BigInt(500000); // Ultra-low fallback for RiseChain
    }
  }

  async validateTransaction(params: TransactionParams): Promise<boolean> {
    try {
      // RiseChain-specific validation
      
      // Check if transaction can benefit from parallel execution
      const canUseParallelExecution = await this.canUseParallelExecution(params);
      if (canUseParallelExecution) {
        logger.info('Transaction eligible for parallel execution', { params });
      }

      // Validate using Shreds timing
      const shredsValidation = await this.shredsMonitor.validateTransactionTiming(params);
      if (!shredsValidation.isOptimal) {
        logger.warn('Transaction timing not optimal for Shreds', { 
          params, 
          shredsData: shredsValidation 
        });
      }

      // RiseChain allows higher gas limits due to parallel execution
      if (params.gasLimit && BigInt(params.gasLimit) > BigInt(50000000)) { // 50M gas limit
        throw new Error('Gas limit too high even for RiseChain');
      }

      return true;
    } catch (error) {
      logger.error('RiseChain transaction validation failed', { error, params });
      return false;
    }
  }

  async getChainMetrics(): Promise<ChainMetrics> {
    try {
      const startTime = Date.now();
      const blockNumber = await this.getBlockNumber();
      const rpcLatency = Date.now() - startTime;

      const shredsMetrics = await this.shredsMonitor.getPerformanceMetrics();
      
      return {
        blockHeight: blockNumber,
        lastBlockTime: Date.now(), // Always current for 10ms blocks
        rpcLatency,
        connectionStatus: this.isHealthy ? 'connected' : 'degraded',
        contractStatus: await this.getContractHealthStatus(),
        tps: 50000, // RiseChain's 50K TPS
        avgBlockTime: this.ultraFastBlockTime
      };
    } catch (error) {
      logger.error('Error getting RiseChain metrics', { error });
      throw error;
    }
  }

  private async getContractHealthStatus(): Promise<Record<string, 'healthy' | 'warning' | 'error'>> {
    const contractStatus: Record<string, 'healthy' | 'warning' | 'error'> = {};
    
    try {
      const contracts = this.chainConfig.contracts || {};
      
      for (const [name, address] of Object.entries(contracts)) {
        if (address) {
          try {
            const code = await this.provider.getCode(address);
            contractStatus[name] = code !== '0x' ? 'healthy' : 'error';
          } catch (error) {
            contractStatus[name] = 'error';
          }
        }
      }
    } catch (error) {
      logger.error('Error checking RiseChain contract health', { error });
    }

    return contractStatus;
  }

  private async canUseParallelExecution(params: TransactionParams): Promise<boolean> {
    try {
      if (!params.data) return false;
      
      // Check for parallel-executable methods
      const data = params.data.toLowerCase();
      const parallelMethods = [
        '0xa9059cbb', // transfer
        '0x095ea7b3', // approve
        '0x23b872dd', // transferFrom
        '0x38ed1739', // swapExactTokensForTokens
        '0x8803dbee'  // swapTokensForExactTokens
      ];
      
      return parallelMethods.some(method => data.startsWith(method));
    } catch (error) {
      logger.error('Error checking parallel execution capability', { error, params });
      return false;
    }
  }

  async getUltraFastConfirmation(txHash: string): Promise<boolean> {
    try {
      // RiseChain's 10ms block time allows for ultra-fast confirmations
      const maxWaitTime = 100; // 100ms max wait for multiple confirmations
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitTime) {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        if (receipt && receipt.status === 1) {
          logger.info('Ultra-fast confirmation achieved on RiseChain', { 
            txHash, 
            waitTime: Date.now() - startTime 
          });
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms
      }

      return false;
    } catch (error) {
      logger.error('Error getting ultra-fast confirmation', { error, txHash });
      return false;
    }
  }

  async estimateGigagas(params: TransactionParams): Promise<{
    standardGas: bigint;
    gigagasEstimate: bigint;
    parallelFactor: number;
    savings: string;
  }> {
    try {
      const standardGas = await this.estimateGas(params);
      const parallelFactor = await this.calculateParallelFactor(params);
      const gigagasEstimate = await this.gigagasOptimizer.optimizeGasEstimate(standardGas, parallelFactor);

      const savings = ((Number(standardGas - gigagasEstimate) / Number(standardGas)) * 100).toFixed(2);

      return {
        standardGas,
        gigagasEstimate,
        parallelFactor,
        savings: savings + '%'
      };
    } catch (error) {
      logger.error('Error estimating Gigagas', { error, params });
      throw error;
    }
  }

  private async calculateParallelFactor(params: TransactionParams): Promise<number> {
    try {
      const canUseParallel = await this.canUseParallelExecution(params);
      if (!canUseParallel) return 1;

      // Base parallel factor for RiseChain
      const baseParallelFactor = 10; // 10x improvement from parallel execution
      
      // Adjust based on network congestion
      const blockNumber = await this.getBlockNumber();
      const congestionFactor = await this.shredsMonitor.getCongestionFactor(blockNumber);
      
      return Math.max(1, baseParallelFactor * (2 - congestionFactor));
    } catch (error) {
      logger.error('Error calculating parallel factor', { error, params });
      return 1;
    }
  }

  async getShredsData(): Promise<{
    currentShred: number;
    nextShredTime: number;
    optimalTxTime: number;
    efficiency: number;
  }> {
    return await this.shredsMonitor.getCurrentShredsData();
  }

  async optimizeForShreds(params: TransactionParams): Promise<TransactionParams> {
    const shredsData = await this.getShredsData();
    const optimalGasPrice = await this.getOptimizedGasPrice();

    return {
      ...params,
      gasPrice: optimalGasPrice.toString(),
      // Add shreds-specific optimizations based on current shred timing
    };
  }

  async startRealTimeMonitoring(): Promise<void> {
    await this.shredsMonitor.startMonitoring();
    
    // Subscribe to ultra-fast block updates
    await this.subscribeToBlocks((blockNumber) => {
      logger.debug('New RiseChain block', { blockNumber, timestamp: Date.now() });
    });
  }

  async stopRealTimeMonitoring(): Promise<void> {
    await this.shredsMonitor.stopMonitoring();
    await this.disconnect();
  }

  async getPerformanceMetrics(): Promise<{
    averageBlockTime: number;
    transactionThroughput: number;
    parallelExecutionRatio: number;
    shredsEfficiency: number;
    gigagasSavings: string;
  }> {
    try {
      const shredsMetrics = await this.shredsMonitor.getPerformanceMetrics();
      const gigagasMetrics = await this.gigagasOptimizer.getOptimizationMetrics();
      
      return {
        averageBlockTime: this.ultraFastBlockTime,
        transactionThroughput: 50000, // 50K TPS
        parallelExecutionRatio: shredsMetrics.parallelExecutionRatio,
        shredsEfficiency: shredsMetrics.efficiency,
        gigagasSavings: gigagasMetrics.averageSavings
      };
    } catch (error) {
      logger.error('Error getting RiseChain performance metrics', { error });
      throw error;
    }
  }
}
