
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  timestamp: string;
  deployer: string;
  gasUsed: string;
  contracts: Record<string, string>;
  verified: boolean;
  transactionHashes: Record<string, string>;
}

const OG_CONTRACTS = {
  analytics: ['ActivityTracker'],
  crossChain: ['CrossChainCoordinator']
};

const OG_CONFIG = {
  chainId: 16601,
  name: '0G Galileo',
  rpc: 'https://evmrpc-testnet.0g.ai/',
  explorer: 'https://chainscan-galileo.0g.ai/',
  faucet: 'https://faucet.0g.ai/',
  currency: 'OG'
};

async function deployToOG(): Promise<void> {
  console.log("🚀 Starting 0G Deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📋 Deployment Details:`);
  console.log(`   Network: ${OG_CONFIG.name}`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   RPC: ${OG_CONFIG.rpc}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} OG\n`);

  if (balance < ethers.parseEther("1.0")) {
    throw new Error("❌ Insufficient balance! Please fund the deployer wallet.");
  }

  const deploymentInfo: DeploymentInfo = {
    network: OG_CONFIG.name,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    gasUsed: "0",
    contracts: {},
    verified: false,
    transactionHashes: {}
  };

  let totalGasUsed = BigInt(0);

  try {
    // Deploy CrossChainCoordinator
    console.log("⚡ Deploying CrossChainCoordinator...");
    const CrossChainCoordinator = await ethers.getContractFactory("CrossChainCoordinator");
    const crossChainCoordinator = await CrossChainCoordinator.deploy();
    await crossChainCoordinator.waitForDeployment();
    
    const crossChainAddress = await crossChainCoordinator.getAddress();
    const crossChainTx = crossChainCoordinator.deploymentTransaction();
    
    deploymentInfo.contracts["CrossChainCoordinator"] = crossChainAddress;
    deploymentInfo.transactionHashes["CrossChainCoordinator"] = crossChainTx?.hash || "";
    
    if (crossChainTx) {
      const receipt = await crossChainTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
      }
    }
    
    console.log(`✅ CrossChainCoordinator deployed to: ${crossChainAddress}`);

    // Deploy ActivityTracker
    console.log("⚡ Deploying ActivityTracker...");
    const ActivityTracker = await ethers.getContractFactory("ActivityTracker");
    const activityTracker = await ActivityTracker.deploy();
    await activityTracker.waitForDeployment();
    
    const activityAddress = await activityTracker.getAddress();
    const activityTx = activityTracker.deploymentTransaction();
    
    deploymentInfo.contracts["ActivityTracker"] = activityAddress;
    deploymentInfo.transactionHashes["ActivityTracker"] = activityTx?.hash || "";
    
    if (activityTx) {
      const receipt = await activityTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
      }
    }
    
    console.log(`✅ ActivityTracker deployed to: ${activityAddress}`);

    deploymentInfo.gasUsed = totalGasUsed.toString();

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(deploymentsDir, 'og.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 0G Deployment Complete!");
    console.log(`📊 Total Gas Used: ${totalGasUsed.toString()}`);
    console.log(`📁 Deployment info saved to: deployments/og.json`);
    console.log(`🔍 Explorer: ${OG_CONFIG.explorer}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

if (require.main === module) {
  deployToOG().catch(console.error);
}

export { deployToOG };
