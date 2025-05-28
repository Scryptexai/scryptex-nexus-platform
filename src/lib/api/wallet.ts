
import { apiClient, ApiResponse } from './client'

export interface TokenBalance {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  price?: string
  value?: string
}

export interface ChainBalance {
  chainId: number
  nativeBalance: string
  tokens: TokenBalance[]
  totalValue: string
}

export interface MultiChainBalance {
  address: string
  chains: ChainBalance[]
  totalValue: string
  lastUpdated: string
}

export interface WalletTransaction {
  hash: string
  chainId: number
  from: string
  to: string
  value: string
  token?: string
  type: 'send' | 'receive' | 'swap' | 'bridge'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  gasUsed?: string
  gasFee?: string
}

class WalletApi {
  // Balance operations
  async getMultiChainBalances(address: string): Promise<ApiResponse<MultiChainBalance>> {
    return apiClient.get(`/wallet/balances/${address}`)
  }

  async getChainBalance(address: string, chainId: number): Promise<ApiResponse<ChainBalance>> {
    return apiClient.get(`/wallet/balances/${address}/${chainId}`)
  }

  async getTokenBalance(
    address: string, 
    chainId: number, 
    tokenAddress: string
  ): Promise<ApiResponse<TokenBalance>> {
    return apiClient.get(`/wallet/token-balance/${address}/${chainId}/${tokenAddress}`)
  }

  // Transaction history
  async getTransactionHistory(
    address: string,
    params?: { 
      chainId?: number
      page?: number
      limit?: number
      type?: string
    }
  ): Promise<ApiResponse<{ transactions: WalletTransaction[]; total: number; page: number }>> {
    return apiClient.get(`/wallet/transactions/${address}`, params)
  }

  async getTransaction(chainId: number, hash: string): Promise<ApiResponse<WalletTransaction>> {
    return apiClient.get(`/wallet/transaction/${chainId}/${hash}`)
  }

  // Wallet validation and verification
  async validateAddress(address: string, chainId: number): Promise<ApiResponse<{ valid: boolean }>> {
    return apiClient.get('/wallet/validate-address', { address, chainId })
  }

  async verifySignature(
    address: string, 
    message: string, 
    signature: string
  ): Promise<ApiResponse<{ valid: boolean }>> {
    return apiClient.post('/wallet/verify-signature', { address, message, signature })
  }

  // Portfolio tracking
  async getPortfolioValue(address: string): Promise<ApiResponse<{
    totalValue: string
    chains: Array<{
      chainId: number
      value: string
      percentage: number
    }>
    topTokens: Array<{
      symbol: string
      value: string
      percentage: number
    }>
  }>> {
    return apiClient.get(`/wallet/portfolio/${address}`)
  }

  async getPortfolioHistory(
    address: string, 
    timeframe: '24h' | '7d' | '30d' | '90d'
  ): Promise<ApiResponse<Array<{
    timestamp: string
    totalValue: string
    chainValues: Record<number, string>
  }>>> {
    return apiClient.get(`/wallet/portfolio-history/${address}`, { timeframe })
  }
}

export const walletApi = new WalletApi()
