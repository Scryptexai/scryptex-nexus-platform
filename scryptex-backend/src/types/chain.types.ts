
export interface ChainConfig {
  chainId: number;
  name: string;
  rpc: string;
  websocket?: string;
  explorer: string;
  faucet?: string;
  currency: string;
  type: ChainType;
  specialization: string;
  features: string[];
  isMainTest?: boolean;
  contracts?: {
    bridge?: string;
    pump?: string;
    tokenFactory?: string;
    quest?: string;
  };
}

export type ChainType = 
  | 'ETHEREUM_TESTNET'
  | 'L2_OPTIMIZED' 
  | 'ZK_ROLLUP'
  | 'AI_OPTIMIZED'
  | 'GAMING_OPTIMIZED';

export interface TransactionParams {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

export interface ChainMetrics {
  blockHeight: number;
  lastBlockTime: number;
  rpcLatency: number;
  connectionStatus: 'connected' | 'disconnected' | 'degraded';
  contractStatus: Record<string, 'healthy' | 'warning' | 'error'>;
  tps: number;
  avgBlockTime: number;
}

export interface ChainSpecificData {
  [key: string]: any;
}
