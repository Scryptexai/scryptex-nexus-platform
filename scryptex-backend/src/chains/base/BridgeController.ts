
import { EVMChainService } from './EVMChainService';
import { TransactionHandler } from './TransactionHandler';
import { logger } from '@/utils/logger';

export interface BridgeParams {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  userAddress: string;
}

export interface BridgeQuote {
  bridgeFee: string;
  gasEstimate: string;
  estimatedTime: number;
  exchangeRate: string;
  minimumAmount: string;
  maximumAmount: string;
}

export interface BridgeTransaction {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceTxHash?: string;
  targetTxHash?: string;
  params: BridgeParams;
  quote: BridgeQuote;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class BridgeController {
  protected chainService: EVMChainService;
  protected transactionHandler: TransactionHandler;
  protected bridgeTransactions: Map<string, BridgeTransaction> = new Map();

  constructor(chainService: EVMChainService) {
    this.chainService = chainService;
    this.transactionHandler = new TransactionHandler(chainService);
  }

  abstract getBridgeContractAddress(): string;
  abstract getBridgeContractABI(): any[];
  abstract validateBridgeParams(params: BridgeParams): Promise<boolean>;
  abstract calculateBridgeFee(params: BridgeParams): Promise<string>;

  async generateBridgeQuote(params: BridgeParams): Promise<BridgeQuote> {
    try {
      logger.info('Generating bridge quote', { params, chainId: this.chainService.getChainId() });

      // Validate parameters
      const isValid = await this.validateBridgeParams(params);
      if (!isValid) {
        throw new Error('Invalid bridge parameters');
      }

      // Calculate bridge fee
      const bridgeFee = await this.calculateBridgeFee(params);

      // Estimate gas cost
      const bridgeContract = await this.getBridgeContract();
      const gasEstimate = await bridgeContract.bridgeTokens.estimateGas(
        params.toChain,
        params.fromToken,
        params.amount,
        params.recipient
      );

      // Get current gas price
      const gasPrice = await this.chainService.getOptimizedGasPrice();
      const gasCost = gasEstimate * gasPrice;

      // Estimate completion time based on target chain
      const estimatedTime = this.estimateBridgeTime(params.toChain);

      // Calculate exchange rate (simplified - in production, use price oracles)
      const exchangeRate = '1.0'; // 1:1 for same tokens

      const quote: BridgeQuote = {
        bridgeFee,
        gasEstimate: gasCost.toString(),
        estimatedTime,
        exchangeRate,
        minimumAmount: '0.001', // ETH
        maximumAmount: '1000' // ETH
      };

      logger.info('Bridge quote generated', { quote, chainId: this.chainService.getChainId() });
      return quote;

    } catch (error) {
      logger.error('Error generating bridge quote', { error, params });
      throw error;
    }
  }

  async executeBridge(params: BridgeParams): Promise<string> {
    try {
      logger.info('Executing bridge transaction', { params, chainId: this.chainService.getChainId() });

      // Generate quote
      const quote = await this.generateBridgeQuote(params);

      // Create bridge transaction record
      const bridgeId = `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const bridgeTransaction: BridgeTransaction = {
        id: bridgeId,
        status: 'pending',
        params,
        quote,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.bridgeTransactions.set(bridgeId, bridgeTransaction);

      // Execute bridge contract call
      const bridgeContract = await this.getBridgeContract();
      const tx = await bridgeContract.bridgeTokens(
        params.toChain,
        params.fromToken,
        params.amount,
        params.recipient,
        { value: quote.bridgeFee }
      );

      // Update transaction with source hash
      bridgeTransaction.sourceTxHash = tx.hash;
      bridgeTransaction.status = 'processing';
      bridgeTransaction.updatedAt = new Date();

      // Start monitoring the transaction
      this.monitorBridgeTransaction(bridgeId, tx.hash);

      logger.info('Bridge transaction initiated', { bridgeId, txHash: tx.hash });
      return bridgeId;

    } catch (error) {
      logger.error('Error executing bridge transaction', { error, params });
      throw error;
    }
  }

  async getBridgeStatus(bridgeId: string): Promise<BridgeTransaction | null> {
    return this.bridgeTransactions.get(bridgeId) || null;
  }

  async getAllBridgeTransactions(): Promise<BridgeTransaction[]> {
    return Array.from(this.bridgeTransactions.values());
  }

  async getBridgeHistory(userAddress: string): Promise<BridgeTransaction[]> {
    return Array.from(this.bridgeTransactions.values())
      .filter(tx => tx.params.userAddress.toLowerCase() === userAddress.toLowerCase())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private async getBridgeContract() {
    const contractAddress = this.getBridgeContractAddress();
    const contractABI = this.getBridgeContractABI();
    return await this.chainService.getContract(contractAddress, contractABI);
  }

  private estimateBridgeTime(targetChainId: number): number {
    // Estimated completion times in seconds based on target chain
    const chainTimes: Record<number, number> = {
      11155931: 30,   // RiseChain - 30 seconds
      11124: 120,     // Abstract - 2 minutes
      16601: 180,     // 0G - 3 minutes
      50312: 60,      // Somnia - 1 minute
      11155111: 90    // Sepolia - 1.5 minutes
    };

    return chainTimes[targetChainId] || 120; // Default 2 minutes
  }

  private async monitorBridgeTransaction(bridgeId: string, txHash: string): Promise<void> {
    try {
      // Wait for transaction confirmation
      const receipt = await this.chainService.waitForTransaction(txHash, 2);
      
      const bridgeTransaction = this.bridgeTransactions.get(bridgeId);
      if (!bridgeTransaction) return;

      if (receipt.status === 1) {
        // Transaction successful, now monitor target chain
        bridgeTransaction.status = 'processing';
        bridgeTransaction.updatedAt = new Date();

        // In a real implementation, you would monitor the target chain
        // For now, simulate completion after estimated time
        setTimeout(() => {
          this.completeBridgeTransaction(bridgeId);
        }, bridgeTransaction.quote.estimatedTime * 1000);

      } else {
        // Transaction failed
        bridgeTransaction.status = 'failed';
        bridgeTransaction.updatedAt = new Date();
      }

    } catch (error) {
      logger.error('Error monitoring bridge transaction', { error, bridgeId, txHash });
      
      const bridgeTransaction = this.bridgeTransactions.get(bridgeId);
      if (bridgeTransaction) {
        bridgeTransaction.status = 'failed';
        bridgeTransaction.updatedAt = new Date();
      }
    }
  }

  private completeBridgeTransaction(bridgeId: string): void {
    const bridgeTransaction = this.bridgeTransactions.get(bridgeId);
    if (bridgeTransaction) {
      bridgeTransaction.status = 'completed';
      bridgeTransaction.targetTxHash = `0x${Math.random().toString(16).substr(2, 64)}`; // Simulated
      bridgeTransaction.updatedAt = new Date();
      
      logger.info('Bridge transaction completed', { bridgeId });
    }
  }

  // Emergency functions
  async pauseBridge(): Promise<void> {
    try {
      const bridgeContract = await this.getBridgeContract();
      const tx = await bridgeContract.pause();
      await this.chainService.waitForTransaction(tx.hash, 1);
      logger.info('Bridge paused', { chainId: this.chainService.getChainId() });
    } catch (error) {
      logger.error('Error pausing bridge', { error });
      throw error;
    }
  }

  async unpauseBridge(): Promise<void> {
    try {
      const bridgeContract = await this.getBridgeContract();
      const tx = await bridgeContract.unpause();
      await this.chainService.waitForTransaction(tx.hash, 1);
      logger.info('Bridge unpaused', { chainId: this.chainService.getChainId() });
    } catch (error) {
      logger.error('Error unpausing bridge', { error });
      throw error;
    }
  }

  // Analytics
  getBridgeStats(): {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    totalVolume: string;
    averageTime: number;
  } {
    const transactions = Array.from(this.bridgeTransactions.values());
    const successful = transactions.filter(tx => tx.status === 'completed');
    const failed = transactions.filter(tx => tx.status === 'failed');
    
    const totalVolume = transactions.reduce((sum, tx) => {
      return sum + parseFloat(tx.params.amount);
    }, 0);

    const averageTime = successful.length > 0 
      ? successful.reduce((sum, tx) => sum + tx.quote.estimatedTime, 0) / successful.length
      : 0;

    return {
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      totalVolume: totalVolume.toString(),
      averageTime
    };
  }
}
