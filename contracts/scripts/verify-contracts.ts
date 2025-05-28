
import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: Record<string, string>;
  transactionHashes: Record<string, string>;
}

interface VerificationResult {
  contract: string;
  address: string;
  status: 'success' | 'failed' | 'already_verified';
  error?: string;
}

async function verifyContracts(): Promise<void> {
  console.log("🔍 SCRYPTEX Contract Verification System\n");

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const deploymentFiles = ['risechain.json', 'abstract.json', 'og.json', 'somnia.json'];
  
  const allResults: Record<string, VerificationResult[]> = {};

  for (const file of deploymentFiles) {
    const filePath = path.join(deploymentsDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} not found - skipping`);
      continue;
    }

    const deployment: DeploymentInfo = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const network = file.replace('.json', '');
    
    console.log(`🌐 Verifying ${deployment.network} contracts...`);
    
    const results: VerificationResult[] = [];

    for (const [contractName, address] of Object.entries(deployment.contracts)) {
      try {
        console.log(`   🔍 Verifying ${contractName} at ${address}...`);
        
        // Get constructor arguments based on contract type
        const constructorArgs = getConstructorArgs(contractName, deployment);
        
        await run("verify:verify", {
          address,
          constructorArguments: constructorArgs,
          network
        });

        results.push({
          contract: contractName,
          address,
          status: 'success'
        });

        console.log(`   ✅ ${contractName} verified successfully`);

      } catch (error: any) {
        let status: VerificationResult['status'] = 'failed';
        
        if (error.message?.includes('already verified') || 
            error.message?.includes('Already Verified')) {
          status = 'already_verified';
          console.log(`   ℹ️  ${contractName} already verified`);
        } else {
          console.error(`   ❌ ${contractName} verification failed:`, error.message);
        }

        results.push({
          contract: contractName,
          address,
          status,
          error: error.message
        });
      }

      // Add delay between verifications to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    allResults[network] = results;
    console.log();
  }

  // Generate verification report
  generateVerificationReport(allResults, deploymentsDir);

  console.log("🎉 Contract Verification Complete!");
  console.log("📄 Verification report saved to: deployments/verification-report.json");
}

function getConstructorArgs(contractName: string, deployment: DeploymentInfo): any[] {
  // Return constructor arguments based on contract type
  switch (contractName) {
    case 'ScryptexFactory':
      // ScryptexFactory constructor args
      return [
        deployment.contracts['deployer'] || '0x0000000000000000000000000000000000000000', // initialOwner
        '10000000000000000', // tokenCreationFee (0.01 ETH)
        250, // platformFeePercentage (2.5%)
        deployment.contracts['deployer'] || '0x0000000000000000000000000000000000000000' // feeRecipient
      ];
    
    default:
      // Most contracts don't have constructor arguments
      return [];
  }
}

function generateVerificationReport(
  results: Record<string, VerificationResult[]>,
  deploymentsDir: string
): void {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalContracts: 0,
      verified: 0,
      alreadyVerified: 0,
      failed: 0
    },
    networks: results
  };

  // Calculate summary
  Object.values(results).forEach(networkResults => {
    networkResults.forEach(result => {
      report.summary.totalContracts++;
      switch (result.status) {
        case 'success':
          report.summary.verified++;
          break;
        case 'already_verified':
          report.summary.alreadyVerified++;
          break;
        case 'failed':
          report.summary.failed++;
          break;
      }
    });
  });

  fs.writeFileSync(
    path.join(deploymentsDir, 'verification-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Print summary
  console.log("📊 VERIFICATION SUMMARY:");
  console.log(`   Total Contracts: ${report.summary.totalContracts}`);
  console.log(`   ✅ Successfully Verified: ${report.summary.verified}`);
  console.log(`   ℹ️  Already Verified: ${report.summary.alreadyVerified}`);
  console.log(`   ❌ Failed: ${report.summary.failed}`);
}

if (require.main === module) {
  verifyContracts().catch(console.error);
}

export { verifyContracts };
