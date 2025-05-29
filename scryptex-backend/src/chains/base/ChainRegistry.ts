
import { ChainService } from './ChainService';
import { ChainConfig } from '@/types/chain.types';
import { logger } from '@/utils/logger';

export class ChainRegistry {
  private static instance: ChainRegistry;
  private chains: Map<number, ChainService> = new Map();
  private chainConfigs: Map<number, ChainConfig> = new Map();
  private chainNameMap: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ChainRegistry {
    if (!ChainRegistry.instance) {
      ChainRegistry.instance = new ChainRegistry();
    }
    return ChainRegistry.instance;
  }

  registerChain(chainService: ChainService): void {
    const chainId = chainService.getChainId();
    const chainConfig = chainService.getChainConfig();
    
    this.chains.set(chainId, chainService);
    this.chainConfigs.set(chainId, chainConfig);
    this.chainNameMap.set(chainConfig.name.toLowerCase(), chainId);
    
    logger.info(`Registered chain: ${chainConfig.name}`, { chainId });
  }

  getChain(chainId: number): ChainService | null {
    return this.chains.get(chainId) || null;
  }

  getChainByName(name: string): ChainService | null {
    const chainId = this.chainNameMap.get(name.toLowerCase());
    return chainId ? this.getChain(chainId) : null;
  }

  getAllChains(): ChainService[] {
    return Array.from(this.chains.values());
  }

  getSupportedChainIds(): number[] {
    return Array.from(this.chains.keys());
  }

  getSupportedChainConfigs(): ChainConfig[] {
    return Array.from(this.chainConfigs.values());
  }

  isChainSupported(chainId: number): boolean {
    return this.chains.has(chainId);
  }

  async initializeAllChains(): Promise<void> {
    logger.info('Initializing all registered chains...');
    
    const initPromises = Array.from(this.chains.entries()).map(async ([chainId, chain]) => {
      try {
        await chain.getBlockNumber(); // Test connection
        logger.info(`Chain ${chainId} initialized successfully`);
      } catch (error) {
        logger.error(`Failed to initialize chain ${chainId}`, { error });
      }
    });

    await Promise.allSettled(initPromises);
    logger.info('Chain initialization complete');
  }

  async getChainHealthStatus(): Promise<Record<number, boolean>> {
    const healthStatus: Record<number, boolean> = {};
    
    for (const [chainId, chain] of this.chains) {
      healthStatus[chainId] = chain.getHealthStatus();
    }
    
    return healthStatus;
  }

  async disconnectAllChains(): Promise<void> {
    logger.info('Disconnecting all chains...');
    
    const disconnectPromises = Array.from(this.chains.values()).map(chain => 
      chain.disconnect()
    );
    
    await Promise.allSettled(disconnectPromises);
    logger.info('All chains disconnected');
  }
}

export const chainRegistry = ChainRegistry.getInstance();
