
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { AdminAuthService } from './admin-auth'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

class AdminApiClient {
  private client: AxiosInstance
  private baseURL: string
  private apiSecret: string

  constructor() {
    this.baseURL = process.env.BACKEND_API_URL || 'http://localhost:3001'
    this.apiSecret = process.env.BACKEND_ADMIN_KEY || 'admin-backend-access-key'

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': this.apiSecret,
        'X-Admin-Source': 'SCRYPTEX_ADMIN_DASHBOARD'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to all requests
        config.headers['X-Request-Time'] = new Date().toISOString()
        
        // Add admin session info if available
        if (typeof window !== 'undefined') {
          const sessionToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('admin-session='))
            ?.split('=')[1]
          
          if (sessionToken) {
            config.headers['X-Admin-Session'] = sessionToken
          }
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      (error: AxiosError<ApiResponse>) => {
        this.handleApiError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleApiError(error: AxiosError<ApiResponse>): void {
    const status = error.response?.status
    const message = error.response?.data?.error || error.message

    console.error(`API Error [${status}]:`, message)

    // Handle specific error cases
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
        break
      case 403:
        // Forbidden - insufficient permissions
        console.error('Insufficient permissions for this operation')
        break
      case 429:
        // Rate limited
        console.error('API rate limit exceeded')
        break
      case 500:
        // Server error
        console.error('Internal server error')
        break
      default:
        console.error('Unknown API error:', error)
    }
  }

  // Platform Statistics
  async getPlatformStats(): Promise<ApiResponse> {
    const response = await this.client.get('/api/admin/platform/stats')
    return response.data
  }

  async getSystemHealth(): Promise<ApiResponse> {
    const response = await this.client.get('/api/admin/system/health')
    return response.data
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 50): Promise<ApiResponse> {
    const response = await this.client.get(`/api/admin/users?page=${page}&limit=${limit}`)
    return response.data
  }

  async getUserDetails(address: string): Promise<ApiResponse> {
    const response = await this.client.get(`/api/admin/users/${address}`)
    return response.data
  }

  async getUserActivity(address: string, page: number = 1): Promise<ApiResponse> {
    const response = await this.client.get(`/api/admin/users/${address}/activity?page=${page}`)
    return response.data
  }

  async suspendUser(address: string, reason: string): Promise<ApiResponse> {
    const response = await this.client.post(`/api/admin/users/${address}/suspend`, { reason })
    return response.data
  }

  async unsuspendUser(address: string): Promise<ApiResponse> {
    const response = await this.client.post(`/api/admin/users/${address}/unsuspend`)
    return response.data
  }

  async flagUser(address: string, flagType: string, reason: string): Promise<ApiResponse> {
    const response = await this.client.post(`/api/admin/users/${address}/flag`, { flagType, reason })
    return response.data
  }

  // Bridge Management
  async getBridgeStats(): Promise<ApiResponse> {
    const response = await this.client.get('/api/admin/bridge/stats')
    return response.data
  }

  async getBridgeTransactions(page: number = 1, limit: number = 50): Promise<ApiResponse> {
    const response = await this.client.get(`/api/admin/bridge/transactions?page=${page}&limit=${limit}`)
    return response.data
  }

  async getBridgeHealth(): Promise<ApiResponse> {
    const response = await this.client.get('/api/admin/bridge/health')
    return response.data
  }

  async pauseBridge(fromChain: number, toChain: number, reason: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/bridge/pause', { fromChain, toChain, reason })
    return response.data
  }

  async resumeBridge(fromChain: number, toChain: number): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/bridge/resume', { fromChain, toChain })
    return response.data
  }

  // Trading Management
  async getTradingStats(): Promise<ApiResponse> {
    const response = await this.client.get('/api/admin/trading/stats')
    return response.data
  }

  async getTradingPairs(): Promise<ApiResponse> {
    const response = await this.client.get('/api/admin/trading/pairs')
    return response.data
  }

  async pauseTrading(chainId: number, reason: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/trading/pause', { chainId, reason })
    return response.data
  }

  async resumeTrading(chainId: number): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/trading/resume', { chainId })
    return response.data
  }

  // Security & Monitoring
  async getSecurityAlerts(page: number = 1, severity?: string): Promise<ApiResponse> {
    const params = new URLSearchParams({ page: page.toString() })
    if (severity) params.append('severity', severity)
    
    const response = await this.client.get(`/api/admin/security/alerts?${params}`)
    return response.data
  }

  async getAuditLogs(page: number = 1, category?: string): Promise<ApiResponse> {
    const params = new URLSearchParams({ page: page.toString() })
    if (category) params.append('category', category)
    
    const response = await this.client.get(`/api/admin/audit/logs?${params}`)
    return response.data
  }

  async getSystemLogs(page: number = 1, level?: string): Promise<ApiResponse> {
    const params = new URLSearchParams({ page: page.toString() })
    if (level) params.append('level', level)
    
    const response = await this.client.get(`/api/admin/system/logs?${params}`)
    return response.data
  }

  // Emergency Controls
  async pausePlatform(reason: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/emergency/pause-platform', { reason })
    return response.data
  }

  async resumePlatform(): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/emergency/resume-platform')
    return response.data
  }

  async enableMaintenanceMode(message: string, estimatedDuration: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/emergency/maintenance', { 
      message, 
      estimatedDuration 
    })
    return response.data
  }

  async disableMaintenanceMode(): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/emergency/maintenance/disable')
    return response.data
  }

  // Analytics
  async getAnalytics(timeRange: string, metrics: string[]): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/analytics', { timeRange, metrics })
    return response.data
  }

  async generateReport(reportType: string, parameters: Record<string, any>): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/reports/generate', { 
      reportType, 
      parameters 
    })
    return response.data
  }

  // Smart Contract Management
  async getContractStatus(chainId: number): Promise<ApiResponse> {
    const response = await this.client.get(`/api/admin/contracts/${chainId}/status`)
    return response.data
  }

  async pauseContract(chainId: number, contractAddress: string, reason: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/contracts/pause', { 
      chainId, 
      contractAddress, 
      reason 
    })
    return response.data
  }

  async resumeContract(chainId: number, contractAddress: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/admin/contracts/resume', { 
      chainId, 
      contractAddress 
    })
    return response.data
  }

  // Real-time updates
  connectWebSocket(): WebSocket | null {
    if (typeof window === 'undefined') return null

    const wsUrl = process.env.BACKEND_WEBSOCKET_URL || 'ws://localhost:3002'
    const ws = new WebSocket(`${wsUrl}/admin`)

    ws.onopen = () => {
      console.log('Admin WebSocket connected')
    }

    ws.onerror = (error) => {
      console.error('Admin WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('Admin WebSocket disconnected')
    }

    return ws
  }
}

export const adminApiClient = new AdminApiClient()
export default adminApiClient
