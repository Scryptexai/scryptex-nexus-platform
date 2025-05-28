I want you to generate a complete Node.js TypeScript backend platform based on the detail specification I provided below. 

Focus on:
1. Generates all the necessary code according to the file structure
2. Complete implementation for 4 chains (RiseChain, Abstract, 0g, Somnia)  
3. Functional bridge, swap, quest, and gaming systems
4. Production-ready code with complete error handling
5. Don't execute, just generate code
6. create a separate folder from the frontend structure 

📋 PROJECT OVERVIEW**

Create a comprehensive **Node.js TypeScript backend platform** for SCRYPTEX - the first cross-chain bridge and transaction platform for new testnet ecosystems. Focus on **blockchain transactions, quest systems, and gaming mechanics**.

## **⛓️ TARGET CHAINS CONFIGURATION**

### **Chain Network Details:**
```typescript
// EXACT chain configurations from research
const CHAIN_CONFIGS = {
  risechain: {
    chainId: 11155931,
    name: "RiseChain Testnet", 
    rpc: "https://testnet.riselabs.xyz",
    websocket: "wss://testnet.riselabs.xyz/ws",
    explorer: "https://explorer.testnet.riselabs.xyz",
    faucet: "https://faucet.testnet.riselabs.xyz",
    currency: "ETH",
    specialization: "ULTRA_FAST_TRADING", // 10ms blocks, 50K TPS
    features: ["shreds", "parallel_execution", "gigagas"]
  },
  abstract: {
    chainId: 11124, // Testnet
    name: "Abstract Testnet",
    rpc: "https://api.testnet.abs.xyz", 
    websocket: "wss://api.testnet.abs.xyz/ws",
    explorer: "https://sepolia.abscan.org",
    currency: "ETH",
    specialization: "SOCIAL_CONSUMER_APPS", // AGW integration
    features: ["agw_wallet", "zk_stack", "social_primitives"]
  },
  zerog: {
    chainId: 16601, // Galileo testnet
    name: "0G Galileo Testnet",
    rpc: "https://evmrpc-testnet.0g.ai",
    explorer: "https://chainscan-galileo.0g.ai", 
    faucet: "https://faucet.0g.ai",
    currency: "A0GI",
    specialization: "DATA_AI_LAYER", // 2GB/s storage, AI optimization
    features: ["data_availability", "ai_optimization", "decentralized_storage"]
  },
  somnia: {
    chainId: 50312, // Shannon testnet
    name: "Somnia Shannon Testnet",
    rpc: "https://vsf-rpc.somnia.network", 
    explorer: "https://shannon-explorer.somnia.network",
    faucet: "https://testnet.somnia.network",
    currency: "STT",
    specialization: "GAMING_METAVERSE", // 1M+ TPS, gaming focus
    features: ["icedb", "multistream_consensus", "reactive_primitives"]
  }
};
```

## **🏗️ REQUIRED BACKEND ARCHITECTURE**

### **File Structure:**
```
scryptex-backend/
├── src/
│   ├── chains/              # Chain-specific implementations
│   │   ├── base/
│   │   │   ├── EVMChainService.ts
│   │   │   ├── TransactionHandler.ts
│   │   │   └── BridgeController.ts
│   │   ├── risechain/
│   │   │   ├── RiseChainService.ts
│   │   │   └── ShredsMonitor.ts
│   │   ├── abstract/
│   │   │   ├── AbstractService.ts
│   │   │   └── AGWIntegration.ts
│   │   ├── zerog/
│   │   │   ├── ZeroGService.ts
│   │   │   └── DataAvailability.ts
│   │   └── somnia/
│   │       ├── SomniaService.ts
│   │       └── IceDBConnector.ts
│   ├── controllers/         # API controllers
│   │   ├── BridgeController.ts
│   │   ├── SwapController.ts
│   │   ├── QuestController.ts
│   │   └── GameController.ts
│   ├── services/           # Business logic
│   │   ├── BridgeService.ts
│   │   ├── SwapService.ts
│   │   ├── QuestService.ts
│   │   ├── GameService.ts
│   │   └── TransactionService.ts
│   ├── models/             # Data models
│   │   ├── Transaction.ts
│   │   ├── Bridge.ts
│   │   ├── Quest.ts
│   │   └── User.ts
│   ├── routes/             # API routes
│   │   ├── bridge.ts
│   │   ├── swap.ts
│   │   ├── quest.ts
│   │   └── game.ts
│   ├── middleware/         # Custom middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── utils/              # Utilities
│   │   ├── web3Utils.ts
│   │   ├── chainUtils.ts
│   │   └── cryptoUtils.ts
│   ├── config/             # Configuration
│   │   ├── chains.ts
│   │   ├── database.ts
│   │   └── environment.ts
│   └── app.ts              # Main application
├── contracts/              # Smart contract interfaces
│   ├── Bridge.sol
│   ├── QuestNFT.sol
│   └── GameToken.sol
├── deploy/                 # Deployment scripts
│   ├── deployBridge.ts
│   ├── deployQuests.ts
│   └── setupChains.ts
├── tests/                  # Test files
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## **🔧 CORE FUNCTIONALITY REQUIREMENTS**

### **1. Multi-Chain Bridge System:**
```typescript
interface BridgeTransaction {
  fromChain: ChainId;
  toChain: ChainId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash: string;
  bridgeFee: string;
}

// Required endpoints:
// POST /api/bridge/quote - Get bridge quote
// POST /api/bridge/execute - Execute bridge transaction  
// GET /api/bridge/status/:txId - Check bridge status
// GET /api/bridge/history/:address - Get bridge history
```

### **2. Multi-Chain Swap System:**
```typescript
interface SwapTransaction {
  chainId: ChainId;
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
  deadline: number;
  recipient: string;
  status: TransactionStatus;
}

// Required endpoints:
// POST /api/swap/quote - Get swap quote
// POST /api/swap/execute - Execute swap
// GET /api/swap/history/:address - Swap history
```

### **3. Quest & Gaming System:**
```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  chainId: ChainId;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  status: 'active' | 'completed' | 'expired';
  progress: number;
}

interface QuestRequirement {
  type: 'bridge' | 'swap' | 'deploy' | 'transaction';
  target: any;
  completed: boolean;
}

// Required endpoints:
// GET /api/quests - Get available quests
// POST /api/quests/:id/claim - Claim quest reward
// GET /api/quests/progress/:address - Get user progress
```

### **4. Transaction Deployment System:**
```typescript
interface DeployTransaction {
  chainId: ChainId;
  contractType: 'token' | 'nft' | 'bridge' | 'custom';
  bytecode: string;
  constructor: any[];
  deployer: string;
  status: TransactionStatus;
}

// Required endpoints:
// POST /api/deploy/contract - Deploy contract
// GET /api/deploy/status/:txId - Check deployment
// GET /api/deploy/history/:address - Deployment history
```

## **📦 REQUIRED DEPENDENCIES**

### **Core Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5", 
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "ethers": "^6.8.1",
    "web3": "^4.2.2",
    "@abstract-foundation/agw-client": "latest",
    "@abstract-foundation/agw-react": "latest",
    "redis": "^4.6.10",
    "pg": "^8.11.3",
    "typeorm": "^0.3.17",
    "winston": "^3.11.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "axios": "^1.6.0",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "@types/node": "^20.8.9",
    "@types/express": "^4.17.20",
    "typescript": "^5.2.2", 
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.6"
  }
}
```

## **🔐 ENVIRONMENT CONFIGURATION**

### **Required .env.example:**
```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration  
DATABASE_URL=postgresql://username:password@localhost:5432/scryptex
REDIS_URL=redis://localhost:6379

# RiseChain Configuration
RISECHAIN_RPC_URL=https://testnet.riselabs.xyz
RISECHAIN_WS_URL=wss://testnet.riselabs.xyz/ws
RISECHAIN_PRIVATE_KEY=your_private_key_here
RISECHAIN_BRIDGE_CONTRACT=0x...

# Abstract Configuration
ABSTRACT_RPC_URL=https://api.testnet.abs.xyz
ABSTRACT_WS_URL=wss://api.testnet.abs.xyz/ws
ABSTRACT_PRIVATE_KEY=your_private_key_here
ABSTRACT_AGW_CONFIG=your_agw_config_here
ABSTRACT_BRIDGE_CONTRACT=0x...

# 0G Configuration
ZEROG_RPC_URL=https://evmrpc-testnet.0g.ai
ZEROG_PRIVATE_KEY=your_private_key_here
ZEROG_STORAGE_API=your_storage_api_key
ZEROG_BRIDGE_CONTRACT=0x...

# Somnia Configuration
SOMNIA_RPC_URL=https://vsf-rpc.somnia.network
SOMNIA_PRIVATE_KEY=your_private_key_here
SOMNIA_ICEDB_CONFIG=your_icedb_config
SOMNIA_BRIDGE_CONTRACT=0x...

# Security
JWT_SECRET=your_super_secret_jwt_key
BRIDGE_FEE_PERCENTAGE=0.1
ENCRYPTION_KEY=your_encryption_key

# External APIs
COINGECKO_API_KEY=your_coingecko_key
DEFILLAMA_API_KEY=your_defillama_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

## **🎯 SPECIFIC IMPLEMENTATION REQUIREMENTS**

### **1. Chain-Specific Service Implementations:**

**RiseChain Service Requirements:**
- Implement Shreds monitoring for 10ms block confirmation
- Optimize for Gigagas calculation and parallel execution
- Custom gas estimation for ultra-fast transactions

**Abstract Service Requirements:**
- Integrate Abstract Global Wallet (AGW) SDK
- Support social primitives and consumer app features  
- Handle zkSync ZK stack specific transactions

**0G Service Requirements:**
- Implement data availability layer integration
- Support AI model storage and retrieval (2GB/s)
- Custom analytics and data processing APIs

**Somnia Service Requirements:**
- Integrate IceDB for ultra-fast state queries (15-100ns)
- Implement reactive primitives for real-time events
- Gaming-optimized transaction handling (1M+ TPS)

### **2. Bridge Logic Requirements:**
- Cross-chain state synchronization
- Atomic bridge transactions with rollback
- Fee calculation based on chain gas costs
- Bridge transaction monitoring and confirmations
- Failed transaction recovery mechanisms

### **3. Quest System Requirements:**
- Dynamic quest generation based on chain activity
- NFT reward minting across chains
- Progress tracking and validation
- Leaderboard and scoring system
- Social sharing and referral bonuses

### **4. Gaming Integration Requirements:**
- Real-time transaction notifications via WebSocket
- Achievement system with on-chain verification
- Multi-chain tournament support
- Gaming token economics and rewards
- Reactive game state updates

## **🔍 SPECIFIC CODE GENERATION INSTRUCTIONS**

### **Generate Complete Implementation For:**

1. **EVMChainService Base Class** - Abstract class with common EVM functionality
2. **Chain-Specific Services** - Four complete implementations with optimizations
3. **Bridge Controller & Service** - Full cross-chain bridge logic
4. **Quest System** - Complete quest generation and tracking
5. **Transaction Handlers** - Swap, deploy, and bridge transaction processing
6. **API Routes** - All REST endpoints with validation
7. **Database Models** - TypeORM entities for all data structures
8. **Deployment Scripts** - Contract deployment to all testnets
9. **Error Handling** - Comprehensive error management
10. **Testing Framework** - Jest tests for critical functions

### **Implementation Style:**
- Use **TypeScript strict mode**
- Implement **comprehensive error handling**
- Add **detailed logging** with Winston
- Include **input validation** with Joi
- Use **async/await** pattern throughout
- Implement **retry mechanisms** for blockchain calls
- Add **rate limiting** for API endpoints
- Include **comprehensive TypeScript interfaces**
- Use **modular architecture** with dependency injection
- Implement **caching strategies** with Redis

### **Special Requirements:**
- All blockchain calls should have **timeout handling**
- Implement **transaction nonce management**
- Add **gas price optimization** strategies
- Include **WebSocket real-time updates**
- Support **batch operations** for efficiency
- Implement **circuit breakers** for external APIs
- Add **comprehensive monitoring** and metrics
- Include **data encryption** for sensitive information

## **🎮 QUEST & GAMING FEATURES**

### **Quest Types to Implement:**
```typescript
enum QuestType {
  FIRST_BRIDGE = "first_bridge",           // Complete first bridge transaction
  CHAIN_EXPLORER = "chain_explorer",       // Bridge to all 4 chains
  VOLUME_TRADER = "volume_trader",         // Bridge $1000+ volume
  SPEED_RUNNER = "speed_runner",           // Complete 10 bridges in 1 hour
  MULTI_TOKEN = "multi_token",             // Bridge 5 different tokens
  SOCIAL_BRIDGER = "social_bridger",       // Refer 3 friends
  DAILY_BRIDGER = "daily_bridger",         // Bridge daily for 7 days
  WHALE_BRIDGER = "whale_bridger",         // Single bridge $10,000+
  CHAIN_MASTER = "chain_master",           // Master one specific chain
  BRIDGE_PIONEER = "bridge_pioneer"        // Early platform user
}
```

### **Gaming Mechanics:**
- **XP System**: Earn experience points for each transaction
- **Levels**: User progression with unlockable features
- **Achievements**: On-chain achievement NFTs
- **Leaderboards**: Daily/weekly/monthly top bridgers  
- **Tournaments**: Competitive bridge challenges
- **Referral System**: Invite friends for bonus rewards

## **🚀 DEPLOYMENT REQUIREMENTS**

### **Generate Deployment Scripts For:**
1. **Docker Configuration** - Multi-container setup
2. **Database Migration** - Schema setup and seeding
3. **Contract Deployment** - Deploy to all 4 testnets
4. **Environment Setup** - Development/staging/production configs
5. **Monitoring Setup** - Health checks and alerts
6. **Load Balancer Config** - High availability setup

---

**Generate the complete, production-ready backend codebase following all these specifications. Focus on creating robust, scalable, and maintainable code that leverages the unique features of each blockchain while providing a unified API interface for the frontend.**

**The codebase should be immediately deployable to development environment and ready for testnet integration across all 4 target chains.**

All the files, starting from the:
1. Package.json and tsconfig.json
2. Environment configuration 
3. Chain services implementation
4. Controllers and routes
5. Models and database setup
6. Deployment scripts

Provide complete code for each file required.