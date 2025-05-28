
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: string;
  wallet_address: string;
  username?: string;
  email?: string;
  reputation_score: number;
  total_volume: string;
  farming_score: number;
  is_verified: boolean;
  profile_image?: string;
  bio?: string;
  social_links?: Record<string, string>;
  preferences?: Record<string, any>;
  last_active_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  // Instance methods
  calculateReputationScore(): Promise<number>;
  updateFarmingScore(score: number): Promise<void>;
  getTotalTradingVolume(): Promise<string>;
  getAchievementCount(): Promise<number>;
  isEligibleForAirdrop(): Promise<boolean>;
}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserInstance {
  public id!: string;
  public wallet_address!: string;
  public username?: string;
  public email?: string;
  public reputation_score!: number;
  public total_volume!: string;
  public farming_score!: number;
  public is_verified!: boolean;
  public profile_image?: string;
  public bio?: string;
  public social_links?: Record<string, string>;
  public preferences?: Record<string, any>;
  public last_active_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // Instance methods
  public async calculateReputationScore(): Promise<number> {
    // Implementation for calculating reputation based on various factors
    const baseScore = this.reputation_score || 0;
    const volumeBonus = Math.floor(parseFloat(this.total_volume) / 1000);
    const farmingBonus = this.farming_score * 0.1;
    const verificationBonus = this.is_verified ? 100 : 0;
    
    return Math.min(baseScore + volumeBonus + farmingBonus + verificationBonus, 10000);
  }

  public async updateFarmingScore(score: number): Promise<void> {
    this.farming_score = score;
    await this.save();
  }

  public async getTotalTradingVolume(): Promise<string> {
    // This would typically involve aggregating from transactions
    return this.total_volume;
  }

  public async getAchievementCount(): Promise<number> {
    // This would query the achievements table
    return 0; // Placeholder
  }

  public async isEligibleForAirdrop(): Promise<boolean> {
    const minVolume = 1000; // $1000 minimum volume
    const minFarmingScore = 50;
    const minReputationScore = 100;
    
    return (
      parseFloat(this.total_volume) >= minVolume &&
      this.farming_score >= minFarmingScore &&
      this.reputation_score >= minReputationScore
    );
  }
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      wallet_address: {
        type: DataTypes.STRING(42),
        allowNull: false,
        unique: true,
        validate: {
          is: /^0x[a-fA-F0-9]{40}$/,
          notEmpty: true
        }
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        validate: {
          len: [3, 50],
          isAlphanumeric: true
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      reputation_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 10000
        }
      },
      total_volume: {
        type: DataTypes.DECIMAL(20, 8),
        defaultValue: '0',
        validate: {
          min: 0
        }
      },
      farming_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      profile_image: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 500]
        }
      },
      social_links: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      preferences: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          notifications: {
            email: true,
            push: true,
            trading: true,
            bridge: true,
            social: true
          },
          privacy: {
            showProfile: true,
            showActivity: false,
            showVolume: false
          },
          trading: {
            defaultSlippage: 0.5,
            autoApprove: false,
            gasPreference: 'standard'
          }
        }
      },
      last_active_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['wallet_address']
        },
        {
          unique: true,
          fields: ['username'],
          where: {
            username: {
              [DataTypes.Op.ne]: null
            }
          }
        },
        {
          unique: true,
          fields: ['email'],
          where: {
            email: {
              [DataTypes.Op.ne]: null
            }
          }
        },
        {
          fields: ['reputation_score']
        },
        {
          fields: ['farming_score']
        },
        {
          fields: ['is_verified']
        },
        {
          fields: ['last_active_at']
        },
        {
          fields: ['created_at']
        }
      ],
      hooks: {
        beforeUpdate: (user: User) => {
          user.updated_at = new Date();
        },
        beforeSave: (user: User) => {
          // Normalize wallet address to lowercase
          user.wallet_address = user.wallet_address.toLowerCase();
          
          // Update last active timestamp
          user.last_active_at = new Date();
        }
      }
    }
  );

  return User;
};
