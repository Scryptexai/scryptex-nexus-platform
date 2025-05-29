
import { ethers } from 'ethers';
import { ChainConfig, TransactionParams, TransactionResult, ChainMetrics } from '@/types/chain.types';
import { logger } from '@/utils/logger';

export abstract class ChainService {
  protected provider: ethers.JsonRpcProvider;
  protected websocketProvider?: ethers.WebSocketProvider;
  protected chainConfig: ChainConfig;
  protected wallet?: ethers.Wallet;
  protected isHealthy: boolean = false;
  protected lastHealthCheck: number = 0;

  constructor(chainConfig: ChainConfig) {
    this.chainConfig = chainConfig;
    this.initializeProviders();
    this.setupHealthMonitoring();
  }

  private initializeProviders(): void {
    try {
      this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpc, {
        chainId: this.chainConfig.chainId,
        name: this.chainConfig.name
      });

      if (this.chainConfig.websocket) {
        this.websocketProvider = new ethers.WebSocketProvider(this.chainConfig.websocket);
      }

      logger.info(`Initialized providers for ${this.chainConfig.name}`, {
        chainId: this.chainConfig.chainId,
        hasWebSocket: !!this.chainConfig.websocket
      });
    } catch (error) {
      logger.error(`Failed to initialize providers for ${this.chainConfig.name}`, { error });
      throw error;
    }
  }

  private setupHealthMonitoring(): void {
    // Check health every 30 seconds
    setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);

    // Initial health check
    this.performHealthCheck();
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      await this.provider.getBlockNumber();
      const latency = Date.now() - startTime;

      this.isHealthy = latency < 5000; // 5 second timeout
      this.lastHealthCheck = Date.now();

      if (!this.isHealthy) {
        logger.warn(`Health check failed for ${this.chainConfig.name}`, { latency });
      }
    } catch (error) {
      this.isHealthy = false;
      logger.error(`Health check error for ${this.chainConfig.name}`, { error });
    }
  }

  // Abstract methods that must be implemented
  abstract getSpecialFeatures(): string[];
  abstract getOptimizedGasPrice(): Promise<bigint>;
  abstract validateTransaction(params: TransactionParams): Promise<boolean>;
  abstract getChainMetrics(): Promise<ChainMetrics>;

  // Common functionality
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error(`Error getting balance for ${address} on ${this.chainConfig.name}`, { error });
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error(`Error getting block number for ${this.chainConfig.name}`, { error });
      throw new Error(`Failed to get block number: ${error.message}`);
    }
  }

  async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      logger.error(`Error getting transaction ${txHash} on ${this.chainConfig.name}`, { error });
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error(`Error getting transaction receipt ${txHash} on ${this.chainConfig.name}`, { error });
      throw new Error(`Failed to get transaction receipt: ${error.message}`);
    }
  }

  async estimateGas(params: TransactionParams): Promise<bigint> {
    try {
      return await this.provider.estimateGas({
        to: params.to,
        value: params.value ? ethers.parseEther(params.value) : undefined,
        data: params.data
      });
    } catch (error) {
      logger.error(`Error estimating gas on ${this.chainConfig.name}`, { error, params });
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }

  async sendTransaction(params: TransactionParams): Promise<TransactionResult> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.wallet.sendTransaction({
        to: params.to,
        value: params.value ? ethers.parseEther(params.value) : undefined,
        data: params.data,
        gasLimit: params.gasLimit ? BigInt(params.gasLimit) : undefined,
        gasPrice: params.gasPrice ? BigInt(params.gasPrice) : undefined,
        nonce: params.nonce
      });

      logger.info(`Transaction sent on ${this.chainConfig.name}`, {
        txHash: tx.hash,
        to: params.to,
        value: params.value
      });

      return {
        hash: tx.hash,
        status: 'pending'
      };
    } catch (error) {
      logger.error(`Error sending transaction on ${this.chainConfig.name}`, { error, params });
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations, 60000); // 60 second timeout
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }
      return receipt;
    } catch (error) {
      logger.error(`Error waiting for transaction ${txHash} on ${this.chainConfig.name}`, { error });
      throw new Error(`Failed to wait for transaction: ${error.message}`);
    }
  }

  async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    const signer = this.wallet || this.provider;
    return new ethers.Contract(address, abi, signer);
  }

  setWallet(privateKey: string): void {
    try {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      logger.info(`Wallet initialized for ${this.chainConfig.name}`, {
        address: this.wallet.address
      });
    } catch (error) {
      logger.error(`Failed to initialize wallet for ${this.chainConfig.name}`, { error });
      throw new Error(`Failed to initialize wallet: ${error.message}`);
    }
  }

  // Getters
  getChainId(): number {
    return this.chainConfig.chainId;
  }

  getChainName(): string {
    return this.chainConfig.name;
  }

  getChainConfig(): ChainConfig {
    return this.chainConfig;
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  getWallet(): ethers.Wallet | undefined {
    return this.wallet;
  }

  getHealthStatus(): boolean {
    return this.isHealthy;
  }

  getLastHealthCheck(): number {
    return this.lastHealthCheck;
  }

  // WebSocket functionality
  async subscribeToBlocks(callback: (blockNumber: number) => void): Promise<void> {
    if (!this.websocketProvider) {
      throw new Error('WebSocket provider not available');
    }

    this.websocketProvider.on('block', callback);
  }

  async subscribeToPendingTransactions(callback: (txHash: string) => void): Promise<void> {
    if (!this.websocketProvider) {
      throw new Error('WebSocket provider not available');
    }

    this.websocketProvider.on('pending', callback);
  }

  async disconnect(): Promise<void> {
    try {
      if (this.websocketProvider) {
        await this.websocketProvider.destroy();
      }
      logger.info(`Disconnected from ${this.chainConfig.name}`);
    } catch (error) {
      logger.error(`Error disconnecting from ${this.chainConfig.name}`, { error });
    }
  }
}
