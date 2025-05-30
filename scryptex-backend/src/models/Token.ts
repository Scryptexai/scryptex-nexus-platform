
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('tokens')
@Index(['chainId', 'address'], { unique: true })
@Index(['creator'])
@Index(['chainId'])
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 42 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'varchar', length: 78 }) // Support up to 78 digits (uint256 max)
  totalSupply: string;

  @Column({ type: 'int', default: 18 })
  decimals: number;

  @Column({ type: 'int' })
  chainId: number;

  @Column({ type: 'varchar', length: 42 })
  creator: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ type: 'boolean', default: false })
  hasLiquidity: boolean;

  @Column({ type: 'varchar', length: 78, nullable: true })
  volume24h?: string;

  @Column({ type: 'int', nullable: true })
  holders?: number;

  @Column({ type: 'varchar', length: 78, nullable: true })
  marketCap?: string;

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

  // Calculated fields (not stored in DB)
  get formattedSupply(): string {
    try {
      return (BigInt(this.totalSupply) / BigInt(10 ** this.decimals)).toString();
    } catch {
      return '0';
    }
  }

  get explorerUrl(): string {
    // This would be calculated based on chainId
    const explorers = {
      11155111: 'https://sepolia.etherscan.io',
      11155931: 'https://explorer.testnet.riselabs.xyz',
      11124: 'https://sepolia.abscan.org',
      16601: 'https://chainscan-galileo.0g.ai',
      50312: 'https://shannon-explorer.somnia.network'
    };
    
    const explorer = explorers[this.chainId] || '';
    return explorer ? `${explorer}/token/${this.address}` : '';
  }

  // Instance methods for common operations
  async save(): Promise<Token> {
    // This would use TypeORM's save method in a real implementation
    return this;
  }

  static async findOne(options: any): Promise<Token | null> {
    // This would use TypeORM's findOne method in a real implementation
    return null;
  }

  static async find(options: any): Promise<Token[]> {
    // This would use TypeORM's find method in a real implementation
    return [];
  }

  static async update(criteria: any, data: any): Promise<any> {
    // This would use TypeORM's update method in a real implementation
    return { affected: 1 };
  }
}
