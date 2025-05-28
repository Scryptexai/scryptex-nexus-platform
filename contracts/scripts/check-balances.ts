
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

interface ChainConfig {
  name: string;
  chainId: number;
  rpc: string;
  currency: string;
  minBalance: string;
  faucet: string;
}

interface WalletInfo {
  role: string;
  chain: string;
  address: string;
}

const CHAINS: Record<string, ChainConfig> = {
  'RiseChain': {
    name: 'RiseChain Testnet',
    chainId: 11155931,
    rpc: 'https://testnet.riselabs.xyz',
    currency: 'ETH',
    minBalance: '0.1',
    faucet: 'https://faucet.testnet.riselabs.xyz/'
  },
  'Abstract': {
    name: 'Abstract Testnet',
    chainId: 11124,
    rpc: 'https://api.testnet.abs.xyz',
    currency: 'ETH',
    minBalance: '0.1',
    faucet: 'https://faucet.abs.xyz/'
  },
  '0G Galileo': {
    name: '0G Galileo',
    chainId: 16601,
    rpc: 'https://evmrpc-testnet.0g.ai/',
    currency: 'OG',
    minBalance: '1.0',
    faucet: 'https://faucet.0g.ai/'
  },
  'Somnia': {
    name: 'Somnia Testnet',
    chainId: 50312,
    rpc: 'https://vsf-rpc.somnia.network/',
    currency: 'STT',
    minBalance: '10.0',
    faucet: 'https://testnet.somnia.network/'
  }
};

async function checkBalances(): Promise<void> {
  console.log("💰 SCRYPTEX Wallet Balance Checker\n");

  // Load wallet data
  const walletsPath = path.join(__dirname, '..', 'deployments', 'wallets.json');
  if (!fs.existsSync(walletsPath)) {
    console.error("❌ Wallets file not found. Run 'npm run generate-wallets' first.");
    return;
  }

  const walletsData = JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
  const allWallets: WalletInfo[] = [
    ...walletsData.deployers,
    ...walletsData.platformWallets
  ];

  const results: Record<string, Array<{
    role: string;
    address: string;
    balance: string;
    isFunded: boolean;
    needsFunding: boolean;
  }>> = {};

  // Check balances for each chain
  for (const [chainName, chainConfig] of Object.entries(CHAINS)) {
    console.log(`🌐 Checking ${chainConfig.name}...`);
    
    const provider = new ethers.JsonRpcProvider(chainConfig.rpc);
    const chainWallets = allWallets.filter(w => w.chain.includes(chainName));
    
    results[chainName] = [];

    for (const wallet of chainWallets) {
      try {
        const balance = await provider.getBalance(wallet.address);
        const balanceFormatted = ethers.formatEther(balance);
        const minBalanceWei = ethers.parseEther(chainConfig.minBalance);
        const isFunded = balance >= minBalanceWei;
        
        results[chainName].push({
          role: wallet.role,
          address: wallet.address,
          balance: balanceFormatted,
          isFunded,
          needsFunding: !isFunded
        });

        const status = isFunded ? "✅ FUNDED" : "❌ NEEDS FUNDING";
        console.log(`   ${wallet.role}: ${balanceFormatted} ${chainConfig.currency} ${status}`);
        
      } catch (error) {
        console.error(`   ❌ Error checking ${wallet.role}:`, error);
        results[chainName].push({
          role: wallet.role,
          address: wallet.address,
          balance: "ERROR",
          isFunded: false,
          needsFunding: true
        });
      }
    }
    console.log();
  }

  // Generate summary report
  generateSummaryReport(results);
}

function generateSummaryReport(results: Record<string, Array<{
  role: string;
  address: string;
  balance: string;
  isFunded: boolean;
  needsFunding: boolean;
}>>): void {
  console.log("📊 FUNDING SUMMARY\n");

  let totalWallets = 0;
  let fundedWallets = 0;
  const unfundedWallets: Array<{chain: string, role: string, address: string, faucet: string}> = [];

  for (const [chainName, wallets] of Object.entries(results)) {
    const chainConfig = CHAINS[chainName];
    const chainFunded = wallets.filter(w => w.isFunded).length;
    const chainTotal = wallets.length;
    
    totalWallets += chainTotal;
    fundedWallets += chainFunded;

    console.log(`🌐 ${chainConfig.name}: ${chainFunded}/${chainTotal} funded`);

    // Collect unfunded wallets
    wallets.filter(w => w.needsFunding).forEach(wallet => {
      unfundedWallets.push({
        chain: chainName,
        role: wallet.role,
        address: wallet.address,
        faucet: chainConfig.faucet
      });
    });
  }

  console.log(`\n🎯 Overall Status: ${fundedWallets}/${totalWallets} wallets funded\n`);

  if (unfundedWallets.length > 0) {
    console.log("💡 WALLETS NEEDING FUNDING:\n");
    
    const groupedByChain = unfundedWallets.reduce((acc, wallet) => {
      if (!acc[wallet.chain]) acc[wallet.chain] = [];
      acc[wallet.chain].push(wallet);
      return acc;
    }, {} as Record<string, typeof unfundedWallets>);

    for (const [chainName, wallets] of Object.entries(groupedByChain)) {
      const chainConfig = CHAINS[chainName];
      console.log(`🌐 ${chainConfig.name}:`);
      console.log(`   Faucet: ${chainConfig.faucet}`);
      console.log(`   Required: ${chainConfig.minBalance} ${chainConfig.currency} per wallet\n`);
      
      wallets.forEach(wallet => {
        console.log(`   📋 ${wallet.role}`);
        console.log(`      Address: ${wallet.address}`);
      });
      console.log();
    }

    console.log("🚀 QUICK FUNDING COMMANDS:\n");
    console.log("After funding wallets manually, run:");
    console.log("   npm run check-balances  # Check again");
    console.log("   npm run deploy:all      # Deploy when all funded\n");
  } else {
    console.log("🎉 ALL WALLETS FUNDED! Ready to deploy.");
    console.log("\n🚀 DEPLOYMENT COMMANDS:");
    console.log("   npm run deploy:all      # Deploy to all chains");
    console.log("   npm run deploy:risechain # Deploy to RiseChain only");
    console.log("   npm run deploy:abstract # Deploy to Abstract only");
    console.log("   npm run deploy:og       # Deploy to 0G only");
    console.log("   npm run deploy:somnia   # Deploy to Somnia only");
  }
}

if (require.main === module) {
  checkBalances().catch(console.error);
}

export { checkBalances };
