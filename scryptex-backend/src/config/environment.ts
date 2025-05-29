
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/scryptex',
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_minimum_32_characters',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your_encryption_key_32_chars',
    bridgeFeePercentage: parseFloat(process.env.BRIDGE_FEE_PERCENTAGE || '0.1'),
    pumpFeePercentage: parseFloat(process.env.PUMP_FEE_PERCENTAGE || '1.0'),
  },

  // External APIs
  external: {
    infuraProjectId: process.env.INFURA_PROJECT_ID || '',
    alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
    coingeckoApiKey: process.env.COINGECKO_API_KEY || '',
    defillamaApiKey: process.env.DEFILLAMA_API_KEY || '',
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || '',
    logLevel: process.env.LOG_LEVEL || 'info',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
  },

  // WebSocket
  websocket: {
    port: parseInt(process.env.WS_PORT || '3001'),
    corsOrigin: process.env.WS_CORS_ORIGIN || 'http://localhost:5173',
  },

  // Chain Configurations
  chains: {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpc: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      websocket: process.env.SEPOLIA_WS_URL || 'wss://sepolia.infura.io/ws/v3/YOUR_INFURA_KEY',
      explorer: 'https://sepolia.etherscan.io',
      faucet: 'https://sepoliafaucet.com',
      currency: 'ETH',
      type: 'ETHEREUM_TESTNET' as const,
      specialization: 'MAIN_BRIDGE_HUB',
      features: ['stable', 'well_documented', 'high_liquidity'],
      isMainTest: true,
      privateKey: process.env.SEPOLIA_PRIVATE_KEY || '',
      contracts: {
        bridge: process.env.SEPOLIA_BRIDGE_CONTRACT || '',
        pump: process.env.SEPOLIA_PUMP_CONTRACT || '',
        tokenFactory: process.env.SEPOLIA_TOKEN_FACTORY || '',
      },
    },
    risechain: {
      chainId: 11155931,
      name: 'RiseChain Testnet',
      rpc: process.env.RISECHAIN_RPC_URL || 'https://testnet.riselabs.xyz',
      websocket: process.env.RISECHAIN_WS_URL || 'wss://testnet.riselabs.xyz/ws',
      explorer: 'https://explorer.testnet.riselabs.xyz',
      faucet: 'https://faucet.testnet.riselabs.xyz',
      currency: 'ETH',
      type: 'L2_OPTIMIZED' as const,
      specialization: 'ULTRA_FAST_TRADING',
      features: ['shreds', 'parallel_execution', 'gigagas'],
      privateKey: process.env.RISECHAIN_PRIVATE_KEY || '',
      contracts: {
        bridge: process.env.RISECHAIN_BRIDGE_CONTRACT || '',
        pump: process.env.RISECHAIN_PUMP_CONTRACT || '',
      },
    },
    abstract: {
      chainId: 11124,
      name: 'Abstract Testnet',
      rpc: process.env.ABSTRACT_RPC_URL || 'https://api.testnet.abs.xyz',
      websocket: process.env.ABSTRACT_WS_URL || 'wss://api.testnet.abs.xyz/ws',
      explorer: 'https://sepolia.abscan.org',
      currency: 'ETH',
      type: 'ZK_ROLLUP' as const,
      specialization: 'SOCIAL_CONSUMER_APPS',
      features: ['agw_wallet', 'zk_stack', 'social_primitives'],
      privateKey: process.env.ABSTRACT_PRIVATE_KEY || '',
      agwConfig: process.env.ABSTRACT_AGW_CONFIG || '',
      contracts: {
        bridge: process.env.ABSTRACT_BRIDGE_CONTRACT || '',
        pump: process.env.ABSTRACT_PUMP_CONTRACT || '',
      },
    },
    zerog: {
      chainId: 16601,
      name: '0G Galileo Testnet',
      rpc: process.env.ZEROG_RPC_URL || 'https://evmrpc-testnet.0g.ai',
      explorer: 'https://chainscan-galileo.0g.ai',
      faucet: 'https://faucet.0g.ai',
      currency: 'A0GI',
      type: 'AI_OPTIMIZED' as const,
      specialization: 'DATA_AI_LAYER',
      features: ['data_availability', 'ai_optimization', 'decentralized_storage'],
      privateKey: process.env.ZEROG_PRIVATE_KEY || '',
      storageApi: process.env.ZEROG_STORAGE_API || '',
      contracts: {
        bridge: process.env.ZEROG_BRIDGE_CONTRACT || '',
        pump: process.env.ZEROG_PUMP_CONTRACT || '',
      },
    },
    somnia: {
      chainId: 50312,
      name: 'Somnia Shannon Testnet',
      rpc: process.env.SOMNIA_RPC_URL || 'https://vsf-rpc.somnia.network',
      explorer: 'https://shannon-explorer.somnia.network',
      faucet: 'https://testnet.somnia.network',
      currency: 'STT',
      type: 'GAMING_OPTIMIZED' as const,
      specialization: 'GAMING_METAVERSE',
      features: ['icedb', 'multistream_consensus', 'reactive_primitives'],
      privateKey: process.env.SOMNIA_PRIVATE_KEY || '',
      icedbConfig: process.env.SOMNIA_ICEDB_CONFIG || '',
      contracts: {
        bridge: process.env.SOMNIA_BRIDGE_CONTRACT || '',
        pump: process.env.SOMNIA_PUMP_CONTRACT || '',
      },
    },
  },
};

export default config;
