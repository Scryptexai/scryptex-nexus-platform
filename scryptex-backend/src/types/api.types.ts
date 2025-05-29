
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export interface RequestWithUser extends Request {
  user?: {
    address: string;
    chainId: number;
    nonce: string;
  };
}

export interface AuthTokenPayload {
  address: string;
  chainId: number;
  iat: number;
  exp: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
