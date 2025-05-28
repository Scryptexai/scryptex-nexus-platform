
import { apiClient, ApiResponse } from './client'

export interface BridgeParams {
  sourceChain: number
  targetChain: number
  token: string
  amount: string
  recipient: string
  slippage?: number
}

export interface BridgeStatus {
  id: string
  status: 'pending' | 'confirming' | 'bridging' | 'completed' | 'failed'
  progress: number
  sourceTxHash?: string
  targetTxHash?: string
  estimatedCompletion?: string
  sourceChain: number
  targetChain: number
  token: string
  amount: string
  fee: string
  createdAt: string
  updatedAt: string
}

export interface BridgeRoute {
  path: number[]
  estimatedTime: number
  totalFees: string
  priceImpact: string
  confidence: number
  protocol: string
}

export interface BridgeTransaction {
  id: string
  sourceChain: number
  targetChain: number
  sourceToken: string
  targetToken: string
  amount: string
  status: BridgeStatus['status']
  sourceTxHash: string
  targetTxHash?: string
  fee: string
  createdAt: string
  completedAt?: string
}

export interface BridgeVolume {
  totalVolume: string
  dailyVolume: string
  weeklyVolume: string
  monthlyVolume: string
  topRoutes: Array<{
    sourceChain: number
    targetChain: number
    volume: string
    count: number
  }>
}

class BridgeApi {
  // Bridge transaction operations
  async initiateBridge(params: BridgeParams): Promise<ApiResponse<{ transactionId: string; txHash: string }>> {
    return apiClient.post('/bridge/initiate', params)
  }

  async getBridgeStatus(transactionId: string): Promise<ApiResponse<BridgeStatus>> {
    return apiClient.get(`/bridge/status/${transactionId}`)
  }

  async getBridgeHistory(
    address: string, 
    params?: { page?: number; limit?: number; chain?: number }
  ): Promise<ApiResponse<{ transactions: BridgeTransaction[]; total: number; page: number }>> {
    return apiClient.get(`/bridge/history/${address}`, params)
  }

  // Bridge route and fee estimation
  async getBridgeRoutes(sourceChain: number, targetChain: number): Promise<ApiResponse<BridgeRoute[]>> {
    return apiClient.get(`/bridge/routes/${sourceChain}/${targetChain}`)
  }

  async estimateBridgeFee(params: BridgeParams): Promise<ApiResponse<{ fee: string; gasEstimate: string }>> {
    return apiClient.post('/bridge/estimate-fee', params)
  }

  async getOptimalRoute(
    sourceChain: number, 
    targetChain: number, 
    token: string, 
    amount: string
  ): Promise<ApiResponse<BridgeRoute>> {
    return apiClient.get('/bridge/optimal-route', {
      sourceChain,
      targetChain,
      token,
      amount
    })
  }

  // Bridge analytics
  async getBridgeVolume(timeframe?: '24h' | '7d' | '30d'): Promise<ApiResponse<BridgeVolume>> {
    return apiClient.get('/bridge/analytics/volume', { timeframe })
  }

  async getBridgeStats(): Promise<ApiResponse<{
    totalBridges: number
    totalVolume: string
    averageTime: number
    successRate: number
  }>> {
    return apiClient.get('/bridge/analytics/stats')
  }

  // Real-time updates
  async subscribeToBridgeUpdates(transactionId: string, callback: (status: BridgeStatus) => void): Promise<() => void> {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/bridge/${transactionId}`)
    
    ws.onmessage = (event) => {
      const status = JSON.parse(event.data) as BridgeStatus
      callback(status)
    }

    return () => ws.close()
  }
}

export const bridgeApi = new BridgeApi()
