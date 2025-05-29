import { ethers } from 'ethers';
import { logger } from '@/utils/logger';

interface ShredsData {
  currentShred: number;
  nextShredTime: number;
  blockHeight: number;
  timestamp: number;
}

interface TransactionTiming {
  isOptimal: boolean;
  recommendation: string;
  waitTime?: number;
  efficiency: number;
}

export class ShredsMonitor {
  private provider: ethers.JsonRpcProvider;
  private websocketProvider?: ethers.WebSocketProvider;
  private shredsHistory: ShredsData[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(
    provider: ethers.JsonRpcProvider, 
    websocketProvider?: ethers.WebSocketProvider
  ) {
    this.provider = provider;
    this.websocketProvider = websocketProvider;
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    logger.info('Starting RiseChain Shreds monitoring');

    // Monitor every 5ms for ultra-fast RiseChain blocks
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectShredsData();
      } catch (error) {
        logger.error('Error collecting Shreds data', { error });
      }
    }, 5);

    // WebSocket monitoring for real-time updates
    if (this.websocketProvider) {
      this.websocketProvider.on('block', async (blockNumber) => {
        await this.handleNewBlock(blockNumber);
      });
    }
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.websocketProvider) {
      this.websocketProvider.removeAllListeners('block');
    }

    logger.info('Stopped RiseChain Shreds monitoring');
  }

  async getCurrentShredsData(): Promise<{
    currentShred: number;
    nextShredTime: number;
    optimalTxTime: number;
  }> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(blockNumber);
      
      if (!block) {
        throw new Error('Could not fetch current block');
      }

      // RiseChain specific Shreds calculation
      const currentShred = this.calculateCurrentShred(block.timestamp);
      const nextShredTime = this.calculateNextShredTime(currentShred);
      const optimalTxTime = this.calculateOptimalTransactionTime(currentShred);

      return {
        currentShred,
        nextShredTime,
        optimalTxTime
      };
    } catch (error) {
      logger.error('Error getting current Shreds data', { error });
      throw error;
    }
  }

  async validateTransactionTiming(params: any): Promise<TransactionTiming> {
    try {
      const shredsData = await this.getCurrentShredsData();
      const currentTime = Date.now();
      
      // Calculate if current timing is optimal for Shreds
      const timeToNextShred = shredsData.nextShredTime - currentTime;
      const isOptimal = timeToNextShred > 5 && timeToNextShred < 15; // 5-15ms window
      
      let recommendation = '';
      let waitTime: number | undefined;
      
      if (!isOptimal) {
        if (timeToNextShred <= 5) {
          recommendation = 'Wait for next Shred cycle for optimal execution';
          waitTime = shredsData.nextShredTime - currentTime + 10; // Wait + buffer
        } else {
          recommendation = 'Execute immediately - good timing window';
        }
      } else {
        recommendation = 'Optimal timing - execute now';
      }

      const efficiency = this.calculateTimingEfficiency(timeToNextShred);

      return {
        isOptimal,
        recommendation,
        waitTime,
        efficiency
      };
    } catch (error) {
      logger.error('Error validating transaction timing', { error, params });
      return {
        isOptimal: false,
        recommendation: 'Unable to optimize timing - execute with standard settings',
        efficiency: 0.5
      };
    }
  }

  async getCongestionFactor(blockNumber?: number): Promise<number> {
    try {
      const targetBlock = blockNumber || await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(targetBlock, true);
      
      if (!block || !block.transactions) {
        return 0.5; // Medium congestion as fallback
      }

      const transactionCount = block.transactions.length;
      const blockGasUsed = block.gasUsed;
      const blockGasLimit = block.gasLimit;
      
      // Calculate congestion based on gas usage and transaction count
      const gasUtilization = Number(blockGasUsed) / Number(blockGasLimit);
      const txDensity = transactionCount / 1000; // Normalize to expected max
      
      const congestionFactor = Math.min((gasUtilization + txDensity) / 2, 1);
      
      logger.debug('Calculated congestion factor', {
        blockNumber: targetBlock,
        transactionCount,
        gasUtilization,
        congestionFactor
      });

      return congestionFactor;
    } catch (error) {
      logger.error('Error calculating congestion factor', { error, blockNumber });
      return 0.5;
    }
  }

  async getPerformanceMetrics(): Promise<{
    parallelExecutionRatio: number;
    efficiency: number;
    averageShredTime: number;
    blockProductionRate: number;
  }> {
    try {
      if (this.shredsHistory.length < 10) {
        // Not enough data yet
        return {
          parallelExecutionRatio: 0.8, // Default estimate
          efficiency: 0.9,
          averageShredTime: 10,
          blockProductionRate: 100 // blocks per second
        };
      }

      const recentShreds = this.shredsHistory.slice(-100); // Last 100 data points
      const totalTime = recentShreds[recentShreds.length - 1].timestamp - recentShreds[0].timestamp;
      const averageShredTime = totalTime / recentShreds.length;
      
      // Calculate parallel execution ratio based on block complexity
      const parallelExecutionRatio = this.calculateParallelExecutionRatio(recentShreds);
      
      // Calculate overall efficiency
      const efficiency = this.calculateOverallEfficiency(recentShreds);
      
      // Block production rate
      const blockProductionRate = 1000 / averageShredTime; // blocks per second

      return {
        parallelExecutionRatio,
        efficiency,
        averageShredTime,
        blockProductionRate
      };
    } catch (error) {
      logger.error('Error getting performance metrics', { error });
      throw error;
    }
  }

  private async collectShredsData(): Promise<void> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(blockNumber);
      
      if (!block) return;

      const shredsData: ShredsData = {
        currentShred: this.calculateCurrentShred(block.timestamp),
        nextShredTime: Date.now() + 10, // Next shred in ~10ms
        blockHeight: blockNumber,
        timestamp: Date.now()
      };

      this.shredsHistory.push(shredsData);
      
      // Keep only recent history (last 1000 entries)
      if (this.shredsHistory.length > 1000) {
        this.shredsHistory = this.shredsHistory.slice(-500);
      }

    } catch (error) {
      logger.error('Error collecting Shreds data', { error });
    }
  }

  private async handleNewBlock(blockNumber: number): Promise<void> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block) return;

      logger.debug('New RiseChain block processed', {
        blockNumber,
        transactionCount: block.transactions?.length || 0,
        gasUsed: block.gasUsed.toString(),
        timestamp: Date.now()
      });

      // Analyze block for Shreds optimization opportunities
      await this.analyzeBlockForOptimizations(block);

    } catch (error) {
      logger.error('Error handling new block', { error, blockNumber });
    }
  }

  private calculateCurrentShred(blockTimestamp: number): number {
    // RiseChain Shreds calculation - simplified
    // In production, this would use actual RiseChain Shreds algorithm
    return Math.floor(blockTimestamp / 10); // 10ms shreds
  }

  private calculateNextShredTime(currentShred: number): number {
    return (currentShred + 1) * 10; // Next 10ms boundary
  }

  private calculateOptimalTransactionTime(currentShred: number): number {
    // Optimal time is usually at the beginning of a shred cycle
    return currentShred * 10 + 2; // 2ms into the shred
  }

  private calculateTimingEfficiency(timeToNextShred: number): number {
    // Efficiency is highest when submitting at the right time in the shred cycle
    if (timeToNextShred >= 5 && timeToNextShred <= 15) {
      return 1.0; // Perfect timing
    } else if (timeToNextShred >= 0 && timeToNextShred <= 25) {
      return 0.8; // Good timing
    } else {
      return 0.5; // Suboptimal timing
    }
  }

  private calculateParallelExecutionRatio(shredsData: ShredsData[]): number {
    // Estimate parallel execution ratio based on block processing patterns
    // This is a simplified calculation
    const avgBlockTime = shredsData.reduce((sum, shred, index) => {
      if (index === 0) return sum;
      return sum + (shred.timestamp - shredsData[index - 1].timestamp);
    }, 0) / (shredsData.length - 1);

    // If blocks are being processed faster than 10ms, parallel execution is working well
    const parallelRatio = Math.min(10 / avgBlockTime, 1);
    return Math.max(parallelRatio, 0.5); // Minimum 50% parallel execution
  }

  private calculateOverallEfficiency(shredsData: ShredsData[]): number {
    // Calculate efficiency based on consistent block production
    const targetBlockTime = 10; // 10ms target
    const actualTimes = shredsData.map((shred, index) => {
      if (index === 0) return targetBlockTime;
      return shred.timestamp - shredsData[index - 1].timestamp;
    });

    const variance = actualTimes.reduce((sum, time) => {
      return sum + Math.pow(time - targetBlockTime, 2);
    }, 0) / actualTimes.length;

    // Lower variance = higher efficiency
    const efficiency = Math.max(1 - (variance / 100), 0.1);
    return Math.min(efficiency, 1);
  }

  private async analyzeBlockForOptimizations(block: ethers.Block): Promise<void> {
    // Analyze block patterns for future optimization recommendations
    if (!block.transactions) return;

    const transactionCount = block.transactions.length;
    const gasUtilization = Number(block.gasUsed) / Number(block.gasLimit);

    if (transactionCount > 500 || gasUtilization > 0.8) {
      logger.info('High activity block detected', {
        blockNumber: block.number,
        transactionCount,
        gasUtilization,
        recommendation: 'Consider increasing parallel execution parameters'
      });
    }
  }
}
