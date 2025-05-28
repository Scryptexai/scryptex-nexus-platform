
import { Sequelize } from 'sequelize';
import { databaseConnection } from '@/config/database';
import { logger } from '@/utils/logger';

// Import all models
import { User, initUserModel } from './User';
import { Token, initTokenModel } from './Token';
import { Transaction, initTransactionModel } from './Transaction';
import { BridgeTransaction, initBridgeTransactionModel } from './BridgeTransaction';
import { Community, initCommunityModel } from './Community';
import { Quest, initQuestModel } from './Quest';
import { Achievement, initAchievementModel } from './Achievement';
import { FarmingActivity, initFarmingActivityModel } from './FarmingActivity';

// Get sequelize instance
const sequelize = databaseConnection.getSequelize();

// Initialize all models
const models = {
  User: initUserModel(sequelize),
  Token: initTokenModel(sequelize),
  Transaction: initTransactionModel(sequelize),
  BridgeTransaction: initBridgeTransactionModel(sequelize),
  Community: initCommunityModel(sequelize),
  Quest: initQuestModel(sequelize),
  Achievement: initAchievementModel(sequelize),
  FarmingActivity: initFarmingActivityModel(sequelize)
};

// Define associations
const defineAssociations = () => {
  // User associations
  models.User.hasMany(models.Token, { 
    foreignKey: 'creator_address', 
    sourceKey: 'wallet_address',
    as: 'createdTokens'
  });
  
  models.User.hasMany(models.Transaction, { 
    foreignKey: 'user_address', 
    sourceKey: 'wallet_address',
    as: 'transactions'
  });
  
  models.User.hasMany(models.BridgeTransaction, { 
    foreignKey: 'user_address', 
    sourceKey: 'wallet_address',
    as: 'bridgeTransactions'
  });
  
  models.User.hasMany(models.FarmingActivity, { 
    foreignKey: 'user_address', 
    sourceKey: 'wallet_address',
    as: 'farmingActivities'
  });
  
  models.User.belongsToMany(models.Community, { 
    through: 'UserCommunities',
    foreignKey: 'user_address',
    otherKey: 'community_id',
    as: 'communities'
  });
  
  models.User.belongsToMany(models.Quest, { 
    through: 'UserQuests',
    foreignKey: 'user_address',
    otherKey: 'quest_id',
    as: 'quests'
  });
  
  models.User.hasMany(models.Achievement, { 
    foreignKey: 'user_address', 
    sourceKey: 'wallet_address',
    as: 'achievements'
  });

  // Token associations
  models.Token.belongsTo(models.User, { 
    foreignKey: 'creator_address', 
    targetKey: 'wallet_address',
    as: 'creator'
  });
  
  models.Token.hasMany(models.Transaction, { 
    foreignKey: 'token_address', 
    sourceKey: 'contract_address',
    as: 'transactions'
  });

  // Transaction associations
  models.Transaction.belongsTo(models.User, { 
    foreignKey: 'user_address', 
    targetKey: 'wallet_address',
    as: 'user'
  });
  
  models.Transaction.belongsTo(models.Token, { 
    foreignKey: 'token_address', 
    targetKey: 'contract_address',
    as: 'token'
  });

  // Bridge Transaction associations
  models.BridgeTransaction.belongsTo(models.User, { 
    foreignKey: 'user_address', 
    targetKey: 'wallet_address',
    as: 'user'
  });

  // Community associations
  models.Community.belongsToMany(models.User, { 
    through: 'UserCommunities',
    foreignKey: 'community_id',
    otherKey: 'user_address',
    as: 'members'
  });

  // Quest associations
  models.Quest.belongsToMany(models.User, { 
    through: 'UserQuests',
    foreignKey: 'quest_id',
    otherKey: 'user_address',
    as: 'participants'
  });

  // Achievement associations
  models.Achievement.belongsTo(models.User, { 
    foreignKey: 'user_address', 
    targetKey: 'wallet_address',
    as: 'user'
  });

  models.Achievement.belongsTo(models.Quest, { 
    foreignKey: 'quest_id',
    as: 'quest'
  });

  // Farming Activity associations
  models.FarmingActivity.belongsTo(models.User, { 
    foreignKey: 'user_address', 
    targetKey: 'wallet_address',
    as: 'user'
  });

  logger.info('Database associations defined successfully');
};

// Connect to database and initialize models
export const connectDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    await databaseConnection.connect();
    
    // Define associations
    defineAssociations();
    
    logger.info('Database models initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database models:', error);
    throw error;
  }
};

// Export models and sequelize instance
export {
  sequelize,
  models,
  User,
  Token,
  Transaction,
  BridgeTransaction,
  Community,
  Quest,
  Achievement,
  FarmingActivity
};

// Export model types
export type {
  UserInstance,
  TokenInstance,
  TransactionInstance,
  BridgeTransactionInstance,
  CommunityInstance,
  QuestInstance,
  AchievementInstance,
  FarmingActivityInstance
} from './types';
