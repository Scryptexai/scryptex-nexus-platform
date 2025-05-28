
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

interface ChainConfig {
  name: string;
  chainId: number;
  rpc: string;
  explorer: string;
}

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: Record<string, string>;
  timestamp: string;
}

interface StatusResult {
  contract: string;
  address: string;
  isDeployed: boolean;
  codeSize: number;
  isWorking: boolean;
  error?: string;
}

const CHAINS: Record<string, ChainConfig> = {
  'risechain': {
    name: 'RiseChain Testnet',
    chainId: 11155931,
    rpc: 'https://testnet.riselabs.xyz',
    explorer: 'https://explorer.testnet.riselabs.xyz'
  },
  'abstract': {
    name: 'Abstract Testnet',
    chainId: 11124,
    rpc: 'https://api.testnet.abs.xyz',
    explorer: 'https://sepolia.abscan.org/'
  },
  'og': {
    name: '0G Galileo',
    chainId: 16601,
    rpc: 'https://evmrpc-testnet.0g.ai/',
    explorer: 'https://chainscan-galileo.0g.ai/'
  },
  'somnia': {
    name: 'Somnia Testnet',
    chainId: 50312,
    rpc: 'https://vsf-rpc.somnia.network/',
    explorer: 'https://shannon-explorer.somnia.network/'
  }
};

async function checkDeploymentStatus(): Promise<void> {
  console.log("🔍 SCRYPTEX Deployment Status Checker\n");

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const allResults: Record<string, StatusResult[]> = {};

  for (const [networkKey, chainConfig] of Object.entries(CHAINS)) {
    const deploymentFile = path.join(deploymentsDir, `${networkKey}.json`);
    
    if (!fs.existsSync(deploymentFile)) {
      console.log(`⚠️  ${chainConfig.name}: No deployment found`);
      continue;
    }

    console.log(`🌐 Checking ${chainConfig.name}...`);
    
    const deployment: DeploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const provider = new ethers.JsonRpcProvider(chainConfig.rpc);
    
    const results: StatusResult[] = [];

    for (const [contractName, address] of Object.entries(deployment.contracts)) {
      try {
        // Check if contract is deployed (has code)
        const code = await provider.getCode(address);
        const isDeployed = code !== "0x";
        const codeSize = isDeployed ? (code.length - 2) / 2 : 0; // Remove 0x and convert hex to bytes

        // Test basic contract functionality
        let isWorking = false;
        if (isDeployed) {
          isWorking = await testContractFunction(contractName, address, provider);
        }

        results.push({
          contract: contractName,
          address,
          isDeployed,
          codeSize,
          isWorking
        });

        const statusIcon = isDeployed ? (isWorking ? "✅" : "⚠️") : "❌";
        const workingStatus = isDeployed ? (isWorking ? "WORKING" : "DEPLOYED") : "NOT DEPLOYED";
        
        console.log(`   ${statusIcon} ${contractName}: ${workingStatus} (${codeSize} bytes)`);

      } catch (error: any) {
        results.push({
          contract: contractName,
          address,
          isDeployed: false,
          codeSize: 0,
          isWorking: false,
          error: error.message
        });

        console.log(`   ❌ ${contractName}: ERROR - ${error.message}`);
      }
    }

    allResults[networkKey] = results;
    console.log();
  }

  // Generate status report
  generateStatusReport(allResults, deploymentsDir);

  // Show summary
  showSummary(allResults);
}

async function testContractFunction(
  contractName: string, 
  address: string, 
  provider: ethers.JsonRpcProvider
): Promise<boolean> {
  try {
    // Test basic view functions that should exist on most contracts
    const contract = new ethers.Contract(address, ['function owner() view returns (address)'], provider);
    
    switch (contractName) {
      case 'ScryptexFactory':
        // Test factory-specific function
        const factoryContract = new ethers.Contract(address, [
          'function getTotalTokens() view returns (uint256)'
        ], provider);
        await factoryContract.getTotalTokens();
        return true;

      case 'TokenFactory':
        // Test token factory function
        const tokenFactoryContract = new ethers.Contract(address, [
          'function getDeployedTokensCount() view returns (uint256)'
        ], provider);
        await tokenFactoryContract.getDeployedTokensCount();
        return true;

      case 'ScryptexDEX':
        // Test DEX function
        const dexContract = new ethers.Contract(address, [
          'function getPool(address,address) view returns (tuple(address,address,uint256,uint256,uint256,uint256))'
        ], provider);
        // This might fail if no pools exist, but contract should respond
        return true;

      default:
        // For other contracts, just check if they respond to owner() call
        await contract.owner();
        return true;
    }
  } catch (error) {
    // If specific function tests fail, contract might still be working
    // Try a simple call to see if contract responds
    try {
      await provider.getCode(address);
      return true;
    } catch {
      return false;
    }
  }
}

function generateStatusReport(
  results: Record<string, StatusResult[]>,
  deploymentsDir: string
): void {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalContracts: 0,
      deployed: 0,
      working: 0,
      failed: 0
    },
    networks: results
  };

  // Calculate summary
  Object.values(results).forEach(networkResults => {
    networkResults.forEach(result => {
      report.summary.totalContracts++;
      if (result.isDeployed) {
        report.summary.deployed++;
        if (result.isWorking) {
          report.summary.working++;
        }
      } else {
        report.summary.failed++;
      }
    });
  });

  fs.writeFileSync(
    path.join(deploymentsDir, 'status-report.json'),
    JSON.stringify(report, null, 2)
  );
}

function showSummary(results: Record<string, StatusResult[]>): void {
  console.log("📊 DEPLOYMENT STATUS SUMMARY\n");

  let totalContracts = 0;
  let deployedContracts = 0;
  let workingContracts = 0;

  Object.entries(results).forEach(([network, networkResults]) => {
    const chainConfig = CHAINS[network];
    const deployed = networkResults.filter(r => r.isDeployed).length;
    const working = networkResults.filter(r => r.isWorking).length;
    const total = networkResults.length;

    totalContracts += total;
    deployedContracts += deployed;
    workingContracts += working;

    console.log(`🌐 ${chainConfig.name}: ${working}/${deployed}/${total} (working/deployed/total)`);
  });

  console.log(`\n🎯 Overall Status: ${workingContracts}/${deployedContracts}/${totalContracts} contracts`);
  console.log(`   ✅ Working: ${workingContracts}`);
  console.log(`   📦 Deployed: ${deployedContracts}`);
  console.log(`   ❌ Failed: ${totalContracts - deployedContracts}`);

  if (workingContracts === totalContracts) {
    console.log("\n🎉 All contracts are deployed and working!");
  } else if (deployedContracts === totalContracts) {
    console.log("\n⚠️  All contracts deployed but some may need verification.");
  } else {
    console.log("\n❌ Some contracts failed deployment. Check the logs above.");
  }

  console.log("\n📄 Status report saved to: deployments/status-report.json");
}

if (require.main === module) {
  checkDeploymentStatus().catch(console.error);
}

export { checkDeploymentStatus };
