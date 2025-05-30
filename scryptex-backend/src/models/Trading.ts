
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('trading_pairs')
@Index(['chainId', 'tokenA', 'tokenB'], { unique: true })
@Index(['chainId'])
export class TradingPair {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  chainId: number;

  @Column({ type: 'varchar', length: 42 })
  tokenA: string;

  @Column({ type: 'varchar', length: 42 })
  tokenB: string;

  @Column({ type: 'varchar', length: 42 })
  pairAddress: string;

  @Column({ type: 'varchar', length: 78 })
  reserveA: string;

  @Column({ type: 'varchar', length: 78 })
  reserveB: string;

  @Column({ type: 'varchar', length: 78, default: '0' })
  totalSupply: string;

  @Column({ type: 'varchar', length: 78, default: '0' })
  volume24h: string;

  @Column({ type: 'varchar', length: 78, default: '0' })
  volumeWeek: string;

  @Column({ type: 'int', default: 30 }) // 0.3% in basis points
  feeRate: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 66, nullable: true })
  creationTxHash?: string;

  @Column({ type: 'int', nullable: true })
  creationBlockNumber?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated properties
  get price(): string {
    try {
      const reserveABN = BigInt(this.reserveA);
      const reserveBBN = BigInt(this.reserveB);
      
      if (reserveBBN === BigInt(0)) return '0';
      
      return (reserveABN * BigInt(1e18) / reserveBBN).toString();
    } catch {
      return '0';
    }
  }

  get inversePrice(): string {
    try {
      const reserveABN = BigInt(this.reserveA);
      const reserveBBN = BigInt(this.reserveB);
      
      if (reserveABN === BigInt(0)) return '0';
      
      return (reserveBBN * BigInt(1e18) / reserveABN).toString();
    } catch {
      return '0';
    }
  }

  get liquidity(): string {
    try {
      // Simple calculation: sqrt(reserveA * reserveB)
      const reserveABN = BigInt(this.reserveA);
      const reserveBBN = BigInt(this.reserveB);
      
      // Simplified sqrt calculation for demo
      const product = reserveABN * reserveBBN;
      return product.toString();
    } catch {
      return '0';
    }
  }
}

@Entity('swaps')
@Index(['chainId', 'userAddress'])
@Index(['pairId'])
@Index(['timestamp'])
export class Swap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  pairId: string;

  @Column({ type: 'int' })
  chainId: number;

  @Column({ type: 'varchar', length: 42 })
  userAddress: string;

  @Column({ type: 'varchar', length: 42 })
  tokenIn: string;

  @Column({ type: 'varchar', length: 42 })
  tokenOut: string;

  @Column({ type: 'varchar', length: 78 })
  amountIn: string;

  @Column({ type: 'varchar', length: 78 })
  amountOut: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  priceImpact: number;

  @Column({ type: 'varchar', length: 78 })
  fee: string;

  @Column({ type: 'varchar', length: 66 })
  transactionHash: string;

  @Column({ type: 'int' })
  blockNumber: number;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'failed'], default: 'pending' })
  status: 'pending' | 'confirmed' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated properties
  get effectivePrice(): string {
    try {
      const amountInBN = BigInt(this.amountIn);
      const amountOutBN = BigInt(this.amountOut);
      
      if (amountOutBN === BigInt(0)) return '0';
      
      return (amountInBN * BigInt(1e18) / amountOutBN).toString();
    } catch {
      return '0';
    }
  }

  get explorerUrl(): string {
    const explorers = {
      11155111: 'https://sepolia.etherscan.io',
      11155931: 'https://explorer.testnet.riselabs.xyz',
      11124: 'https://sepolia.abscan.org',
      16601: 'https://chainscan-galileo.0g.ai',
      50312: 'https://shannon-explorer.somnia.network'
    };
    
    const explorer = explorers[this.chainId] || '';
    return explorer ? `${explorer}/tx/${this.transactionHash}` : '';
  }
}

@Entity('liquidity_positions')
@Index(['chainId', 'userAddress'])
@Index(['pairId'])
export class LiquidityPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  pairId: string;

  @Column({ type: 'int' })
  chainId: number;

  @Column({ type: 'varchar', length: 42 })
  userAddress: string;

  @Column({ type: 'varchar', length: 78 })
  shares: string;

  @Column({ type: 'varchar', length: 78 })
  tokenAAmount: string;

  @Column({ type: 'varchar', length: 78 })
  tokenBAmount: string;

  @Column({ type: 'varchar', length: 66, nullable: true })
  mintTxHash?: string;

  @Column({ type: 'int', nullable: true })
  mintBlockNumber?: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated properties
  get sharePercentage(): string {
    // This would require the total supply of the pair
    // For now, return a placeholder
    return '0';
  }

  get currentValue(): string {
    // This would calculate the current USD value of the position
    // Requires current token prices
    return '0';
  }
}
