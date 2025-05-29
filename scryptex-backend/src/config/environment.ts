
import dotenv from 'dotenv';
import Joi from 'joi';
import { logger } from '@/utils/logger';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  WEBSOCKET_PORT: Joi.number().default(3002),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  API_PREFIX: Joi.string().default('/api'),

  // Database
  DATABASE_URL: Joi.string().required(),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),

  // Redis
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),
  JOB_QUEUE_REDIS_DB: Joi.number().default(1),

  // Security
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().default('7d'),
  ENCRYPTION_KEY: Joi.string().length(32).required(),
  BCRYPT_ROUNDS: Joi.number().default(12),

  // Blockchain RPCs
  RISECHAIN_RPC_URL: Joi.string().uri().required(),
  RISECHAIN_WS_URL: Joi.string().uri().optional(),
  ABSTRACT_RPC_URL: Joi.string().uri().required(),
  ABSTRACT_WS_URL: Joi.string().uri().optional(),
  OG_RPC_URL: Joi.string().uri().required(),
  OG_WS_URL: Joi.string().uri().optional(),
  SOMNIA_RPC_URL: Joi.string().uri().required(),
  SOMNIA_WS_URL: Joi.string().uri().optional(),
  SEPOLIA_RPC_URL: Joi.string().uri().required(),
  SEPOLIA_WS_URL: Joi.string().uri().optional(),

  // Contract addresses
  RISECHAIN_SCRYPTEX_FACTORY: Joi.string().optional(),
  RISECHAIN_TOKEN_FACTORY: Joi.string().optional(),
  RISECHAIN_SCRYPTEX_DEX: Joi.string().optional(),
  RISECHAIN_LIQUIDITY_MANAGER: Joi.string().optional(),
  RISECHAIN_CROSS_CHAIN_COORDINATOR: Joi.string().optional(),
  
  ABSTRACT_COMMUNITY_MANAGER: Joi.string().optional(),
  ABSTRACT_GOVERNANCE_VOTING: Joi.string().optional(),
  ABSTRACT_REPUTATION_SYSTEM: Joi.string().optional(),
  ABSTRACT_CROSS_CHAIN_COORDINATOR: Joi.string().optional(),
  
  OG_ACTIVITY_TRACKER: Joi.string().optional(),
  OG_METRICS_COLLECTOR: Joi.string().optional(),
  OG_FARMING_CALCULATOR: Joi.string().optional(),
  OG_CROSS_CHAIN_COORDINATOR: Joi.string().optional(),
  
  SOMNIA_QUEST_MANAGER: Joi.string().optional(),
  SOMNIA_ACHIEVEMENT_NFT: Joi.string().optional(),
  SOMNIA_REWARD_DISTRIBUTOR: Joi.string().optional(),
  SOMNIA_CROSS_CHAIN_COORDINATOR: Joi.string().optional(),

  SEPOLIA_BRIDGE_CONTRACT: Joi.string().optional(),
  SEPOLIA_CROSS_CHAIN_COORDINATOR: Joi.string().optional(),

  // Platform wallet private keys
  RISECHAIN_PLATFORM_1_PRIVATE_KEY: Joi.string().optional(),
  RISECHAIN_PLATFORM_2_PRIVATE_KEY: Joi.string().optional(),
  ABSTRACT_PLATFORM_1_PRIVATE_KEY: Joi.string().optional(),
  ABSTRACT_PLATFORM_2_PRIVATE_KEY: Joi.string().optional(),
  OG_PLATFORM_1_PRIVATE_KEY: Joi.string().optional(),
  OG_PLATFORM_2_PRIVATE_KEY: Joi.string().optional(),
  SOMNIA_PLATFORM_1_PRIVATE_KEY: Joi.string().optional(),
  SOMNIA_PLATFORM_2_PRIVATE_KEY: Joi.string().optional(),
  SEPOLIA_PLATFORM_1_PRIVATE_KEY: Joi.string().optional(),
  SEPOLIA_PLATFORM_2_PRIVATE_KEY: Joi.string().optional(),

  // Feature flags
  ENABLE_WEBSOCKETS: Joi.boolean().default(true),
  ENABLE_BACKGROUND_JOBS: Joi.boolean().default(true),
  ENABLE_ANALYTICS_TRACKING: Joi.boolean().default(true),
  ENABLE_FARMING_AUTOMATION: Joi.boolean().default(true),
  ENABLE_SOCIAL_FEATURES: Joi.boolean().default(true),
  ENABLE_GAMING_FEATURES: Joi.boolean().default(true),

  // External services
  SENTRY_DSN: Joi.string().uri().optional(),
  DISCORD_WEBHOOK_URL: Joi.string().uri().optional(),
  TELEGRAM_BOT_TOKEN: Joi.string().optional(),
  TELEGRAM_CHAT_ID: Joi.string().optional(),

  // Performance
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  CACHE_TTL_SECONDS: Joi.number().default(300),
  MAX_CONCURRENT_BLOCKCHAIN_CALLS: Joi.number().default(10),
  BLOCKCHAIN_TIMEOUT_MS: Joi.number().default(30000),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_CONSOLE_ENABLED: Joi.boolean().default(true),
  LOG_FILE_ENABLED: Joi.boolean().default(true),
  LOG_DB_ENABLED: Joi.boolean().default(false)
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  server: {
    port: envVars.PORT
  },
  websocket: {
    port: envVars.WEBSOCKET_PORT
  },
  api: {
    prefix: envVars.API_PREFIX
  },
  cors: {
    origin: envVars.CORS_ORIGIN
  },
  database: {
    url: envVars.DATABASE_URL,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    ssl: envVars.DB_SSL,
    dialect: 'postgres' as const,
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    logging: envVars.NODE_ENV === 'development' ? console.log : false
  },
  redis: {
    url: envVars.REDIS_URL,
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
    db: envVars.REDIS_DB,
    jobQueueDb: envVars.JOB_QUEUE_REDIS_DB
  },
  security: {
    jwtSecret: envVars.JWT_SECRET,
    jwtExpire: envVars.JWT_EXPIRE,
    encryptionKey: envVars.ENCRYPTION_KEY,
    bcryptRounds: envVars.BCRYPT_ROUNDS
  },
  blockchain: {
    risechain: {
      chainId: 11155931,
      name: 'RISE Testnet',
      rpc: envVars.RISECHAIN_RPC_URL,
      ws: envVars.RISECHAIN_WS_URL,
      explorer: 'https://explorer.testnet.riselabs.xyz',
      currency: { symbol: 'ETH', decimals: 18 },
      role: 'TRADING_ENGINE',
      features: ['token_creation', 'dex_trading', 'liquidity_management', 'high_speed_trading']
    },
    abstract: {
      chainId: 11124,
      name: 'Abstract Testnet',
      rpc: envVars.ABSTRACT_RPC_URL,
      ws: envVars.ABSTRACT_WS_URL,
      explorer: 'https://sepolia.abscan.org/',
      currency: { symbol: 'ETH', decimals: 18 },
      role: 'SOCIAL_HUB',
      features: ['community_management', 'governance_voting', 'social_features', 'user_reputation']
    },
    og: {
      chainId: 16601,
      name: '0G Galileo',
      rpc: envVars.OG_RPC_URL,
      ws: envVars.OG_WS_URL,
      explorer: 'https://chainscan-galileo.0g.ai/',
      currency: { symbol: 'OG', decimals: 18 },
      role: 'DATA_LAYER',
      features: ['activity_tracking', 'metrics_collection', 'data_storage', 'analytics_processing']
    },
    somnia: {
      chainId: 50312,
      name: 'Somnia Testnet',
      rpc: envVars.SOMNIA_RPC_URL,
      ws: envVars.SOMNIA_WS_URL,
      explorer: 'https://shannon-explorer.somnia.network/',
      currency: { symbol: 'STT', decimals: 18 },
      role: 'GAMING_LAYER',
      features: ['quest_management', 'nft_rewards', 'gaming_mechanics', 'achievement_system']
    },
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpc: envVars.SEPOLIA_RPC_URL,
      ws: envVars.SEPOLIA_WS_URL,
      explorer: 'https://sepolia.etherscan.io/',
      currency: { symbol: 'ETH', decimals: 18 },
      role: 'BRIDGE_HUB',
      features: ['cross_chain_bridge', 'multi_chain_support', 'evm_compatibility', 'stable_testnet']
    }
  },
  contracts: {
    risechain: {
      scryptexFactory: envVars.RISECHAIN_SCRYPTEX_FACTORY,
      tokenFactory: envVars.RISECHAIN_TOKEN_FACTORY,
      scryptexDex: envVars.RISECHAIN_SCRYPTEX_DEX,
      liquidityManager: envVars.RISECHAIN_LIQUIDITY_MANAGER,
      crossChainCoordinator: envVars.RISECHAIN_CROSS_CHAIN_COORDINATOR
    },
    abstract: {
      communityManager: envVars.ABSTRACT_COMMUNITY_MANAGER,
      governanceVoting: envVars.ABSTRACT_GOVERNANCE_VOTING,
      reputationSystem: envVars.ABSTRACT_REPUTATION_SYSTEM,
      crossChainCoordinator: envVars.ABSTRACT_CROSS_CHAIN_COORDINATOR
    },
    og: {
      activityTracker: envVars.OG_ACTIVITY_TRACKER,
      metricsCollector: envVars.OG_METRICS_COLLECTOR,
      farmingCalculator: envVars.OG_FARMING_CALCULATOR,
      crossChainCoordinator: envVars.OG_CROSS_CHAIN_COORDINATOR
    },
    somnia: {
      questManager: envVars.SOMNIA_QUEST_MANAGER,
      achievementNft: envVars.SOMNIA_ACHIEVEMENT_NFT,
      rewardDistributor: envVars.SOMNIA_REWARD_DISTRIBUTOR,
      crossChainCoordinator: envVars.SOMNIA_CROSS_CHAIN_COORDINATOR
    },
    sepolia: {
      bridgeContract: envVars.SEPOLIA_BRIDGE_CONTRACT,
      crossChainCoordinator: envVars.SEPOLIA_CROSS_CHAIN_COORDINATOR
    }
  },
  platformWallets: {
    risechain: {
      platform1: envVars.RISECHAIN_PLATFORM_1_PRIVATE_KEY,
      platform2: envVars.RISECHAIN_PLATFORM_2_PRIVATE_KEY
    },
    abstract: {
      platform1: envVars.ABSTRACT_PLATFORM_1_PRIVATE_KEY,
      platform2: envVars.ABSTRACT_PLATFORM_2_PRIVATE_KEY
    },
    og: {
      platform1: envVars.OG_PLATFORM_1_PRIVATE_KEY,
      platform2: envVars.OG_PLATFORM_2_PRIVATE_KEY
    },
    somnia: {
      platform1: envVars.SOMNIA_PLATFORM_1_PRIVATE_KEY,
      platform2: envVars.SOMNIA_PLATFORM_2_PRIVATE_KEY
    },
    sepolia: {
      platform1: envVars.SEPOLIA_PLATFORM_1_PRIVATE_KEY,
      platform2: envVars.SEPOLIA_PLATFORM_2_PRIVATE_KEY
    }
  },
  features: {
    websockets: envVars.ENABLE_WEBSOCKETS,
    backgroundJobs: envVars.ENABLE_BACKGROUND_JOBS,
    analyticsTracking: envVars.ENABLE_ANALYTICS_TRACKING,
    farmingAutomation: envVars.ENABLE_FARMING_AUTOMATION,
    socialFeatures: envVars.ENABLE_SOCIAL_FEATURES,
    gamingFeatures: envVars.ENABLE_GAMING_FEATURES
  },
  externalServices: {
    sentry: {
      dsn: envVars.SENTRY_DSN
    },
    discord: {
      webhookUrl: envVars.DISCORD_WEBHOOK_URL
    },
    telegram: {
      botToken: envVars.TELEGRAM_BOT_TOKEN,
      chatId: envVars.TELEGRAM_CHAT_ID
    }
  },
  performance: {
    rateLimit: {
      windowMs: envVars.RATE_LIMIT_WINDOW_MS,
      maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS
    },
    cache: {
      ttlSeconds: envVars.CACHE_TTL_SECONDS
    },
    blockchain: {
      maxConcurrentCalls: envVars.MAX_CONCURRENT_BLOCKCHAIN_CALLS,
      timeoutMs: envVars.BLOCKCHAIN_TIMEOUT_MS
    }
  },
  logging: {
    level: envVars.LOG_LEVEL,
    console: envVars.LOG_CONSOLE_ENABLED,
    file: envVars.LOG_FILE_ENABLED,
    database: envVars.LOG_DB_ENABLED
  }
};

// Log configuration summary
logger.info('Configuration loaded:', {
  environment: config.env,
  server: `${config.server.port}`,
  database: config.database.name,
  redis: `${config.redis.host}:${config.redis.port}`,
  features: config.features,
  chains: Object.keys(config.blockchain)
});
