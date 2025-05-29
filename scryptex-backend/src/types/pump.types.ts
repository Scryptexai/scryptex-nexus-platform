
export interface PumpToken {
  address: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
  chainId: number;
  
  // PUMP.FUN Specific
  bondingCurve: {
    currentPrice: string;
    marketCap: string;
    progress: number; // 0-100%
    graduationThreshold: string; // Usually $69K
    totalSupply: string;
    circulatingSupply: string;
    reserveBalance: string;
  };
  
  // Trading Data
  volume24h: string;
  holders: number;
  transactions: number;
  liquidity: string;
  
  // Metadata
  website?: string;
  twitter?: string;
  telegram?: string;
  
  // Status
  isGraduated: boolean; // Moved to DEX
  launchTime: number;
  graduationTime?: number;
  
  // Stats
  createdAt: Date;
  updatedAt: Date;
}

export interface PumpTradeInfo {
  type: 'buy' | 'sell';
  tokenAmount: string;
  ethAmount: string;
  priceImpact: number;
  newPrice: string;
  newMarketCap: string;
  slippage: number;
  fee: string;
}

export interface PumpTransaction {
  id: string;
  tokenAddress: string;
  trader: string;
  type: 'buy' | 'sell';
  tokenAmount: string;
  ethAmount: string;
  price: string;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  chainId: number;
}

export interface BondingCurveParams {
  basePrice: string;
  maxSupply: string;
  graduationThreshold: string;
  k: number; // curve steepness
  initialLiquidity: string;
}

export interface TokenLaunchParams {
  name: string;
  symbol: string;
  description: string;
  image: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  initialSupply: string;
  bondingCurveParams: BondingCurveParams;
}
