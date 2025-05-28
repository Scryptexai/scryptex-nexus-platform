
# 🚀 SCRYPTEX Backend System

**Comprehensive multi-chain backend for the SCRYPTEX platform** - Supporting RiseChain, Abstract, 0G Galileo, and Somnia testnet ecosystems.

## 📋 Overview

SCRYPTEX Backend is a production-ready Node.js/TypeScript system that powers the first cross-chain bridge and DEX platform for new testnet ecosystems. It provides comprehensive API services, real-time updates, background job processing, and multi-chain blockchain interactions.

### 🌐 Supported Networks

| Network | Chain ID | Role | Features |
|---------|----------|------|----------|
| **RiseChain** | 11155931 | Trading Engine | Token creation, DEX trading, Liquidity management |
| **Abstract** | 11124 | Social Hub | Community management, Governance, Social features |
| **0G Galileo** | 16601 | Data Layer | Analytics, Metrics collection, Data storage |
| **Somnia** | 50312 | Gaming Layer | Quest management, Achievements, Gaming mechanics |

## 🏗️ Architecture

```
📦 SCRYPTEX Backend
├── 🔌 Express.js REST API Server
├── 🔄 WebSocket Real-time Updates
├── 💾 PostgreSQL Database
├── ⚡ Redis Caching & Pub/Sub
├── 🔧 Background Job Processing
├── 🔗 Multi-chain Web3 Integration
├── 🛡️ Security & Authentication
└── 📊 Monitoring & Logging
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **PostgreSQL** ≥ 14.0
- **Redis** ≥ 6.0
- **npm** ≥ 8.0.0

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd scryptex-backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb scryptex_dev

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 3. Redis Setup

```bash
# Start Redis server (macOS with Homebrew)
brew services start redis

# Start Redis server (Linux)
sudo systemctl start redis

# Start Redis server (Docker)
docker run -d -p 6379:6379 redis:alpine
```

### 4. Environment Configuration

Edit `.env` file with your configuration:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/scryptex_dev

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key

# Blockchain RPCs
RISECHAIN_RPC_URL=https://testnet.riselabs.xyz
ABSTRACT_RPC_URL=https://api.testnet.abs.xyz
OG_RPC_URL=https://evmrpc-testnet.0g.ai/
SOMNIA_RPC_URL=https://vsf-rpc.somnia.network/

# Contract Addresses (populate after deployment)
RISECHAIN_SCRYPTEX_FACTORY=0x...
# ... (see .env.example for all addresses)
```

### 5. Start Development Server

```bash
# Start in development mode
npm run dev

# Start production build
npm run build
npm start

# Start specific services
npm run jobs:start      # Background jobs only
npm run websocket:start # WebSocket server only
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All API endpoints require wallet-based authentication using signed messages.

```bash
# Health check
GET /health

# Authentication
POST /api/auth/connect
POST /api/auth/verify

# Users
GET /api/users/:address
PUT /api/users/:address
GET /api/users/:address/activity

# Tokens
GET /api/tokens
POST /api/tokens/create
GET /api/tokens/:id
GET /api/tokens/:id/price

# Trading
POST /api/trading/swap
GET /api/trading/pairs
POST /api/trading/liquidity/add
GET /api/trading/history/:address

# Bridge
POST /api/bridge/initiate
GET /api/bridge/status/:txHash
GET /api/bridge/history/:address

# Social Features
GET /api/social/communities
POST /api/governance/vote

# Gaming
GET /api/gaming/quests
POST /api/gaming/quests/:id/complete

# Analytics
GET /api/analytics/overview
GET /api/farming/metrics/:address
```

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001');

// Join user-specific room
socket.emit('join', { address: '0x...' });
```

### Event Types
```javascript
// Bridge updates
socket.on('bridge:status_update', (data) => { ... });
socket.on('bridge:transaction_completed', (data) => { ... });

// Trading updates
socket.on('trading:price_update', (data) => { ... });
socket.on('trading:new_pair', (data) => { ... });

// Social updates
socket.on('social:new_message', (data) => { ... });
socket.on('social:proposal_update', (data) => { ... });

// Gaming updates
socket.on('gaming:quest_completed', (data) => { ... });
socket.on('gaming:achievement_unlocked', (data) => { ... });
```

## 🔧 Background Jobs

### Job Types

| Job | Schedule | Description |
|-----|----------|-------------|
| `monitor:token_prices` | Every minute | Update token prices |
| `monitor:bridge_transactions` | Every minute | Monitor bridge status |
| `process:analytics_data` | Every 5 minutes | Process analytics |
| `automate:platform_tokens` | Hourly | Deploy platform tokens |
| `cleanup:old_data` | Daily | Clean up old data |

### Manual Job Control

```bash
# Start job processor
npm run jobs:start

# View job queue (Redis CLI)
redis-cli
> LLEN bull:scryptex:waiting
> LRANGE bull:scryptex:completed 0 -1
```

## 🗄️ Database Schema

### Key Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(50),
  reputation_score INTEGER DEFAULT 0,
  total_volume DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens
CREATE TABLE tokens (
  id UUID PRIMARY KEY,
  chain_id INTEGER NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  creator_address VARCHAR(42) NOT NULL,
  price_usd DECIMAL(20,8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bridge Transactions
CREATE TABLE bridge_transactions (
  id UUID PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  source_chain_id INTEGER NOT NULL,
  target_chain_id INTEGER NOT NULL,
  amount DECIMAL(30,0) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Migrations

```bash
# Create new migration
npx sequelize-cli migration:generate --name create-new-table

# Run migrations
npm run db:migrate

# Rollback migrations
npx sequelize-cli db:migrate:undo
```

## 📊 Monitoring & Logging

### Log Files
```
logs/
├── application-YYYY-MM-DD.log  # General application logs
├── error-YYYY-MM-DD.log        # Error logs
├── blockchain-YYYY-MM-DD.log   # Blockchain operations
├── bridge-YYYY-MM-DD.log       # Bridge operations
├── trading-YYYY-MM-DD.log      # Trading operations
└── security-YYYY-MM-DD.log     # Security events
```

### Health Checks
```bash
# Application health
curl http://localhost:3001/health

# Database health
curl http://localhost:3001/api/health/database

# Redis health
curl http://localhost:3001/api/health/redis

# Blockchain connectivity
curl http://localhost:3001/api/health/blockchain
```

### Performance Monitoring

```javascript
// Custom metrics in logs
loggers.performance.apiResponse('/api/tokens', 'GET', 150, 200);
loggers.blockchain.transaction(11155931, '0x...', 'swap', 'confirmed');
loggers.bridge.initiate('bridge-123', 11155931, 11124, '1000', 'USDC');
```

## 🛡️ Security

### Authentication Flow
1. Frontend requests challenge message
2. User signs message with wallet
3. Backend verifies signature
4. JWT token issued for session

### Rate Limiting
- **100 requests per 15 minutes** per IP
- **Custom limits** for specific endpoints
- **Bypass for authenticated users**

### Input Validation
- **Address validation** for all wallet addresses
- **Amount validation** for all token amounts
- **Chain ID validation** for all network operations
- **Schema validation** using Joi

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t scryptex-backend .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Production Environment

```bash
# Set production environment
export NODE_ENV=production

# Build application
npm run build

# Start with PM2
pm2 start dist/server.js --name "scryptex-backend"

# Setup log rotation
pm2 install pm2-logrotate
```

### Environment Variables

```bash
# Production specific
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/scryptex_prod
REDIS_URL=redis://redis-host:6379
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="Bridge"

# Watch mode
npm run test:watch
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 🔄 Development Workflow

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type checking
npx tsc --noEmit
```

### Git Hooks

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hooks
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## 📈 Performance Optimization

### Caching Strategy
- **Redis caching** for frequently accessed data
- **5-minute TTL** for token prices
- **1-hour TTL** for user profiles
- **Cache invalidation** on data updates

### Database Optimization
- **Connection pooling** (max 20 connections)
- **Proper indexing** on frequently queried columns
- **Query optimization** with EXPLAIN ANALYZE
- **Read replicas** for analytics queries

### API Optimization
- **Response compression** with gzip
- **Pagination** for large datasets
- **Field selection** to reduce payload size
- **Background processing** for heavy operations

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -p 5432 -U postgres -d scryptex_dev
```

#### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Check memory usage
redis-cli info memory
```

#### Blockchain RPC Issues
```bash
# Test RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://testnet.riselabs.xyz
```

#### Job Processing Issues
```bash
# Check job queue
redis-cli LLEN bull:scryptex:waiting

# Clear failed jobs
redis-cli DEL bull:scryptex:failed
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Enable SQL logging
DEBUG_SQL=true npm run dev

# Mock blockchain calls
MOCK_BLOCKCHAIN_CALLS=true npm run dev
```

## 🤝 Contributing

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/scryptex-backend
cd scryptex-backend

# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm test

# Commit and push
git commit -m "Add new feature"
git push origin feature/new-feature
```

### Code Standards
- **TypeScript strict mode** enabled
- **ESLint** configuration enforced
- **Prettier** for code formatting
- **100% test coverage** for new features
- **JSDoc comments** for public APIs

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our Discord server for real-time help

### Reporting Issues
When reporting issues, please include:
- **Environment details** (Node.js version, OS, etc.)
- **Error logs** with full stack traces
- **Steps to reproduce** the issue
- **Expected vs actual behavior**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the SCRYPTEX Team**

*Powering the future of multi-chain DeFi ecosystems*
