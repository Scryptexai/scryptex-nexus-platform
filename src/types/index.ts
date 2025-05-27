
// Core Types for SCRYPTEX Platform

export interface Chain {
  id: string
  name: string
  chainId: number
  currency: string
  rpcUrl: string
  description: string
  color: string
}

export interface DashboardData {
  totalTokensCreated: number
  totalTradingVolume: string
  communityMembers: number
  completedQuests: number
  analyticsScore: number
  airdropEligibility: number
}

export interface TokenCreationData {
  name: string
  symbol: string
  totalSupply: string
  description: string
  logoUrl?: string
  deploymentChain: 'auto' | 'risechain'
}

export interface Token {
  id: number
  name: string
  symbol: string
  totalSupply: string
  currentPrice: string
  change24h: string
  volume24h: string
  holders: number
  chain: string
  isPositive: boolean
  logo: string
  address?: string
}

export interface TradingPair {
  id: string
  tokenA: Token
  tokenB: Token
  price: string
  volume24h: string
  liquidity: string
}

export interface Activity {
  type: string
  title: string
  description: string
  timestamp: string
  chain: string
  icon: any
  color: string
}

export interface Quest {
  id: string
  title: string
  description: string
  reward: string
  progress: number
  maxProgress: number
  type: 'daily' | 'weekly' | 'special'
  chain: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

export interface APIResponse<T> {
  success: boolean
  data: T
  chainOperations?: ChainOperation[]
}

export interface ChainOperation {
  chainId: number
  operation: string
  transactionHash?: string
  status: 'pending' | 'completed' | 'failed'
}
