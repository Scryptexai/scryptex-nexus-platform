
import { ethers } from 'ethers';
import { config } from '@/config/environment';
import { logger } from './logger';

export class Web3Utils {
  static providers: Map<number, ethers.JsonRpcProvider> = new Map();

  static initializeProviders(): void {
    const chains = config.blockchain;
    
    for (const [chainName, chainConfig] of Object.entries(chains)) {
      try {
        const provider = new ethers.JsonRpcProvider(chainConfig.rpc, {
          chainId: chainConfig.chainId,
          name: chainConfig.name
        });
        
        this.providers.set(chainConfig.chainId, provider);
        logger.info(`Web3 provider initialized for ${chainName}`, { chainId: chainConfig.chainId });
      } catch (error) {
        logger.error(`Failed to initialize Web3 provider for ${chainName}`, { error });
      }
    }
  }

  static getProvider(chainId: number): ethers.JsonRpcProvider | null {
    return this.providers.get(chainId) || null;
  }

  static async getBlockNumber(chainId: number): Promise<number | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;
      
      return await provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting block number', { error, chainId });
      return null;
    }
  }

  static async getBalance(address: string, chainId: number): Promise<string | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;
      
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Error getting balance', { error, address, chainId });
      return null;
    }
  }

  static async getTokenBalance(
    tokenAddress: string, 
    userAddress: string, 
    chainId: number
  ): Promise<string | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;

      const erc20ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      const contract = new ethers.Contract(tokenAddress, erc20ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      logger.error('Error getting token balance', { error, tokenAddress, userAddress, chainId });
      return null;
    }
  }

  static async getTransactionReceipt(txHash: string, chainId: number): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;
      
      return await provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error('Error getting transaction receipt', { error, txHash, chainId });
      return null;
    }
  }

  static async waitForTransaction(
    txHash: string, 
    chainId: number, 
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;
      
      return await provider.waitForTransaction(txHash, confirmations, 30000); // 30 second timeout
    } catch (error) {
      logger.error('Error waiting for transaction', { error, txHash, chainId, confirmations });
      return null;
    }
  }

  static async estimateGas(
    to: string,
    data: string,
    value: string,
    chainId: number
  ): Promise<string | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;
      
      const gasEstimate = await provider.estimateGas({
        to,
        data,
        value: ethers.parseEther(value)
      });
      
      return gasEstimate.toString();
    } catch (error) {
      logger.error('Error estimating gas', { error, to, chainId });
      return null;
    }
  }

  static async getGasPrice(chainId: number): Promise<string | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;
      
      const feeData = await provider.getFeeData();
      return feeData.gasPrice?.toString() || null;
    } catch (error) {
      logger.error('Error getting gas price', { error, chainId });
      return null;
    }
  }

  static formatTokenAmount(amount: string, decimals: number): string {
    try {
      return ethers.formatUnits(amount, decimals);
    } catch (error) {
      logger.error('Error formatting token amount', { error, amount, decimals });
      return '0';
    }
  }

  static parseTokenAmount(amount: string, decimals: number): string {
    try {
      return ethers.parseUnits(amount, decimals).toString();
    } catch (error) {
      logger.error('Error parsing token amount', { error, amount, decimals });
      return '0';
    }
  }

  static isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  static generateRandomWallet(): ethers.Wallet {
    return ethers.Wallet.createRandom();
  }

  static async verifyMessage(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      logger.error('Error verifying message', { error, message, signature, expectedAddress });
      return false;
    }
  }

  static async getChainInfo(chainId: number): Promise<any> {
    const chains = config.blockchain;
    return Object.values(chains).find(chain => chain.chainId === chainId);
  }

  static calculateTransactionFee(gasUsed: string, gasPrice: string): string {
    try {
      const gasUsedBN = BigInt(gasUsed);
      const gasPriceBN = BigInt(gasPrice);
      const fee = gasUsedBN * gasPriceBN;
      return ethers.formatEther(fee);
    } catch (error) {
      logger.error('Error calculating transaction fee', { error, gasUsed, gasPrice });
      return '0';
    }
  }
}

// Initialize providers on module load
Web3Utils.initializeProviders();
