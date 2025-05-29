
export interface BridgeRequest {
  id: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
  sender: string;
  deadline?: number;
  minReceived?: string;
}

export interface BridgeQuote {
  requestId: string;
  fromAmount: string;
  toAmount: string;
  estimatedFee: string;
  estimatedTime: number; // seconds
  priceImpact: number; // percentage
  route: BridgeRoute[];
}

export interface BridgeRoute {
  fromChain: number;
  toChain: number;
  protocol: string;
  estimatedTime: number;
  fee: string;
}

export interface BridgeTransaction {
  id: string;
  requestId: string;
  status: BridgeStatus;
  fromChain: number;
  toChain: number;
  fromTxHash?: string;
  toTxHash?: string;
  amount: string;
  fee: string;
  recipient: string;
  sender: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export type BridgeStatus = 
  | 'pending'
  | 'confirmed_source'
  | 'processing'
  | 'confirmed_target'
  | 'completed'
  | 'failed'
  | 'expired';

export interface CrossChainMessage {
  id: string;
  sourceChain: number;
  targetChain: number;
  messageType: string;
  payload: any;
  status: 'pending' | 'relayed' | 'executed' | 'failed';
  signatures: string[];
  validators: string[];
  createdAt: Date;
}
