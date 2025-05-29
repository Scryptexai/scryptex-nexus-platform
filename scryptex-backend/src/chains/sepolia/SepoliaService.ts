
import { ChainService } from '../base/ChainService';
import { ChainConfig, TransactionParams, ChainMetrics } from '@/types/chain.types';
import { logger } from '@/utils/logger';

export class SepoliaService extends ChainService {
  constructor(chainConfig: ChainConfig) {
    super(chainConfig);
    this.initializeSepoliaSpecific();
  }

  private async initializeSepoliaSpecific(): Promise<void> {
    try {
      // Sepolia-specific initialization
      logger.info('Initializing Sepolia-specific features');
      
      // Set up Ethereum testnet specific monitoring
      await this.setupEthereumMonitoring();
    } catch (error) {
      logger.error('Failed to initialize Sepolia-specific features', { error });
    }
  }

  private async setupEthereumMonitoring(): Promise<void> {
    // Monitor Ethereum network conditions
    if (this.websocketProvider) {
      this.websocketProvider.on('block', (blockNumber) => {
        logger.debug(`New Sepolia block: ${blockNumber}`);
      });
    }
  }

  getSpecialFeatures(): string[] {
    return [
      'ethereum_compatibility',
      'stable_testnet',
      'high_liquidity',
      'well_documented',
      'main_bridge_hub',
      'faucet_available'
    ];
  }

  async getOptimizedGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(20000000000); // 20 gwei default
      
      // Sepolia optimization: slightly higher gas for reliability
      const optimizedPrice = gasPrice * BigInt(110) / BigInt(100); // 10% buffer
      
      logger.debug('Sepolia optimized gas price calculated', {
        basePrice: gasPrice.toString(),
        optimizedPrice: optimizedPrice.toString()
      });

      return optimizedPrice;
    } catch (error) {
      logger.error('Error calculating optimized gas price for Sepolia', { error });
      return BigInt(25000000000); // 25 gwei fallback
    }
  }

  async validateTransaction(params: TransactionParams): Promise<boolean> {
    try {
      // Sepolia-specific validation
      
      // Check gas limit
      if (params.gasLimit && BigInt(params.gasLimit) > BigInt(10000000)) { // 10M gas limit
        throw new Error('Gas limit too high for Sepolia');
      }

      // Validate recipient address
      if (!params.to || !params.to.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid recipient address');
      }

      // Check if amount is reasonable for testnet
      if (params.value) {
        const valueInEth = parseFloat(params.value);
        if (valueInEth > 10) { // More than 10 ETH might be suspicious on testnet
          logger.warn('Large transaction amount on Sepolia testnet', { 
            amount: params.value,
            to: params.to 
          });
        }
      }

      return true;
    } catch (error) {
      logger.error('Sepolia transaction validation failed', { error, params });
      return false;
    }
  }

  async getChainMetrics(): Promise<ChainMetrics> {
    try {
      const startTime = Date.now();
      const blockNumber = await this.getBlockNumber();
      const rpcLatency = Date.now() - startTime;

      const latestBlock = await this.provider.getBlock(blockNumber);
      const lastBlockTime = latestBlock ? latestBlock.timestamp * 1000 : Date.now();

      // Get previous block for TPS calculation
      const previousBlock = await this.provider.getBlock(blockNumber - 1);
      const blockTimeDiff = latestBlock && previousBlock ? 
        latestBlock.timestamp - previousBlock.timestamp : 12;

      const tps = latestBlock && previousBlock ?
        (latestBlock.transactions.length / blockTimeDiff) : 0;

      return {
        blockHeight: blockNumber,
        lastBlockTime,
        rpcLatency,
        connectionStatus: this.isHealthy ? 'connected' : 'degraded',
        contractStatus: await this.getContractHealthStatus(),
        tps,
        avgBlockTime: blockTimeDiff
      };
    } catch (error) {
      logger.error('Error getting Sepolia chain metrics', { error });
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
      logger.error('Error checking contract health status', { error });
    }

    return contractStatus;
  }

  async getBridgeCompatibility(): Promise<{
    supportedTokens: string[];
    bridgeFee: string;
    estimatedTime: number;
  }> {
    return {
      supportedTokens: ['ETH', 'USDC', 'USDT', 'DAI'], // Common testnet tokens
      bridgeFee: '0.001', // 0.1% fee
      estimatedTime: 300 // 5 minutes average
    };
  }

  async getTestnetFaucetInfo(): Promise<{
    faucetUrl: string;
    dailyLimit: string;
    minimumBalance: string;
  }> {
    return {
      faucetUrl: this.chainConfig.faucet || 'https://sepoliafaucet.com',
      dailyLimit: '0.5', // 0.5 ETH per day
      minimumBalance: '0.01' // 0.01 ETH minimum to request
    };
  }
}
