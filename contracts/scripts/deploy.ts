
import { ethers, network } from "hardhat";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: {
    [key: string]: {
      address: string;
      txHash: string;
      blockNumber: number;
    };
  };
  timestamp: number;
}

async function main() {
  console.log(`🚀 Starting deployment to ${network.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  const chainId = (await ethers.provider.getNetwork()).chainId;
  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId: Number(chainId),
    contracts: {},
    timestamp: Date.now()
  };

  try {
    // Deploy ScryptexFactory
    console.log("\n📦 Deploying ScryptexFactory...");
    const ScryptexFactory = await ethers.getContractFactory("ScryptexFactory");
    const scryptexFactory = await ScryptexFactory.deploy(
      deployer.address, // initialOwner
      ethers.parseEther("0.01"), // tokenCreationFee (0.01 ETH)
      250, // platformFeePercentage (2.5%)
      deployer.address // feeRecipient
    );
    await scryptexFactory.waitForDeployment();
    
    const factoryAddress = await scryptexFactory.getAddress();
    const factoryTx = scryptexFactory.deploymentTransaction();
    
    deploymentInfo.contracts["ScryptexFactory"] = {
      address: factoryAddress,
      txHash: factoryTx?.hash || "",
      blockNumber: factoryTx?.blockNumber || 0
    };
    
    console.log("✅ ScryptexFactory deployed to:", factoryAddress);

    // Deploy additional components if on specific chains
    if (network.name === "risechain") {
      await deployTradingInfrastructure(deploymentInfo);
    } else if (network.name === "abstract") {
      await deploySocialFeatures(deploymentInfo);
    } else if (network.name === "og") {
      await deployAnalyticsComponents(deploymentInfo);
    } else if (network.name === "somnia") {
      await deployGamingFeatures(deploymentInfo);
    }

    // Deploy cross-chain coordinator on all chains
    await deployCrossChainCoordinator(deploymentInfo);

    // Save deployment info
    await saveDeploymentInfo(deploymentInfo);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📄 Deployment info saved to:", getDeploymentPath(network.name));
    
    // Print summary
    printDeploymentSummary(deploymentInfo);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function deployTradingInfrastructure(deploymentInfo: DeploymentInfo) {
  console.log("\n💱 Deploying Trading Infrastructure (RiseChain)...");
  
  // ScryptexDEX is already deployed through TokenFactory, but we can deploy additional trading components
  console.log("✅ Trading infrastructure ready");
}

async function deploySocialFeatures(deploymentInfo: DeploymentInfo) {
  console.log("\n👥 Deploying Social Features (Abstract)...");
  
  const CommunityManager = await ethers.getContractFactory("CommunityManager");
  const communityManager = await CommunityManager.deploy();
  await communityManager.waitForDeployment();
  
  const address = await communityManager.getAddress();
  const tx = communityManager.deploymentTransaction();
  
  deploymentInfo.contracts["CommunityManager"] = {
    address,
    txHash: tx?.hash || "",
    blockNumber: tx?.blockNumber || 0
  };
  
  console.log("✅ CommunityManager deployed to:", address);
}

async function deployAnalyticsComponents(deploymentInfo: DeploymentInfo) {
  console.log("\n📊 Deploying Analytics Components (0G)...");
  
  const ActivityTracker = await ethers.getContractFactory("ActivityTracker");
  const activityTracker = await ActivityTracker.deploy();
  await activityTracker.waitForDeployment();
  
  const address = await activityTracker.getAddress();
  const tx = activityTracker.deploymentTransaction();
  
  deploymentInfo.contracts["ActivityTracker"] = {
    address,
    txHash: tx?.hash || "",
    blockNumber: tx?.blockNumber || 0
  };
  
  console.log("✅ ActivityTracker deployed to:", address);
}

async function deployGamingFeatures(deploymentInfo: DeploymentInfo) {
  console.log("\n🎮 Deploying Gaming Features (Somnia)...");
  
  const QuestManager = await ethers.getContractFactory("QuestManager");
  const questManager = await QuestManager.deploy();
  await questManager.waitForDeployment();
  
  const address = await questManager.getAddress();
  const tx = questManager.deploymentTransaction();
  
  deploymentInfo.contracts["QuestManager"] = {
    address,
    txHash: tx?.hash || "",
    blockNumber: tx?.blockNumber || 0
  };
  
  console.log("✅ QuestManager deployed to:", address);
}

async function deployCrossChainCoordinator(deploymentInfo: DeploymentInfo) {
  console.log("\n🌐 Deploying Cross-Chain Coordinator...");
  
  const CrossChainCoordinator = await ethers.getContractFactory("CrossChainCoordinator");
  const coordinator = await CrossChainCoordinator.deploy();
  await coordinator.waitForDeployment();
  
  const address = await coordinator.getAddress();
  const tx = coordinator.deploymentTransaction();
  
  deploymentInfo.contracts["CrossChainCoordinator"] = {
    address,
    txHash: tx?.hash || "",
    blockNumber: tx?.blockNumber || 0
  };
  
  console.log("✅ CrossChainCoordinator deployed to:", address);
}

function getDeploymentPath(networkName: string): string {
  const deploymentDir = join(__dirname, "..", "deployments", networkName);
  if (!existsSync(deploymentDir)) {
    mkdirSync(deploymentDir, { recursive: true });
  }
  return join(deploymentDir, "deployment.json");
}

async function saveDeploymentInfo(deploymentInfo: DeploymentInfo) {
  const filePath = getDeploymentPath(deploymentInfo.network);
  writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
}

function printDeploymentSummary(deploymentInfo: DeploymentInfo) {
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`Timestamp: ${new Date(deploymentInfo.timestamp).toISOString()}`);
  console.log("\n📦 Deployed Contracts:");
  
  Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
    console.log(`  ${name}: ${info.address}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
