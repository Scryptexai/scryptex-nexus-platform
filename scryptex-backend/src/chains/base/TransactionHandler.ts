
import { ethers } from 'ethers';
import { EVMChainService } from './EVMChainService';
import { logger } from '@/utils/logger';

export interface TransactionRequest {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
  confirmations: number;
}

export class TransactionHandler {
  private chainService: EVMChainService;
  private pendingTransactions: Map<string, TransactionRequest> = new Map();
  private transactionResults: Map<string, TransactionResult> = new Map();

  constructor(chainService: EVMChainService) {
    this.chainService = chainService;
  }

  async executeTransaction(request: TransactionRequest): Promise<TransactionResult> {
    try {
      logger.info('Executing transaction', { requestId: request.id, chainId: this.chainService.getChainId() });
      
      // Add to pending transactions
      this.pendingTransactions.set(request.id, request);

      // Validate transaction
      const isValid = await this.chainService.validateTransaction({
        to: request.toAddress,
        value: request.amount,
        data: request.data,
        gasLimit: request.gasLimit,
        gasPrice: request.gasPrice
      });

      if (!isValid) {
        throw new Error('Transaction validation failed');
      }

      // Get optimized gas price if not provided
      let gasPrice = request.gasPrice;
      if (!gasPrice) {
        const optimizedGasPrice = await this.chainService.getOptimizedGasPrice();
        gasPrice = optimizedGasPrice.toString();
      }

      // Execute transaction
      const tx = await this.chainService.sendTransaction({
        to: request.toAddress,
        value: request.amount,
        data: request.data,
        gasLimit: request.gasLimit,
        gasPrice: gasPrice
      });

      // Wait for confirmation
      const receipt = await this.chainService.waitForTransaction(tx.hash, 1);

      const result: TransactionResult = {
        success: receipt.status === 1,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice?.toString(),
        confirmations: 1
      };

      // Store result
      this.transactionResults.set(request.id, result);
      this.pendingTransactions.delete(request.id);

      logger.info('Transaction executed successfully', { 
        requestId: request.id, 
        txHash: tx.hash, 
        chainId: this.chainService.getChainId() 
      });

      return result;

    } catch (error) {
      logger.error('Transaction execution failed', { 
        requestId: request.id, 
        error, 
        chainId: this.chainService.getChainId() 
      });

      const result: TransactionResult = {
        success: false,
        error: error.message,
        confirmations: 0
      };

      this.transactionResults.set(request.id, result);
      this.pendingTransactions.delete(request.id);

      return result;
    }
  }

  async batchExecuteTransactions(requests: TransactionRequest[]): Promise<TransactionResult[]> {
    const results: TransactionResult[] = [];
    
    // Execute transactions based on priority
    const sortedRequests = requests.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const request of sortedRequests) {
      try {
        const result = await this.executeTransaction(request);
        results.push(result);
      } catch (error) {
        logger.error('Batch transaction failed', { requestId: request.id, error });
        results.push({
          success: false,
          error: error.message,
          confirmations: 0
        });
      }
    }

    return results;
  }

  async getTransactionStatus(requestId: string): Promise<TransactionResult | null> {
    // Check if transaction is completed
    if (this.transactionResults.has(requestId)) {
      return this.transactionResults.get(requestId)!;
    }

    // Check if transaction is pending
    if (this.pendingTransactions.has(requestId)) {
      return {
        success: false,
        confirmations: 0
      };
    }

    return null;
  }

  async estimateTransactionCost(request: Omit<TransactionRequest, 'id' | 'priority'>): Promise<{
    gasEstimate: string;
    gasPriceEstimate: string;
    totalCostEstimate: string;
  }> {
    try {
      const gasEstimate = await this.chainService.estimateGas({
        to: request.toAddress,
        value: request.amount,
        data: request.data
      });

      const gasPriceEstimate = await this.chainService.getOptimizedGasPrice();
      const totalCost = gasEstimate * gasPriceEstimate;

      return {
        gasEstimate: gasEstimate.toString(),
        gasPriceEstimate: gasPriceEstimate.toString(),
        totalCostEstimate: ethers.formatEther(totalCost)
      };

    } catch (error) {
      logger.error('Error estimating transaction cost', { error, request });
      throw error;
    }
  }

  async retryFailedTransaction(requestId: string): Promise<TransactionResult> {
    const originalRequest = this.pendingTransactions.get(requestId);
    if (!originalRequest) {
      throw new Error('Transaction request not found');
    }

    // Increase gas price for retry
    const currentGasPrice = BigInt(originalRequest.gasPrice || '0');
    const newGasPrice = currentGasPrice * BigInt(120) / BigInt(100); // 20% increase

    const retryRequest: TransactionRequest = {
      ...originalRequest,
      id: `${requestId}_retry_${Date.now()}`,
      gasPrice: newGasPrice.toString(),
      priority: 'high'
    };

    return await this.executeTransaction(retryRequest);
  }

  // Monitor pending transactions for timeout
  async monitorPendingTransactions(): Promise<void> {
    const now = new Date();
    
    for (const [requestId, request] of this.pendingTransactions) {
      if (request.deadline && now > request.deadline) {
        logger.warn('Transaction deadline exceeded', { requestId, deadline: request.deadline });
        
        // Mark as failed due to timeout
        this.transactionResults.set(requestId, {
          success: false,
          error: 'Transaction deadline exceeded',
          confirmations: 0
        });
        
        this.pendingTransactions.delete(requestId);
      }
    }
  }

  // Get transaction statistics
  getTransactionStats(): {
    pending: number;
    completed: number;
    successful: number;
    failed: number;
  } {
    const completed = Array.from(this.transactionResults.values());
    const successful = completed.filter(r => r.success).length;
    const failed = completed.filter(r => !r.success).length;

    return {
      pending: this.pendingTransactions.size,
      completed: completed.length,
      successful,
      failed
    };
  }

  // Clear old transaction results
  clearOldResults(olderThanHours: number = 24): void {
    // This would require timestamp tracking, simplified for now
    const maxSize = 1000;
    if (this.transactionResults.size > maxSize) {
      const entries = Array.from(this.transactionResults.entries());
      const toKeep = entries.slice(-maxSize / 2);
      this.transactionResults.clear();
      toKeep.forEach(([id, result]) => this.transactionResults.set(id, result));
    }
  }
}
