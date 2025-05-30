
import { EVMChainService } from '../base/ChainService';
import { ChainConfig, ChainMetrics, TransactionParams, TransactionResult } from '@/types/chain.types';
import { IceDBConnector } from './IceDBConnector';
import { GamingOptimizer } from './GamingOptimizer';
import { logger } from '@/utils/logger';
import { ethers } from 'ethers';

export class SomniaService extends EVMChainService {
  private iceDBConnector: IceDBConnector;
  private gamingOptimizer: GamingOptimizer;
  private lastMetricsUpdate: number = 0;

  constructor(config: ChainConfig) {
    super(config);
    this.iceDBConnector = new IceDBConnector(config);
    this.gamingOptimizer = new GamingOptimizer(this.provider, this.iceDBConnector);
    this.initializeGamingFeatures();
  }

  private async initializeGamingFeatures(): Promise<void> {
    try {
      await this.iceDBConnector.initialize();
      await this.gamingOptimizer.initialize();
      logger.info('Somnia gaming features initialized', { chainId: this.config.chainId });
    } catch (error) {
      logger.error('Failed to initialize Somnia gaming features', { error, chainId: this.config.chainId });
    }
  }

  async sendTransaction(params: TransactionParams): Promise<TransactionResult> {
    try {
      // Apply gaming optimizations
      const optimizedParams = await this.gamingOptimizer.optimizeTransaction(params);
      
      // Use IceDB for fast state queries
      const nonce = await this.iceDBConnector.getFastNonce(params.to);
      optimizedParams.nonce = nonce;

      const result = await super.sendTransaction(optimizedParams);
      
      // Cache result in IceDB
      await this.iceDBConnector.cacheTransactionResult(result);
      
      return result;
    } catch (error) {
      logger.error('Somnia transaction failed', { error, params });
      throw error;
    }
  }

  async getMetrics(): Promise<ChainMetrics> {
    const now = Date.now();
    
    // Cache metrics for 1 second due to gaming requirements
    if (now - this.lastMetricsUpdate < 1000) {
      return this.cachedMetrics;
    }

    try {
      const baseMetrics = await super.getMetrics();
      
      // Get gaming-specific metrics
      const gamingMetrics = await this.gamingOptimizer.getGamingMetrics();
      const iceDBMetrics = await this.iceDBConnector.getMetrics();
      
      const metrics: ChainMetrics = {
        ...baseMetrics,
        tps: gamingMetrics.tps, // 1M+ TPS capability
        avgBlockTime: gamingMetrics.avgBlockTime, // <100ms
        connectionStatus: this.isHealthy() ? 'connected' : 'degraded',
        contractStatus: {
          gaming: gamingMetrics.status,
          icedb: iceDBMetrics.status,
          ...baseMetrics.contractStatus
        }
      };

      this.cachedMetrics = metrics;
      this.lastMetricsUpdate = now;
      
      return metrics;
    } catch (error) {
      logger.error('Failed to get Somnia metrics', { error });
      return this.getDefaultMetrics();
    }
  }

  async optimizeForGaming(gameData: any): Promise<any> {
    return this.gamingOptimizer.optimizeGameData(gameData);
  }

  async getGameState(gameId: string): Promise<any> {
    return this.iceDBConnector.getGameState(gameId);
  }

  async updateGameState(gameId: string, state: any): Promise<void> {
    await this.iceDBConnector.updateGameState(gameId, state);
  }

  async handleReactiveEvent(event: any): Promise<void> {
    await this.gamingOptimizer.handleReactiveEvent(event);
  }

  async isHealthy(): Promise<boolean> {
    try {
      const [baseHealthy, iceDBHealthy, gamingHealthy] = await Promise.all([
        super.isHealthy(),
        this.iceDBConnector.isHealthy(),
        this.gamingOptimizer.isHealthy()
      ]);
      
      return baseHealthy && iceDBHealthy && gamingHealthy;
    } catch {
      return false;
    }
  }

  private getDefaultMetrics(): ChainMetrics {
    return {
      blockHeight: 0,
      lastBlockTime: Date.now(),
      rpcLatency: 999999,
      connectionStatus: 'disconnected',
      contractStatus: {
        gaming: 'error',
        icedb: 'error'
      },
      tps: 0,
      avgBlockTime: 0
    };
  }
}
