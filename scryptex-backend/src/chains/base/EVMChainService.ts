
import { ethers } from 'ethers';
import { logger } from '@/utils/logger';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpc: string;
  websocket?: string;
  explorer: string;
  currency: {
    symbol: string;
    decimals: number;
  };
  contracts: {
    [key: string]: string;
  };
}

export interface TransactionParams {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
}

export abstract class EVMChainService {
  protected provider: ethers.JsonRpcProvider;
  protected websocketProvider?: ethers.WebSocketProvider;
  protected chainConfig: ChainConfig;
  protected wallet?: ethers.Wallet;

  constructor(chainConfig: ChainConfig) {
    this.chainConfig = chainConfig;
    this.provider = new ethers.JsonRpcProvider(chainConfig.rpc);
    
    if (chainConfig.websocket) {
      this.websocketProvider = new ethers.WebSocketProvider(chainConfig.websocket);
    }
  }

  // Abstract methods that must be implemented by chain-specific services
  abstract getSpecialFeatures(): string[];
  abstract getOptimizedGasPrice(): Promise<bigint>;
  abstract validateTransaction(params: TransactionParams): Promise<boolean>;

  // Common EVM functionality
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error(`Error getting balance for ${address}`, { error, chainId: this.chainConfig.chainId });
      throw error;
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting block number', { error, chainId: this.chainConfig.chainId });
      throw error;
    }
  }

  async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      logger.error(`Error getting transaction ${txHash}`, { error, chainId: this.chainConfig.chainId });
      throw error;
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error(`Error getting transaction receipt ${txHash}`, { error, chainId: this.chainConfig.chainId });
      throw error;
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
      logger.error('Error estimating gas', { error, params, chainId: this.chainConfig.chainId });
      throw error;
    }
  }

  async sendTransaction(params: TransactionParams): Promise<ethers.TransactionResponse> {
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

      logger.info('Transaction sent', { txHash: tx.hash, chainId: this.chainConfig.chainId });
      return tx;
    } catch (error) {
      logger.error('Error sending transaction', { error, params, chainId: this.chainConfig.chainId });
      throw error;
    }
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }
      return receipt;
    } catch (error) {
      logger.error(`Error waiting for transaction ${txHash}`, { error, chainId: this.chainConfig.chainId });
      throw error;
    }
  }

  async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    const signer = this.wallet || this.provider;
    return new ethers.Contract(address, abi, signer);
  }

  setWallet(privateKey: string): void {
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  getChainId(): number {
    return this.chainConfig.chainId;
  }

  getChainName(): string {
    return this.chainConfig.name;
  }

  getExplorerUrl(): string {
    return this.chainConfig.explorer;
  }

  // WebSocket event listening
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

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      await this.getBlockNumber();
      return true;
    } catch (error) {
      logger.error('Chain health check failed', { error, chainId: this.chainConfig.chainId });
      return false;
    }
  }

  // Connection management
  async disconnect(): Promise<void> {
    if (this.websocketProvider) {
      await this.websocketProvider.destroy();
    }
  }
}
