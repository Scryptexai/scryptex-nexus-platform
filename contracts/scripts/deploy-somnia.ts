
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

const SOMNIA_CONTRACTS = {
  gaming: ['QuestManager'],
  crossChain: ['CrossChainCoordinator']
};

const SOMNIA_CONFIG = {
  chainId: 50312,
  name: 'Somnia Testnet',
  rpc: 'https://vsf-rpc.somnia.network/',
  explorer: 'https://shannon-explorer.somnia.network/',
  faucet: 'https://testnet.somnia.network/',
  currency: 'STT'
};

async function deployToSomnia(): Promise<void> {
  console.log("🚀 Starting Somnia Deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📋 Deployment Details:`);
  console.log(`   Network: ${SOMNIA_CONFIG.name}`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   RPC: ${SOMNIA_CONFIG.rpc}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} STT\n`);

  if (balance < ethers.parseEther("10.0")) {
    throw new Error("❌ Insufficient balance! Please fund the deployer wallet.");
  }

  const deploymentInfo: DeploymentInfo = {
    network: SOMNIA_CONFIG.name,
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

    // Deploy QuestManager
    console.log("⚡ Deploying QuestManager...");
    const QuestManager = await ethers.getContractFactory("QuestManager");
    const questManager = await QuestManager.deploy();
    await questManager.waitForDeployment();
    
    const questAddress = await questManager.getAddress();
    const questTx = questManager.deploymentTransaction();
    
    deploymentInfo.contracts["QuestManager"] = questAddress;
    deploymentInfo.transactionHashes["QuestManager"] = questTx?.hash || "";
    
    if (questTx) {
      const receipt = await questTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
      }
    }
    
    console.log(`✅ QuestManager deployed to: ${questAddress}`);

    deploymentInfo.gasUsed = totalGasUsed.toString();

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(deploymentsDir, 'somnia.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 Somnia Deployment Complete!");
    console.log(`📊 Total Gas Used: ${totalGasUsed.toString()}`);
    console.log(`📁 Deployment info saved to: deployments/somnia.json`);
    console.log(`🔍 Explorer: ${SOMNIA_CONFIG.explorer}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

if (require.main === module) {
  deployToSomnia().catch(console.error);
}

export { deployToSomnia };
