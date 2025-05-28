
// Export API client and types
export { apiClient, ApiError } from './client'
export type { ApiResponse } from './client'

// Export all API services
export { bridgeApi } from './bridge'
export { walletApi } from './wallet'
export { tokensApi } from './tokens'
export { tradingApi } from './trading'

// Re-export all types for convenience
export type * from './bridge'
export type * from './wallet'
export type * from './tokens'
export type * from './trading'

// Utility function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Utility function to format API responses
export const formatApiResponse = <T>(response: { data: T; success: boolean; message?: string }) => {
  if (!response.success) {
    throw new Error(response.message || 'API request failed')
  }
  return response.data
}
