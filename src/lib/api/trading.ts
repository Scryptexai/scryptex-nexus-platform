
import { apiClient, ApiResponse } from './client'

export interface SwapParams {
  chainId: number
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOutMin: string
  recipient: string
  slippage: number
}

export interface SwapQuote {
  amountOut: string
  priceImpact: string
  minimumAmountOut: string
  route: string[]
  gasEstimate: string
  fee: string
}

export interface LiquidityPosition {
  id: string
  tokenA: string
  tokenB: string
  amountA: string
  amountB: string
  shares: string
  chainId: number
  createdAt: string
  apy: string
}

export interface TradingPair {
  tokenA: string
  tokenB: string
  reserveA: string
  reserveB: string
  price: string
  volume24h: string
  fee: string
  chainId: number
}

export interface Trade {
  hash: string
  chainId: number
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  price: string
  fee: string
  trader: string
  timestamp: string
  type: 'buy' | 'sell'
}

class TradingApi {
  // Swap operations
  async getSwapQuote(params: Omit<SwapParams, 'amountOutMin' | 'recipient'>): Promise<ApiResponse<SwapQuote>> {
    return apiClient.post('/trading/quote', params)
  }

  async executeSwap(params: SwapParams): Promise<ApiResponse<{ transactionHash: string }>> {
    return apiClient.post('/trading/swap', params)
  }

  // Liquidity operations
  async addLiquidity(params: {
    chainId: number
    tokenA: string
    tokenB: string
    amountA: string
    amountB: string
    recipient: string
  }): Promise<ApiResponse<{ transactionHash: string; liquidityTokens: string }>> {
    return apiClient.post('/trading/add-liquidity', params)
  }

  async removeLiquidity(params: {
    chainId: number
    tokenA: string
    tokenB: string
    liquidity: string
    amountAMin: string
    amountBMin: string
    recipient: string
  }): Promise<ApiResponse<{ transactionHash: string }>> {
    return apiClient.post('/trading/remove-liquidity', params)
  }

  async getUserLiquidityPositions(address: string, chainId?: number): Promise<ApiResponse<LiquidityPosition[]>> {
    return apiClient.get(`/trading/liquidity/${address}`, { chainId })
  }

  // Trading pairs and market data
  async getTradingPairs(chainId?: number): Promise<ApiResponse<TradingPair[]>> {
    return apiClient.get('/trading/pairs', { chainId })
  }

  async getPairInfo(tokenA: string, tokenB: string, chainId: number): Promise<ApiResponse<TradingPair>> {
    return apiClient.get(`/trading/pair/${chainId}/${tokenA}/${tokenB}`)
  }

  async getTokenPrice(address: string, chainId: number): Promise<ApiResponse<{ price: string; priceChange24h: string }>> {
    return apiClient.get(`/trading/price/${chainId}/${address}`)
  }

  // Trading history and analytics
  async getTradeHistory(
    address: string,
    params?: {
      chainId?: number
      tokenAddress?: string
      page?: number
      limit?: number
    }
  ): Promise<ApiResponse<{ trades: Trade[]; total: number; page: number }>> {
    return apiClient.get(`/trading/history/${address}`, params)
  }

  async getRecentTrades(
    tokenA: string, 
    tokenB: string, 
    chainId: number, 
    limit?: number
  ): Promise<ApiResponse<Trade[]>> {
    return apiClient.get(`/trading/recent-trades/${chainId}/${tokenA}/${tokenB}`, { limit })
  }

  async getTradingVolume(
    timeframe: '24h' | '7d' | '30d',
    chainId?: number
  ): Promise<ApiResponse<{
    totalVolume: string
    volumeByPair: Array<{
      tokenA: string
      tokenB: string
      volume: string
    }>
  }>> {
    return apiClient.get('/trading/volume', { timeframe, chainId })
  }

  // Price charts
  async getPriceChart(
    tokenA: string,
    tokenB: string,
    chainId: number,
    timeframe: '1h' | '4h' | '1d' | '1w'
  ): Promise<ApiResponse<Array<{
    timestamp: string
    open: string
    high: string
    low: string
    close: string
    volume: string
  }>>> {
    return apiClient.get(`/trading/chart/${chainId}/${tokenA}/${tokenB}`, { timeframe })
  }
}

export const tradingApi = new TradingApi()
