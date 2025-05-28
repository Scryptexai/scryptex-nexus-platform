
import { apiClient, ApiResponse } from './client'

export interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  chainId: number
  creator: string
  createdAt: string
  verified: boolean
  logo?: string
  description?: string
  website?: string
  twitter?: string
  telegram?: string
}

export interface TokenMetrics {
  address: string
  price: string
  priceChange24h: string
  volume24h: string
  marketCap: string
  holders: number
  transfers24h: number
  liquidityETH: string
}

export interface CreateTokenParams {
  name: string
  symbol: string
  totalSupply: string
  decimals: number
  chainId: number
  description?: string
  logo?: string
  website?: string
  twitter?: string
  telegram?: string
  autoLiquidity?: boolean
  liquidityETH?: string
}

export interface TokenCreationResult {
  address: string
  transactionHash: string
  deploymentFee: string
  liquidityTxHash?: string
}

class TokensApi {
  // Token creation
  async createToken(params: CreateTokenParams): Promise<ApiResponse<TokenCreationResult>> {
    return apiClient.post('/tokens/create', params)
  }

  async estimateCreationFee(chainId: number): Promise<ApiResponse<{ fee: string; gasEstimate: string }>> {
    return apiClient.get(`/tokens/creation-fee/${chainId}`)
  }

  // Token information
  async getTokenInfo(address: string, chainId: number): Promise<ApiResponse<TokenInfo>> {
    return apiClient.get(`/tokens/info/${chainId}/${address}`)
  }

  async getTokenMetrics(address: string, chainId: number): Promise<ApiResponse<TokenMetrics>> {
    return apiClient.get(`/tokens/metrics/${chainId}/${address}`)
  }

  async searchTokens(query: string, chainId?: number): Promise<ApiResponse<TokenInfo[]>> {
    return apiClient.get('/tokens/search', { query, chainId })
  }

  // Token lists
  async getTrendingTokens(chainId?: number): Promise<ApiResponse<Array<TokenInfo & TokenMetrics>>> {
    return apiClient.get('/tokens/trending', { chainId })
  }

  async getNewTokens(chainId?: number, limit?: number): Promise<ApiResponse<TokenInfo[]>> {
    return apiClient.get('/tokens/new', { chainId, limit })
  }

  async getUserTokens(address: string): Promise<ApiResponse<TokenInfo[]>> {
    return apiClient.get(`/tokens/user/${address}`)
  }

  async getPopularTokens(chainId?: number): Promise<ApiResponse<Array<TokenInfo & TokenMetrics>>> {
    return apiClient.get('/tokens/popular', { chainId })
  }

  // Token verification
  async requestVerification(tokenAddress: string, chainId: number, metadata: {
    website?: string
    twitter?: string
    telegram?: string
    description?: string
    logo?: string
  }): Promise<ApiResponse<{ requestId: string }>> {
    return apiClient.post('/tokens/verify', { tokenAddress, chainId, metadata })
  }

  async getVerificationStatus(requestId: string): Promise<ApiResponse<{
    status: 'pending' | 'approved' | 'rejected'
    reason?: string
  }>> {
    return apiClient.get(`/tokens/verification-status/${requestId}`)
  }

  // Token analytics
  async getTokenAnalytics(
    address: string, 
    chainId: number, 
    timeframe: '1h' | '24h' | '7d' | '30d'
  ): Promise<ApiResponse<{
    priceHistory: Array<{ timestamp: string; price: string }>
    volumeHistory: Array<{ timestamp: string; volume: string }>
    holderHistory: Array<{ timestamp: string; holders: number }>
  }>> {
    return apiClient.get(`/tokens/analytics/${chainId}/${address}`, { timeframe })
  }
}

export const tokensApi = new TokensApi()
