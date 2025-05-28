
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

const ABSTRACT_CONTRACTS = {
  social: ['CommunityManager'],
  crossChain: ['CrossChainCoordinator']
};

const ABSTRACT_CONFIG = {
  chainId: 11124,
  name: 'Abstract Testnet',
  rpc: 'https://api.testnet.abs.xyz',
  explorer: 'https://sepolia.abscan.org/',
  currency: 'ETH'
};

async function deployToAbstract(): Promise<void> {
  console.log("🚀 Starting Abstract Deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📋 Deployment Details:`);
  console.log(`   Network: ${ABSTRACT_CONFIG.name}`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   RPC: ${ABSTRACT_CONFIG.rpc}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Insufficient balance! Please fund the deployer wallet.");
  }

  const deploymentInfo: DeploymentInfo = {
    network: ABSTRACT_CONFIG.name,
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

    // Deploy CommunityManager
    console.log("⚡ Deploying CommunityManager...");
    const CommunityManager = await ethers.getContractFactory("CommunityManager");
    const communityManager = await CommunityManager.deploy();
    await communityManager.waitForDeployment();
    
    const communityAddress = await communityManager.getAddress();
    const communityTx = communityManager.deploymentTransaction();
    
    deploymentInfo.contracts["CommunityManager"] = communityAddress;
    deploymentInfo.transactionHashes["CommunityManager"] = communityTx?.hash || "";
    
    if (communityTx) {
      const receipt = await communityTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
      }
    }
    
    console.log(`✅ CommunityManager deployed to: ${communityAddress}`);

    deploymentInfo.gasUsed = totalGasUsed.toString();

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(deploymentsDir, 'abstract.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 Abstract Deployment Complete!");
    console.log(`📊 Total Gas Used: ${totalGasUsed.toString()}`);
    console.log(`📁 Deployment info saved to: deployments/abstract.json`);
    console.log(`🔍 Explorer: ${ABSTRACT_CONFIG.explorer}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

if (require.main === module) {
  deployToAbstract().catch(console.error);
}

export { deployToAbstract };
