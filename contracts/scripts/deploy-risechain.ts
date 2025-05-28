
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

const RISECHAIN_CONTRACTS = {
  core: ['ScryptexFactory'],
  tokens: ['TokenFactory'],
  trading: ['ScryptexDEX'],
  crossChain: ['CrossChainCoordinator']
};

const RISECHAIN_CONFIG = {
  chainId: 11155931,
  name: 'RISE Testnet',
  rpc: 'https://testnet.riselabs.xyz',
  explorer: 'https://explorer.testnet.riselabs.xyz',
  faucet: 'https://faucet.testnet.riselabs.xyz/',
  currency: 'ETH'
};

async function deployToRiseChain(): Promise<void> {
  console.log("🚀 Starting RiseChain Deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`📋 Deployment Details:`);
  console.log(`   Network: ${RISECHAIN_CONFIG.name}`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   RPC: ${RISECHAIN_CONFIG.rpc}`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Insufficient balance! Please fund the deployer wallet.");
  }

  const deploymentInfo: DeploymentInfo = {
    network: RISECHAIN_CONFIG.name,
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
    // Deploy CrossChainCoordinator first (dependency for others)
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

    // Deploy TokenFactory
    console.log("⚡ Deploying TokenFactory...");
    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    const tokenFactory = await TokenFactory.deploy();
    await tokenFactory.waitForDeployment();
    
    const tokenFactoryAddress = await tokenFactory.getAddress();
    const tokenFactoryTx = tokenFactory.deploymentTransaction();
    
    deploymentInfo.contracts["TokenFactory"] = tokenFactoryAddress;
    deploymentInfo.transactionHashes["TokenFactory"] = tokenFactoryTx?.hash || "";
    
    if (tokenFactoryTx) {
      const receipt = await tokenFactoryTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
      }
    }
    
    console.log(`✅ TokenFactory deployed to: ${tokenFactoryAddress}`);

    // Deploy ScryptexDEX
    console.log("⚡ Deploying ScryptexDEX...");
    const ScryptexDEX = await ethers.getContractFactory("ScryptexDEX");
    const scryptexDEX = await ScryptexDEX.deploy();
    await scryptexDEX.waitForDeployment();
    
    const dexAddress = await scryptexDEX.getAddress();
    const dexTx = scryptexDEX.deploymentTransaction();
    
    deploymentInfo.contracts["ScryptexDEX"] = dexAddress;
    deploymentInfo.transactionHashes["ScryptexDEX"] = dexTx?.hash || "";
    
    if (dexTx) {
      const receipt = await dexTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
      }
    }
    
    console.log(`✅ ScryptexDEX deployed to: ${dexAddress}`);

    // Deploy ScryptexFactory (main factory contract)
    console.log("⚡ Deploying ScryptexFactory...");
    const ScryptexFactory = await ethers.getContractFactory("ScryptexFactory");
    const scryptexFactory = await ScryptexFactory.deploy(
      deployer.address, // initialOwner
      ethers.parseEther("0.01"), // tokenCreationFee
      250, // platformFeePercentage (2.5%)
      deployer.address // feeRecipient
    );
    await scryptexFactory.waitForDeployment();
    
    const factoryAddress = await scryptexFactory.getAddress();
    const factoryTx = scryptexFactory.deploymentTransaction();
    
    deploymentInfo.contracts["ScryptexFactory"] = factoryAddress;
    deploymentInfo.transactionHashes["ScryptexFactory"] = factoryTx?.hash || "";
    
    if (factoryTx) {
      const receipt = await factoryTx.wait();
      if (receipt) {
        totalGasUsed += receipt.gasUsed;
      }
    }
    
    console.log(`✅ ScryptexFactory deployed to: ${factoryAddress}`);

    deploymentInfo.gasUsed = totalGasUsed.toString();

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(deploymentsDir, 'risechain.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 RiseChain Deployment Complete!");
    console.log(`📊 Total Gas Used: ${totalGasUsed.toString()}`);
    console.log(`📁 Deployment info saved to: deployments/risechain.json`);
    console.log(`🔍 Explorer: ${RISECHAIN_CONFIG.explorer}`);

    // Post-deployment validation
    console.log("\n🔍 Validating deployments...");
    await validateDeployments(deploymentInfo.contracts);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

async function validateDeployments(contracts: Record<string, string>): Promise<void> {
  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await ethers.provider.getCode(address);
      if (code === "0x") {
        throw new Error(`Contract ${name} at ${address} has no code`);
      }
      console.log(`✅ ${name} validation passed`);
    } catch (error) {
      console.error(`❌ ${name} validation failed:`, error);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  deployToRiseChain().catch(console.error);
}

export { deployToRiseChain };
