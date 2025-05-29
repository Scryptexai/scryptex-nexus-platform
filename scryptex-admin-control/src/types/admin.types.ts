
export interface AdminUser {
  id: string
  username: string
  email: string
  role: AdminRole
  permissions: Permission[]
  lastLogin: Date
  mfaEnabled: boolean
  ipWhitelist: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type AdminRole = 'super_admin' | 'admin' | 'operator' | 'viewer'

export interface Permission {
  resource: string
  actions: ('read' | 'write' | 'delete' | 'control')[]
}

export interface AuthSession {
  user: AdminUser
  token: string
  expiresAt: Date
  mfaVerified: boolean
  ipAddress: string
  userAgent: string
}

export interface MFASetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface SystemHealth {
  overall: HealthStatus
  components: {
    database: ComponentHealth
    redis: ComponentHealth
    blockchain: Record<number, ComponentHealth>
    bridge: ComponentHealth
    api: ComponentHealth
    websocket: ComponentHealth
  }
  metrics: SystemMetrics
  lastUpdated: Date
}

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

export interface ComponentHealth {
  status: HealthStatus
  message: string
  responseTime: number
  lastCheck: Date
  details?: Record<string, any>
}

export interface SystemMetrics {
  uptime: number
  responseTime: number
  errorRate: number
  throughput: number
  activeUsers: number
  totalTransactions: number
  memoryUsage: number
  cpuUsage: number
}

export interface UserProfile {
  address: string
  username?: string
  email?: string
  reputationScore: number
  totalVolume: string
  farmingScore: number
  isVerified: boolean
  isBlacklisted: boolean
  riskScore: number
  createdAt: Date
  lastActivity: Date
  walletInfo: WalletInfo
  activitySummary: ActivitySummary
}

export interface WalletInfo {
  address: string
  chainBalances: Record<number, string>
  totalValueUSD: string
  transactionCount: number
  firstTransaction: Date
  lastTransaction: Date
}

export interface ActivitySummary {
  totalTransactions: number
  bridgeTransactions: number
  swapTransactions: number
  volumeUSD: string
  uniqueChains: number
  avgTransactionSize: string
  lastAction: string
  lastActionTime: Date
}

export interface BridgeTransaction {
  id: string
  userAddress: string
  sourceChainId: number
  targetChainId: number
  sourceTokenAddress: string
  targetTokenAddress: string
  amount: string
  bridgeFee: string
  status: BridgeStatus
  sourceTxHash?: string
  targetTxHash?: string
  bridgeRequestId?: string
  estimatedCompletion?: Date
  initiatedAt: Date
  confirmedAt?: Date
  completedAt?: Date
  failedAt?: Date
  errorMessage?: string
}

export type BridgeStatus = 'pending' | 'confirming' | 'bridging' | 'completed' | 'failed' | 'cancelled'

export interface PlatformStats {
  totalUsers: number
  activeUsers24h: number
  totalTransactions: number
  totalVolumeUSD: string
  totalBridgeVolume: string
  totalFees: string
  averageTransactionValue: string
  topChainsByVolume: ChainVolumeData[]
  recentTransactions: TransactionSummary[]
}

export interface ChainVolumeData {
  chainId: number
  chainName: string
  volume24h: string
  transactionCount: number
  uniqueUsers: number
}

export interface TransactionSummary {
  hash: string
  type: 'bridge' | 'swap' | 'deploy'
  userAddress: string
  chainId: number
  amount: string
  timestamp: Date
  status: string
}

export interface SecurityAlert {
  id: string
  type: SecurityAlertType
  severity: AlertSeverity
  message: string
  userAddress?: string
  ipAddress?: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export type SecurityAlertType = 
  | 'failed_login' 
  | 'suspicious_activity' 
  | 'rate_limit_exceeded' 
  | 'unauthorized_access' 
  | 'data_breach' 
  | 'system_intrusion'
  | 'transaction_anomaly'
  | 'bridge_failure'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  category: LogCategory
  message: string
  metadata?: Record<string, any>
  userAddress?: string
  ipAddress?: string
  requestId?: string
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

export type LogCategory = 
  | 'system' 
  | 'security' 
  | 'application' 
  | 'database' 
  | 'blockchain' 
  | 'bridge' 
  | 'user' 
  | 'api'

export interface EmergencyAction {
  type: EmergencyActionType
  description: string
  requiresConfirmation: boolean
  confirmationMessage: string
  estimatedDowntime?: string
  reversible: boolean
}

export type EmergencyActionType = 
  | 'pause_platform' 
  | 'pause_bridge' 
  | 'pause_trading' 
  | 'enable_maintenance' 
  | 'force_logout_all'
  | 'emergency_withdraw'
  | 'pause_contract'

export interface AdminAction {
  id: string
  adminUser: string
  action: AdminActionType
  target: string
  details: Record<string, any>
  timestamp: Date
  success: boolean
  errorMessage?: string
}

export type AdminActionType = 
  | 'user_suspend' 
  | 'user_unsuspend' 
  | 'user_flag' 
  | 'platform_pause' 
  | 'bridge_control' 
  | 'emergency_action'
  | 'config_update'
  | 'contract_interaction'

export interface AnalyticsData {
  timeRange: {
    start: Date
    end: Date
  }
  metrics: {
    userGrowth: GrowthMetrics
    transactionVolume: VolumeMetrics
    bridgeAnalytics: BridgeAnalytics
    chainAnalytics: ChainAnalytics
    securityMetrics: SecurityMetrics
  }
}

export interface GrowthMetrics {
  totalUsers: number
  newUsers: number
  activeUsers: number
  retentionRate: number
  growthRate: number
  churnRate: number
}

export interface VolumeMetrics {
  totalVolume: string
  volumeChange: number
  averageTransactionSize: string
  transactionCount: number
  feeGenerated: string
}

export interface BridgeAnalytics {
  totalBridgeVolume: string
  bridgeTransactionCount: number
  successRate: number
  averageBridgeTime: number
  popularRoutes: RouteData[]
  failureReasons: FailureData[]
}

export interface RouteData {
  fromChain: number
  toChain: number
  volume: string
  transactionCount: number
  successRate: number
}

export interface FailureData {
  reason: string
  count: number
  percentage: number
}

export interface ChainAnalytics {
  [chainId: number]: {
    transactionCount: number
    volume: string
    uniqueUsers: number
    averageGasPrice: string
    blockTime: number
    successRate: number
  }
}

export interface SecurityMetrics {
  failedLoginAttempts: number
  blockedIPs: number
  suspiciousActivities: number
  threatLevel: ThreatLevel
  vulnerabilities: VulnerabilityData[]
}

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'

export interface VulnerabilityData {
  type: string
  severity: AlertSeverity
  description: string
  affectedSystems: string[]
  mitigated: boolean
}
