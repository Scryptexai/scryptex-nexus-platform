
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

interface WalletInfo {
  role: string;
  chain: string;
  purpose: string;
  address: string;
  privateKey: string;
  mnemonic: string;
  path: string;
}

interface ChainInfo {
  chainId: number;
  name: string;
  rpc: string;
  explorer: string;
  faucet: string;
  currency: string;
  minBalance: string;
}

const WALLET_CONFIGURATION = {
  deployers: [
    { role: 'RISECHAIN_DEPLOYER', chain: 'RiseChain (11155931)', purpose: 'Deploy trading contracts' },
    { role: 'ABSTRACT_DEPLOYER', chain: 'Abstract (11124)', purpose: 'Deploy social contracts' },
    { role: 'OG_DEPLOYER', chain: '0G Galileo (16601)', purpose: 'Deploy analytics contracts' },
    { role: 'SOMNIA_DEPLOYER', chain: 'Somnia (50312)', purpose: 'Deploy gaming contracts' }
  ],
  platformWallets: [
    { role: 'RISECHAIN_PLATFORM_1', chain: 'RiseChain', purpose: 'Token deployment & liquidity operations' },
    { role: 'RISECHAIN_PLATFORM_2', chain: 'RiseChain', purpose: 'Trading operations & fee collection' },
    { role: 'ABSTRACT_PLATFORM_1', chain: 'Abstract', purpose: 'Social activities & community management' },
    { role: 'ABSTRACT_PLATFORM_2', chain: 'Abstract', purpose: 'Governance voting & reputation' },
    { role: 'OG_PLATFORM_1', chain: '0G Galileo', purpose: 'Data operations & analytics collection' },
    { role: 'OG_PLATFORM_2', chain: '0G Galileo', purpose: 'Metrics processing & farming calculations' },
    { role: 'SOMNIA_PLATFORM_1', chain: 'Somnia', purpose: 'Quest management & gaming rewards' },
    { role: 'SOMNIA_PLATFORM_2', chain: 'Somnia', purpose: 'Achievement NFTs & reward distribution' }
  ]
};

const CHAIN_INFO: Record<string, ChainInfo> = {
  'RiseChain': {
    chainId: 11155931,
    name: 'RISE Testnet',
    rpc: 'https://testnet.riselabs.xyz',
    explorer: 'https://explorer.testnet.riselabs.xyz',
    faucet: 'https://faucet.testnet.riselabs.xyz/',
    currency: 'ETH',
    minBalance: '0.1'
  },
  'Abstract': {
    chainId: 11124,
    name: 'Abstract Testnet',
    rpc: 'https://api.testnet.abs.xyz',
    explorer: 'https://sepolia.abscan.org/',
    faucet: 'https://faucet.abs.xyz/',
    currency: 'ETH',
    minBalance: '0.1'
  },
  '0G Galileo': {
    chainId: 16601,
    name: '0G Galileo',
    rpc: 'https://evmrpc-testnet.0g.ai/',
    explorer: 'https://chainscan-galileo.0g.ai/',
    faucet: 'https://faucet.0g.ai/',
    currency: 'OG',
    minBalance: '1.0'
  },
  'Somnia': {
    chainId: 50312,
    name: 'Somnia Testnet',
    rpc: 'https://vsf-rpc.somnia.network/',
    explorer: 'https://shannon-explorer.somnia.network/',
    faucet: 'https://testnet.somnia.network/',
    currency: 'STT',
    minBalance: '10.0'
  }
};

async function generateWallets(): Promise<void> {
  console.log("🚀 SCRYPTEX Wallet Generation Starting...\n");

  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const allWallets: WalletInfo[] = [];
  const envVariables: string[] = [];

  // Generate deployer wallets
  console.log("⚡ Generating Deployer Wallets...");
  for (let i = 0; i < WALLET_CONFIGURATION.deployers.length; i++) {
    const config = WALLET_CONFIGURATION.deployers[i];
    const wallet = ethers.Wallet.createRandom();
    
    const walletInfo: WalletInfo = {
      role: config.role,
      chain: config.chain,
      purpose: config.purpose,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || '',
      path: wallet.mnemonic?.path || ''
    };

    allWallets.push(walletInfo);
    envVariables.push(`${config.role}_PRIVATE_KEY=${wallet.privateKey}`);
    envVariables.push(`${config.role}_ADDRESS=${wallet.address}`);

    console.log(`✅ ${config.role}: ${wallet.address}`);
  }

  // Generate platform wallets
  console.log("\n🏦 Generating Platform Wallets...");
  for (let i = 0; i < WALLET_CONFIGURATION.platformWallets.length; i++) {
    const config = WALLET_CONFIGURATION.platformWallets[i];
    const wallet = ethers.Wallet.createRandom();
    
    const walletInfo: WalletInfo = {
      role: config.role,
      chain: config.chain,
      purpose: config.purpose,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || '',
      path: wallet.mnemonic?.path || ''
    };

    allWallets.push(walletInfo);
    envVariables.push(`${config.role}_PRIVATE_KEY=${wallet.privateKey}`);
    envVariables.push(`${config.role}_ADDRESS=${wallet.address}`);

    console.log(`✅ ${config.role}: ${wallet.address}`);
  }

  // Save wallet data
  const walletData = {
    timestamp: new Date().toISOString(),
    totalWallets: allWallets.length,
    deployers: allWallets.slice(0, 4),
    platformWallets: allWallets.slice(4),
    securityNote: "🔒 KEEP THESE PRIVATE KEYS SECURE! Never commit them to version control.",
    usage: "Use these wallets for deployment and platform operations across all testnet chains."
  };

  fs.writeFileSync(
    path.join(deploymentsDir, 'wallets.json'),
    JSON.stringify(walletData, null, 2)
  );

  // Generate .env file
  const envContent = [
    "# 🚀 SCRYPTEX Multi-Chain Deployment Configuration",
    "# Generated automatically - DO NOT COMMIT TO VERSION CONTROL",
    "",
    "# Deployer Private Keys",
    ...envVariables.slice(0, 8),
    "",
    "# Platform Wallet Private Keys",
    ...envVariables.slice(8),
    "",
    "# API Keys for Contract Verification",
    "RISECHAIN_API_KEY=your_risechain_api_key_here",
    "ABSTRACT_API_KEY=your_abstract_api_key_here",
    "OG_API_KEY=your_0g_api_key_here",
    "SOMNIA_API_KEY=your_somnia_api_key_here",
    "",
    "# Platform Configuration",
    "PLATFORM_FEE_PERCENTAGE=250",
    "TOKEN_CREATION_FEE=0.01",
    "INITIAL_LIQUIDITY_ETH=0.5"
  ];

  fs.writeFileSync(
    path.join(__dirname, '..', '.env'),
    envContent.join('\n')
  );

  // Generate funding instructions
  await generateFundingInstructions(allWallets, deploymentsDir);

  console.log("\n🎉 Wallet Generation Complete!");
  console.log(`📁 Wallet data saved to: ${path.join(deploymentsDir, 'wallets.json')}`);
  console.log(`📝 Environment file saved to: ${path.join(__dirname, '..', '.env')}`);
  console.log(`📋 Funding instructions saved to: ${path.join(deploymentsDir, 'funding-instructions.md')}`);
  console.log("\n⚠️ SECURITY WARNING: Keep your .env file secure and never commit it to version control!");
}

async function generateFundingInstructions(wallets: WalletInfo[], deploymentsDir: string): Promise<void> {
  const instructions = [
    "# 💰 SCRYPTEX Wallet Funding Instructions",
    "",
    "## 🎯 Quick Setup Guide",
    "",
    "To deploy the SCRYPTEX platform, you need to fund the following wallets with testnet tokens:",
    "",
    "### 🔥 Priority Wallets (Fund These First)",
    ""
  ];

  // Group wallets by chain
  const walletsByChain: Record<string, WalletInfo[]> = {};
  wallets.forEach(wallet => {
    const chainName = wallet.chain.split(' (')[0];
    if (!walletsByChain[chainName]) {
      walletsByChain[chainName] = [];
    }
    walletsByChain[chainName].push(wallet);
  });

  // Generate instructions for each chain
  Object.entries(walletsByChain).forEach(([chainName, chainWallets]) => {
    const chainInfo = CHAIN_INFO[chainName];
    if (!chainInfo) return;

    instructions.push(`## 🌐 ${chainInfo.name} (Chain ID: ${chainInfo.chainId})`);
    instructions.push("");
    instructions.push(`**Faucet URL:** ${chainInfo.faucet}`);
    instructions.push(`**Currency:** ${chainInfo.currency}`);
    instructions.push(`**Minimum Balance:** ${chainInfo.minBalance} ${chainInfo.currency}`);
    instructions.push(`**Explorer:** ${chainInfo.explorer}`);
    instructions.push("");

    chainWallets.forEach(wallet => {
      instructions.push(`### ${wallet.role}`);
      instructions.push(`- **Address:** \`${wallet.address}\``);
      instructions.push(`- **Purpose:** ${wallet.purpose}`);
      instructions.push(`- **Required Amount:** ${chainInfo.minBalance} ${chainInfo.currency}`);
      instructions.push("");
    });

    instructions.push("---");
    instructions.push("");
  });

  // Add automation instructions
  instructions.push(
    "## 🤖 Automated Funding Check",
    "",
    "After funding the wallets, run the balance checker:",
    "",
    "```bash",
    "npm run check-balances",
    "```",
    "",
    "## 🚀 Deployment Commands",
    "",
    "Once all wallets are funded, deploy contracts:",
    "",
    "```bash",
    "# Deploy to all chains",
    "npm run deploy:all",
    "",
    "# Or deploy to specific chains",
    "npm run deploy:risechain",
    "npm run deploy:abstract", 
    "npm run deploy:og",
    "npm run deploy:somnia",
    "```",
    "",
    "## ⚠️ Important Notes",
    "",
    "- Keep your private keys secure",
    "- Never share your .env file",
    "- Test with small amounts first",
    "- Verify all addresses before funding",
    "- Use official faucets only"
  );

  fs.writeFileSync(
    path.join(deploymentsDir, 'funding-instructions.md'),
    instructions.join('\n')
  );
}

// Execute if run directly
if (require.main === module) {
  generateWallets().catch(console.error);
}

export { generateWallets };
