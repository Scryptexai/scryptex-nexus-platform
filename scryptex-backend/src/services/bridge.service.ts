
import { ethers } from 'ethers';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { BridgeTransaction, User } from '@/models';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';

export interface BridgeQuote {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  amount: string;
  estimatedOutput: string;
  bridgeFee: string;
  gasEstimate: string;
  estimatedTime: number;
  route: string[];
}

export interface BridgeExecutionParams {
  userAddress: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  amount: string;
  recipient?: string;
  slippage?: number;
}

export interface BridgeStatus {
  status: 'pending' | 'confirming' | 'bridging' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  sourceTxHash?: string;
  targetTxHash?: string;
  estimatedCompletion?: Date;
  error?: string;
}

export class BridgeService {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private contracts: Map<number, ethers.Contract> = new Map();
  private notificationService: NotificationService;
  private websocketService: WebSocketService;

  constructor() {
    this.initializeProviders();
    this.initializeContracts();
    this.notificationService = new NotificationService();
    this.websocketService = new WebSocketService();
  }

  private initializeProviders(): void {
    const chains = config.blockchain;
    
    for (const [chainName, chainConfig] of Object.entries(chains)) {
      try {
        const provider = new ethers.JsonRpcProvider(chainConfig.rpc);
        this.providers.set(chainConfig.chainId, provider);
        logger.info(`Initialized provider for ${chainName}`, { chainId: chainConfig.chainId });
      } catch (error) {
        logger.error(`Failed to initialize provider for ${chainName}`, { error, chainId: chainConfig.chainId });
      }
    }
  }

  private initializeContracts(): void {
    // Bridge contract ABI (simplified for demo)
    const bridgeABI = [
      "function bridgeTokens(uint256 targetChain, address token, uint256 amount, address recipient) external payable",
      "function getBridgeFee(uint256 targetChain, address token, uint256 amount) external view returns (uint256)",
      "function getBridgeStatus(bytes32 bridgeId) external view returns (uint8, uint256)",
      "event BridgeInitiated(bytes32 indexed bridgeId, uint256 indexed targetChain, address indexed user, address token, uint256 amount)",
      "event BridgeCompleted(bytes32 indexed bridgeId, bytes32 targetTxHash)"
    ];

    for (const [chainId, provider] of this.providers) {
      try {
        const contractAddress = this.getBridgeContractAddress(chainId);
        if (contractAddress) {
          const contract = new ethers.Contract(contractAddress, bridgeABI, provider);
          this.contracts.set(chainId, contract);
          logger.info(`Initialized bridge contract for chain ${chainId}`, { contractAddress });
        }
      } catch (error) {
        logger.error(`Failed to initialize bridge contract for chain ${chainId}`, { error });
      }
    }
  }

  private getBridgeContractAddress(chainId: number): string | null {
    const contracts = config.contracts;
    
    switch (chainId) {
      case 11155931: // RiseChain
        return contracts.risechain.crossChainCoordinator;
      case 11124: // Abstract
        return contracts.abstract.crossChainCoordinator;
      case 16601: // 0G
        return contracts.og.crossChainCoordinator;
      case 50312: // Somnia
        return contracts.somnia.crossChainCoordinator;
      case 11155111: // Sepolia
        return contracts.sepolia.crossChainCoordinator;
      default:
        return null;
    }
  }

  async getBridgeQuote(params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    amount: string;
  }): Promise<BridgeQuote> {
    try {
      const { fromChain, toChain, fromToken, toToken, amount } = params;
      
      // Validate chains
      if (!this.providers.has(fromChain) || !this.providers.has(toChain)) {
        throw new Error('Unsupported chain');
      }

      // Get bridge contract
      const bridgeContract = this.contracts.get(fromChain);
      if (!bridgeContract) {
        throw new Error('Bridge contract not available for source chain');
      }

      // Calculate bridge fee
      const bridgeFee = await bridgeContract.getBridgeFee(toChain, fromToken, amount);
      
      // Estimate gas
      const gasEstimate = await this.estimateGas(fromChain, toChain, fromToken, amount);
      
      // Calculate estimated output (amount - fees)
      const estimatedOutput = this.calculateEstimatedOutput(amount, bridgeFee.toString());
      
      // Estimate completion time based on target chain
      const estimatedTime = this.getEstimatedTime(fromChain, toChain);
      
      // Determine route
      const route = this.calculateRoute(fromChain, toChain);

      const quote: BridgeQuote = {
        fromChain,
        toChain,
        fromToken,
        toToken,
        amount,
        estimatedOutput,
        bridgeFee: bridgeFee.toString(),
        gasEstimate,
        estimatedTime,
        route
      };

      logger.info('Bridge quote generated', { quote });
      return quote;

    } catch (error) {
      logger.error('Error generating bridge quote', { error, params });
      throw new Error(`Failed to generate bridge quote: ${error.message}`);
    }
  }

  async executeBridge(params: BridgeExecutionParams): Promise<string> {
    try {
      const { userAddress, fromChain, toChain, fromToken, amount, recipient, slippage = 5 } = params;

      // Validate parameters
      this.validateBridgeParams(params);

      // Get user wallet
      const wallet = await this.getUserWallet(userAddress, fromChain);
      
      // Get bridge contract
      const bridgeContract = this.contracts.get(fromChain);
      if (!bridgeContract) {
        throw new Error('Bridge contract not available');
      }

      // Connect wallet to contract
      const contractWithSigner = bridgeContract.connect(wallet);

      // Get bridge fee
      const bridgeFee = await contractWithSigner.getBridgeFee(toChain, fromToken, amount);

      // Execute bridge transaction
      const tx = await contractWithSigner.bridgeTokens(
        toChain,
        fromToken,
        amount,
        recipient || userAddress,
        { value: bridgeFee }
      );

      // Create bridge transaction record
      const bridgeTransaction = await BridgeTransaction.create({
        userAddress,
        sourceChainId: fromChain,
        targetChainId: toChain,
        sourceTokenAddress: fromToken,
        targetTokenAddress: fromToken, // Assuming same token for now
        amount,
        bridgeFee: bridgeFee.toString(),
        status: 'pending',
        sourceTxHash: tx.hash,
        estimatedCompletion: new Date(Date.now() + this.getEstimatedTime(fromChain, toChain) * 1000),
        metadata: {
          slippage,
          recipient: recipient || userAddress,
          gasPrice: tx.gasPrice?.toString(),
          gasLimit: tx.gasLimit?.toString()
        }
      });

      // Start monitoring the transaction
      this.monitorBridgeTransaction(bridgeTransaction.id, tx.hash, fromChain, toChain);

      // Notify user
      await this.notificationService.sendBridgeInitiated(userAddress, {
        bridgeId: bridgeTransaction.id,
        fromChain,
        toChain,
        amount,
        txHash: tx.hash
      });

      logger.info('Bridge transaction executed', {
        bridgeId: bridgeTransaction.id,
        txHash: tx.hash,
        fromChain,
        toChain,
        amount
      });

      return bridgeTransaction.id;

    } catch (error) {
      logger.error('Error executing bridge transaction', { error, params });
      throw new Error(`Failed to execute bridge: ${error.message}`);
    }
  }

  async getBridgeStatus(bridgeId: string): Promise<BridgeStatus> {
    try {
      const bridgeTransaction = await BridgeTransaction.findByPk(bridgeId);
      if (!bridgeTransaction) {
        throw new Error('Bridge transaction not found');
      }

      const status: BridgeStatus = {
        status: bridgeTransaction.status as any,
        progress: this.calculateProgress(bridgeTransaction.status),
        currentStep: this.getCurrentStep(bridgeTransaction.status),
        sourceTxHash: bridgeTransaction.sourceTxHash,
        targetTxHash: bridgeTransaction.targetTxHash,
        estimatedCompletion: bridgeTransaction.estimatedCompletion,
        error: bridgeTransaction.metadata?.error
      };

      return status;

    } catch (error) {
      logger.error('Error getting bridge status', { error, bridgeId });
      throw new Error(`Failed to get bridge status: ${error.message}`);
    }
  }

  async getBridgeHistory(userAddress: string, limit: number = 50): Promise<BridgeTransaction[]> {
    try {
      const transactions = await BridgeTransaction.findAll({
        where: { userAddress },
        order: [['createdAt', 'DESC']],
        limit
      });

      return transactions;

    } catch (error) {
      logger.error('Error getting bridge history', { error, userAddress });
      throw new Error(`Failed to get bridge history: ${error.message}`);
    }
  }

  private async monitorBridgeTransaction(
    bridgeId: string,
    txHash: string,
    fromChain: number,
    toChain: number
  ): Promise<void> {
    try {
      const provider = this.providers.get(fromChain);
      if (!provider) return;

      // Wait for transaction confirmation
      const receipt = await provider.waitForTransaction(txHash, 1);
      
      if (receipt) {
        // Update status to confirming
        await BridgeTransaction.update(
          { status: 'confirming' },
          { where: { id: bridgeId } }
        );

        // Emit status update
        this.websocketService.emitBridgeStatusUpdate(bridgeId, {
          status: 'confirming',
          progress: 25,
          currentStep: 'Transaction confirmed on source chain'
        });

        // Wait for additional confirmations
        await this.waitForConfirmations(txHash, fromChain, 3);

        // Update status to bridging
        await BridgeTransaction.update(
          { status: 'bridging' },
          { where: { id: bridgeId } }
        );

        this.websocketService.emitBridgeStatusUpdate(bridgeId, {
          status: 'bridging',
          progress: 50,
          currentStep: 'Processing cross-chain transfer'
        });

        // Monitor for completion on target chain
        this.monitorTargetChain(bridgeId, toChain);
      }

    } catch (error) {
      logger.error('Error monitoring bridge transaction', { error, bridgeId, txHash });
      
      // Update status to failed
      await BridgeTransaction.update(
        { 
          status: 'failed',
          metadata: { error: error.message }
        },
        { where: { id: bridgeId } }
      );

      this.websocketService.emitBridgeStatusUpdate(bridgeId, {
        status: 'failed',
        progress: 0,
        currentStep: 'Transaction failed',
        error: error.message
      });
    }
  }

  private async monitorTargetChain(bridgeId: string, toChain: number): Promise<void> {
    // Simulate target chain completion for demo
    // In production, this would monitor the actual target chain
    setTimeout(async () => {
      try {
        const targetTxHash = '0x' + Math.random().toString(16).substr(2, 64);
        
        await BridgeTransaction.update(
          { 
            status: 'completed',
            targetTxHash,
            completedAt: new Date()
          },
          { where: { id: bridgeId } }
        );

        this.websocketService.emitBridgeStatusUpdate(bridgeId, {
          status: 'completed',
          progress: 100,
          currentStep: 'Bridge completed successfully',
          targetTxHash
        });

        logger.info('Bridge transaction completed', { bridgeId, targetTxHash });

      } catch (error) {
        logger.error('Error completing bridge transaction', { error, bridgeId });
      }
    }, 30000); // 30 seconds simulation
  }

  private async waitForConfirmations(txHash: string, chainId: number, confirmations: number): Promise<void> {
    const provider = this.providers.get(chainId);
    if (!provider) return;

    await provider.waitForTransaction(txHash, confirmations);
  }

  private validateBridgeParams(params: BridgeExecutionParams): void {
    const { fromChain, toChain, fromToken, amount, userAddress } = params;

    if (!ethers.isAddress(userAddress)) {
      throw new Error('Invalid user address');
    }

    if (!ethers.isAddress(fromToken)) {
      throw new Error('Invalid token address');
    }

    if (fromChain === toChain) {
      throw new Error('Source and target chains cannot be the same');
    }

    if (!this.providers.has(fromChain) || !this.providers.has(toChain)) {
      throw new Error('Unsupported chain');
    }

    const amountBN = ethers.parseEther(amount);
    if (amountBN <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }

  private async getUserWallet(userAddress: string, chainId: number): Promise<ethers.Wallet> {
    // In production, this would retrieve the user's wallet securely
    // For demo, we'll use platform wallets
    const platformWallets = config.platformWallets;
    let privateKey: string | undefined;

    switch (chainId) {
      case 11155931: // RiseChain
        privateKey = platformWallets.risechain.platform1;
        break;
      case 11124: // Abstract
        privateKey = platformWallets.abstract.platform1;
        break;
      case 16601: // 0G
        privateKey = platformWallets.og.platform1;
        break;
      case 50312: // Somnia
        privateKey = platformWallets.somnia.platform1;
        break;
      case 11155111: // Sepolia
        privateKey = platformWallets.sepolia.platform1;
        break;
      default:
        throw new Error('Unsupported chain');
    }

    if (!privateKey) {
      throw new Error('Platform wallet not configured');
    }

    const provider = this.providers.get(chainId);
    return new ethers.Wallet(privateKey, provider);
  }

  private async estimateGas(fromChain: number, toChain: number, token: string, amount: string): Promise<string> {
    try {
      const contract = this.contracts.get(fromChain);
      if (!contract) return '100000'; // Default estimate

      const gasEstimate = await contract.bridgeTokens.estimateGas(toChain, token, amount, contract.target);
      return gasEstimate.toString();

    } catch (error) {
      logger.warn('Failed to estimate gas, using default', { error });
      return '100000';
    }
  }

  private calculateEstimatedOutput(amount: string, bridgeFee: string): string {
    const amountBN = ethers.parseEther(amount);
    const feeBN = BigInt(bridgeFee);
    const output = amountBN - feeBN;
    return ethers.formatEther(output > 0 ? output : 0);
  }

  private getEstimatedTime(fromChain: number, toChain: number): number {
    // Estimated time in seconds based on chain characteristics
    const chainTimes: Record<number, number> = {
      11155931: 10,   // RiseChain - 10 seconds
      11124: 60,      // Abstract - 1 minute
      16601: 120,     // 0G - 2 minutes
      50312: 30,      // Somnia - 30 seconds
      11155111: 90    // Sepolia - 1.5 minutes
    };

    return (chainTimes[fromChain] || 60) + (chainTimes[toChain] || 60);
  }

  private calculateRoute(fromChain: number, toChain: number): string[] {
    // For Sepolia as hub, route through Sepolia if not direct
    if (fromChain === 11155111 || toChain === 11155111) {
      return [fromChain.toString(), toChain.toString()];
    }

    // For other chains, might route through Sepolia
    const supportedDirectRoutes = [
      [11155931, 11124], // RiseChain <-> Abstract
      [11155931, 16601], // RiseChain <-> 0G
      [50312, 11124]     // Somnia <-> Abstract
    ];

    const isDirectRoute = supportedDirectRoutes.some(route => 
      (route[0] === fromChain && route[1] === toChain) ||
      (route[0] === toChain && route[1] === fromChain)
    );

    if (isDirectRoute) {
      return [fromChain.toString(), toChain.toString()];
    }

    // Route through Sepolia
    return [fromChain.toString(), '11155111', toChain.toString()];
  }

  private calculateProgress(status: string): number {
    switch (status) {
      case 'pending': return 0;
      case 'confirming': return 25;
      case 'bridging': return 50;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  }

  private getCurrentStep(status: string): string {
    switch (status) {
      case 'pending': return 'Initializing bridge transaction';
      case 'confirming': return 'Waiting for confirmations';
      case 'bridging': return 'Processing cross-chain transfer';
      case 'completed': return 'Bridge completed successfully';
      case 'failed': return 'Bridge transaction failed';
      default: return 'Unknown status';
    }
  }

  async getSupportedChains(): Promise<Array<{ chainId: number; name: string; currency: string }>> {
    return Object.values(config.blockchain).map(chain => ({
      chainId: chain.chainId,
      name: chain.name,
      currency: chain.currency.symbol
    }));
  }

  async getBridgeVolume(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalVolume: string;
    transactionCount: number;
    avgTransactionSize: string;
  }> {
    try {
      const startDate = new Date();
      switch (timeframe) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const transactions = await BridgeTransaction.findAll({
        where: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      });

      const totalVolume = transactions.reduce((sum, tx) => {
        return sum + parseFloat(tx.amount);
      }, 0);

      const transactionCount = transactions.length;
      const avgTransactionSize = transactionCount > 0 ? totalVolume / transactionCount : 0;

      return {
        totalVolume: totalVolume.toString(),
        transactionCount,
        avgTransactionSize: avgTransactionSize.toString()
      };

    } catch (error) {
      logger.error('Error getting bridge volume', { error, timeframe });
      return {
        totalVolume: '0',
        transactionCount: 0,
        avgTransactionSize: '0'
      };
    }
  }
}
