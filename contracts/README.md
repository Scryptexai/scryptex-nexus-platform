
# SCRYPTEX Smart Contract Infrastructure

## 🚀 Overview

SCRYPTEX is a comprehensive multi-chain smart contract infrastructure designed for testnet farming and DeFi operations. The platform provides token creation, trading, social features, gaming elements, and cross-chain coordination across multiple blockchain networks.

## 🏗️ Architecture

### Core Components

- **ScryptexFactory**: Main factory contract for platform-wide token creation and management
- **TokenFactory**: Handles individual token deployment with auto-liquidity features
- **ScryptexDEX**: Decentralized exchange for token trading and liquidity management
- **CrossChainCoordinator**: Manages cross-chain operations and message passing

### Feature Modules

- **Social Features**: Community management and user reputation systems
- **Gaming Elements**: Quest management and achievement tracking
- **Analytics**: Activity tracking and farming metrics calculation
- **Cross-Chain**: Multi-chain coordination and state synchronization

## 🌐 Supported Networks

| Network | Chain ID | Role | Description |
|---------|----------|------|-------------|
| RiseChain | 11155931 | Trading | Primary trading and liquidity operations |
| Abstract | 11124 | Social | Community and social features |
| 0G Galileo | 16601 | Analytics | Data collection and metrics |
| Somnia | 50312 | Gaming | Quest and achievement systems |

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd contracts

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
PRIVATE_KEY=your_private_key_here
RISECHAIN_API_KEY=your_risechain_api_key
ABSTRACT_API_KEY=your_abstract_api_key
OG_API_KEY=your_0g_api_key
SOMNIA_API_KEY=your_somnia_api_key
REPORT_GAS=true
```

## 🚀 Deployment

### Single Network Deployment

```bash
# Deploy to RiseChain
npm run deploy:risechain

# Deploy to Abstract
npm run deploy:abstract

# Deploy to 0G Galileo
npm run deploy:og

# Deploy to Somnia
npm run deploy:somnia
```

### Multi-Chain Deployment

```bash
# Deploy to all supported networks
npm run deploy
```

### Verify Contracts

```bash
# Verify deployed contracts
npm run verify
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Generate gas report
REPORT_GAS=true npm test

# Generate coverage report
npm run coverage
```

## 📚 Usage Examples

### Token Creation

```solidity
// Create a new token through ScryptexFactory
IScryptexFactory.CreateTokenParams memory params = IScryptexFactory.CreateTokenParams({
    name: "My Token",
    symbol: "MTK",
    totalSupply: 1000000 * 10**18,
    description: "My awesome token",
    logoUrl: "https://example.com/logo.png",
    autoLiquidity: true
});

address tokenAddress = scryptexFactory.createToken{value: 0.01 ether}(params);
```

### Trading Operations

```solidity
// Swap ETH for tokens
uint256[] memory amounts = scryptexDEX.swapExactETHForTokens{value: 0.1 ether}(
    tokenAddress,
    minTokenAmount,
    msg.sender,
    block.timestamp + 300
);

// Add liquidity
scryptexDEX.addLiquidity{value: 0.5 ether}(
    tokenAddress,
    tokenAmount,
    minTokenAmount,
    minETH,
    msg.sender,
    block.timestamp + 300
);
```

### Cross-Chain Operations

```solidity
// Send cross-chain message
bytes memory data = abi.encode("SYNC_USER_DATA", userData);
crossChainCoordinator.sendCrossChainMessage(targetChainId, data);
```

## 🔧 Development

### Compiling Contracts

```bash
npm run compile
```

### Code Style

- Follow Solidity style guide
- Use NatSpec documentation
- Implement comprehensive error handling
- Include event emissions for state changes

### Security Considerations

- All state-changing functions use ReentrancyGuard
- Access control implemented with OpenZeppelin's Ownable
- Input validation on all public functions
- Emergency pause functionality included

## 📊 Contract Addresses

After deployment, contract addresses are stored in:
```
deployments/
├── risechain-testnet/
├── abstract-testnet/
├── og-galileo/
└── somnia-testnet/
```

Each deployment file contains:
- Contract addresses
- Transaction hashes
- Block numbers
- Deployment timestamps

## 🔍 Monitoring

### Events to Monitor

- `TokenCreated`: New token deployments
- `Swap`: Trading activity
- `LiquidityAdded`/`LiquidityRemoved`: Liquidity changes
- `CrossChainMessageSent`: Cross-chain activities
- `QuestCompleted`: Gaming activities

### Metrics to Track

- Total tokens created
- Trading volume
- Liquidity provided
- Cross-chain messages
- User activities

## 🛡️ Security

### Audit Checklist

- [ ] Reentrancy protection
- [ ] Integer overflow/underflow protection
- [ ] Access control verification
- [ ] Input validation
- [ ] Emergency procedures
- [ ] Upgrade mechanisms
- [ ] Gas optimization

### Emergency Procedures

1. **Pause Contracts**: Use `pause()` function on main contracts
2. **Emergency Withdrawal**: Extract funds using `emergencyWithdraw()`
3. **Cross-Chain Halt**: Disable cross-chain coordinators
4. **Update Configuration**: Modify platform parameters

## 📈 Performance

### Gas Optimization

- Batch operations where possible
- Use assembly for mathematical operations
- Optimize storage patterns
- Minimize external calls

### Recommended Gas Limits

| Operation | Gas Limit |
|-----------|-----------|
| Token Creation | 2,000,000 |
| Token Swap | 150,000 |
| Add Liquidity | 200,000 |
| Cross-Chain Message | 100,000 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write comprehensive tests
4. Follow coding standards
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Join our Discord community
- Check the documentation

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core infrastructure deployment
- ✅ Multi-chain coordination
- ✅ Basic trading functionality

### Phase 2 (Upcoming)
- [ ] Advanced trading features
- [ ] Enhanced cross-chain messaging
- [ ] Governance implementation
- [ ] Mobile SDK integration

### Phase 3 (Future)
- [ ] Mainnet deployment
- [ ] Advanced DeFi protocols
- [ ] DAO governance
- [ ] Professional audit

---

**Built with ❤️ for the DeFi community**
