
import { Token } from '@/models/Token';
import { ChainRegistryService } from './ChainRegistryService';
import { logger } from '@/utils/logger';
import { ethers } from 'ethers';

export interface TokenCreationParams {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  description?: string;
  logoUrl?: string;
  chainId: number;
  creator: string;
  autoLiquidity?: boolean;
  liquidityAmount?: string;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  chainId: number;
  creator: string;
  createdAt: Date;
  hasLiquidity: boolean;
  volume24h?: string;
  holders?: number;
  marketCap?: string;
}

export class TokenService {
  private chainRegistry: ChainRegistryService;

  constructor() {
    this.chainRegistry = new ChainRegistryService();
  }

  async createToken(params: TokenCreationParams): Promise<TokenInfo> {
    try {
      logger.info('Creating new token', { 
        name: params.name,
        symbol: params.symbol,
        chainId: params.chainId 
      });

      // Get chain service
      const chainService = this.chainRegistry.getChainService(params.chainId);
      if (!chainService) {
        throw new Error(`Chain ${params.chainId} not supported`);
      }

      // Validate parameters
      this.validateTokenParams(params);

      // Deploy token contract
      const tokenAddress = await this.deployTokenContract(params, chainService);

      // Create database record
      const token = await this.createTokenRecord({
        ...params,
        address: tokenAddress
      });

      // Setup liquidity if requested
      if (params.autoLiquidity && params.liquidityAmount) {
        await this.setupInitialLiquidity(token, params.liquidityAmount, chainService);
      }

      logger.info('Token created successfully', { 
        address: tokenAddress,
        name: params.name,
        chainId: params.chainId 
      });

      return this.formatTokenInfo(token);
    } catch (error) {
      logger.error('Failed to create token', { error, params });
      throw new Error(`Token creation failed: ${error.message}`);
    }
  }

  async getToken(address: string, chainId: number): Promise<TokenInfo | null> {
    try {
      const token = await Token.findOne({
        where: { address: address.toLowerCase(), chainId }
      });

      if (!token) {
        return null;
      }

      return this.formatTokenInfo(token);
    } catch (error) {
      logger.error('Failed to get token', { error, address, chainId });
      return null;
    }
  }

  async getUserTokens(creator: string, chainId?: number): Promise<TokenInfo[]> {
    try {
      const query: any = { creator: creator.toLowerCase() };
      if (chainId) {
        query.chainId = chainId;
      }

      const tokens = await Token.find({
        where: query,
        order: { createdAt: 'DESC' }
      });

      return tokens.map(token => this.formatTokenInfo(token));
    } catch (error) {
      logger.error('Failed to get user tokens', { error, creator, chainId });
      return [];
    }
  }

  async getTokensByChain(chainId: number, limit: number = 50): Promise<TokenInfo[]> {
    try {
      const tokens = await Token.find({
        where: { chainId },
        order: { createdAt: 'DESC' },
        take: limit
      });

      return tokens.map(token => this.formatTokenInfo(token));
    } catch (error) {
      logger.error('Failed to get tokens by chain', { error, chainId });
      return [];
    }
  }

  async updateTokenMetrics(address: string, chainId: number, metrics: {
    volume24h?: string;
    holders?: number;
    marketCap?: string;
  }): Promise<void> {
    try {
      await Token.update(
        { address: address.toLowerCase(), chainId },
        metrics
      );
    } catch (error) {
      logger.error('Failed to update token metrics', { error, address, chainId });
    }
  }

  async searchTokens(query: string, chainId?: number): Promise<TokenInfo[]> {
    try {
      const whereConditions: any = [
        { name: { contains: query, mode: 'insensitive' } },
        { symbol: { contains: query, mode: 'insensitive' } },
        { address: { contains: query.toLowerCase() } }
      ];

      if (chainId) {
        whereConditions.forEach(condition => condition.chainId = chainId);
      }

      const tokens = await Token.find({
        where: { OR: whereConditions },
        order: { createdAt: 'DESC' },
        take: 20
      });

      return tokens.map(token => this.formatTokenInfo(token));
    } catch (error) {
      logger.error('Failed to search tokens', { error, query, chainId });
      return [];
    }
  }

  private validateTokenParams(params: TokenCreationParams): void {
    if (!params.name || params.name.length < 2) {
      throw new Error('Token name must be at least 2 characters');
    }

    if (!params.symbol || params.symbol.length < 1 || params.symbol.length > 10) {
      throw new Error('Token symbol must be 1-10 characters');
    }

    if (!params.totalSupply || BigInt(params.totalSupply) <= 0) {
      throw new Error('Total supply must be greater than 0');
    }

    if (params.decimals < 0 || params.decimals > 18) {
      throw new Error('Decimals must be between 0 and 18');
    }

    if (!ethers.isAddress(params.creator)) {
      throw new Error('Invalid creator address');
    }
  }

  private async deployTokenContract(params: TokenCreationParams, chainService: any): Promise<string> {
    try {
      // Get token factory contract address
      const tokenFactoryAddress = process.env[`${chainService.config.name.toUpperCase()}_TOKEN_FACTORY`];
      if (!tokenFactoryAddress) {
        throw new Error(`Token factory not deployed on ${chainService.config.name}`);
      }

      // Create deployment transaction
      const deployTx = {
        to: tokenFactoryAddress,
        data: this.encodeTokenCreation(params),
        value: '0',
        gasLimit: '2000000'
      };

      // Send transaction
      const result = await chainService.sendTransaction(deployTx);
      
      if (result.status !== 'confirmed') {
        throw new Error('Token deployment transaction failed');
      }

      // Extract token address from transaction receipt
      const tokenAddress = await this.extractTokenAddress(result.hash, chainService);
      
      return tokenAddress;
    } catch (error) {
      logger.error('Failed to deploy token contract', { error, params });
      throw error;
    }
  }

  private encodeTokenCreation(params: TokenCreationParams): string {
    try {
      // Encode function call for token creation
      const iface = new ethers.Interface([
        'function createToken(string name, string symbol, uint256 totalSupply, uint8 decimals, string description, string logoUrl) returns (address)'
      ]);

      return iface.encodeFunctionData('createToken', [
        params.name,
        params.symbol,
        params.totalSupply,
        params.decimals,
        params.description || '',
        params.logoUrl || ''
      ]);
    } catch (error) {
      logger.error('Failed to encode token creation', { error, params });
      throw error;
    }
  }

  private async extractTokenAddress(txHash: string, chainService: any): Promise<string> {
    try {
      // Get transaction receipt
      const receipt = await chainService.provider.getTransactionReceipt(txHash);
      
      if (!receipt || !receipt.logs) {
        throw new Error('No logs found in transaction receipt');
      }

      // Find TokenCreated event
      const tokenCreatedTopic = ethers.id('TokenCreated(address,address,string,string,uint256)');
      const log = receipt.logs.find(log => log.topics[0] === tokenCreatedTopic);
      
      if (!log) {
        throw new Error('TokenCreated event not found');
      }

      // Decode token address from event
      const tokenAddress = ethers.getAddress('0x' + log.topics[1].slice(26));
      return tokenAddress;
    } catch (error) {
      logger.error('Failed to extract token address', { error, txHash });
      throw error;
    }
  }

  private async createTokenRecord(params: TokenCreationParams & { address: string }): Promise<Token> {
    try {
      const token = new Token();
      token.address = params.address.toLowerCase();
      token.name = params.name;
      token.symbol = params.symbol;
      token.totalSupply = params.totalSupply;
      token.decimals = params.decimals;
      token.chainId = params.chainId;
      token.creator = params.creator.toLowerCase();
      token.description = params.description;
      token.logoUrl = params.logoUrl;
      token.hasLiquidity = false;
      token.createdAt = new Date();

      return await token.save();
    } catch (error) {
      logger.error('Failed to create token record', { error, params });
      throw error;
    }
  }

  private async setupInitialLiquidity(token: Token, liquidityAmount: string, chainService: any): Promise<void> {
    try {
      logger.info('Setting up initial liquidity', { 
        address: token.address,
        amount: liquidityAmount 
      });

      // Implementation would depend on the DEX contract
      // For now, just mark as having liquidity
      token.hasLiquidity = true;
      await token.save();
    } catch (error) {
      logger.error('Failed to setup initial liquidity', { error, token: token.address });
    }
  }

  private formatTokenInfo(token: Token): TokenInfo {
    return {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      totalSupply: token.totalSupply,
      decimals: token.decimals,
      chainId: token.chainId,
      creator: token.creator,
      createdAt: token.createdAt,
      hasLiquidity: token.hasLiquidity,
      volume24h: token.volume24h,
      holders: token.holders,
      marketCap: token.marketCap
    };
  }
}
