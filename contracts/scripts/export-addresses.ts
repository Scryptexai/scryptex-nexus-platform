
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: Record<string, string>;
  timestamp: string;
  deployer: string;
}

interface ConsolidatedAddresses {
  timestamp: string;
  chains: Record<string, {
    chainId: number;
    network: string;
    contracts: Record<string, string>;
  }>;
}

async function exportAddresses(): Promise<void> {
  console.log("📦 SCRYPTEX Address Export System\n");

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    console.error("❌ Deployments directory not found. Deploy contracts first.");
    return;
  }

  const deploymentFiles = ['risechain.json', 'abstract.json', 'og.json', 'somnia.json'];
  const consolidatedAddresses: ConsolidatedAddresses = {
    timestamp: new Date().toISOString(),
    chains: {}
  };

  console.log("🔍 Consolidating deployment addresses...");

  // Read deployment files
  for (const file of deploymentFiles) {
    const filePath = path.join(deploymentsDir, file);
    if (fs.existsSync(filePath)) {
      const deployment: DeploymentInfo = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const chainName = file.replace('.json', '').toUpperCase();
      
      consolidatedAddresses.chains[chainName] = {
        chainId: deployment.chainId,
        network: deployment.network,
        contracts: deployment.contracts
      };

      console.log(`✅ Loaded ${chainName}: ${Object.keys(deployment.contracts).length} contracts`);
    } else {
      console.log(`⚠️  ${file} not found - skipping`);
    }
  }

  // Save consolidated addresses
  fs.writeFileSync(
    path.join(deploymentsDir, 'addresses.json'),
    JSON.stringify(consolidatedAddresses, null, 2)
  );

  // Generate TypeScript exports
  generateTypeScriptExports(consolidatedAddresses, deploymentsDir);
  
  // Generate backend environment file
  generateBackendEnv(consolidatedAddresses, deploymentsDir);
  
  // Generate frontend config
  generateFrontendConfig(consolidatedAddresses, deploymentsDir);
  
  // Generate documentation
  generateDocumentation(consolidatedAddresses, deploymentsDir);

  console.log("\n🎉 Address Export Complete!");
  console.log("📁 Generated files:");
  console.log("   📄 addresses.json - Consolidated addresses");
  console.log("   📄 addresses.ts - TypeScript exports");
  console.log("   📄 .env.contracts - Backend environment");
  console.log("   📄 contract-config.ts - Frontend configuration");
  console.log("   📄 ADDRESS_GUIDE.md - Documentation");
}

function generateTypeScriptExports(addresses: ConsolidatedAddresses, deploymentsDir: string): void {
  let tsContent = [
    "// 🚀 SCRYPTEX Contract Addresses",
    "// Generated automatically - DO NOT EDIT MANUALLY",
    `// Generated: ${addresses.timestamp}`,
    "",
    "export const DEPLOYED_CONTRACTS = {"
  ];

  for (const [chainName, chainData] of Object.entries(addresses.chains)) {
    tsContent.push(`  ${chainName}: {`);
    tsContent.push(`    CHAIN_ID: ${chainData.chainId},`);
    
    for (const [contractName, address] of Object.entries(chainData.contracts)) {
      const constName = contractName.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '');
      tsContent.push(`    ${constName}: "${address}" as const,`);
    }
    
    tsContent.push("  },");
  }

  tsContent.push("} as const;");
  tsContent.push("");
  tsContent.push("export type ChainName = keyof typeof DEPLOYED_CONTRACTS;");
  tsContent.push("export type ContractName<T extends ChainName> = keyof typeof DEPLOYED_CONTRACTS[T];");
  tsContent.push("");
  tsContent.push("// Chain ID mapping");
  tsContent.push("export const CHAIN_IDS = {");
  
  for (const [chainName, chainData] of Object.entries(addresses.chains)) {
    tsContent.push(`  ${chainName}: ${chainData.chainId},`);
  }
  
  tsContent.push("} as const;");

  fs.writeFileSync(
    path.join(deploymentsDir, 'addresses.ts'),
    tsContent.join('\n')
  );
}

function generateBackendEnv(addresses: ConsolidatedAddresses, deploymentsDir: string): void {
  const envContent = [
    "# 🚀 SCRYPTEX Contract Addresses for Backend",
    "# Generated automatically - DO NOT EDIT MANUALLY",
    `# Generated: ${addresses.timestamp}`,
    ""
  ];

  for (const [chainName, chainData] of Object.entries(addresses.chains)) {
    envContent.push(`# ${chainData.network} (Chain ID: ${chainData.chainId})`);
    
    for (const [contractName, address] of Object.entries(chainData.contracts)) {
      const envVar = `${chainName}_${contractName.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')}_ADDRESS`;
      envContent.push(`${envVar}=${address}`);
    }
    
    envContent.push("");
  }

  fs.writeFileSync(
    path.join(deploymentsDir, '.env.contracts'),
    envContent.join('\n')
  );
}

function generateFrontendConfig(addresses: ConsolidatedAddresses, deploymentsDir: string): void {
  const configContent = [
    "// 🚀 SCRYPTEX Frontend Contract Configuration",
    "// Generated automatically - DO NOT EDIT MANUALLY",
    `// Generated: ${addresses.timestamp}`,
    "",
    "import { DEPLOYED_CONTRACTS } from './addresses';",
    "",
    "export const CONTRACT_CONFIG = {",
    "  // Network configurations",
    "  networks: {"
  ];

  for (const [chainName, chainData] of Object.entries(addresses.chains)) {
    configContent.push(`    ${chainName.toLowerCase()}: {`);
    configContent.push(`      name: "${chainData.network}",`);
    configContent.push(`      chainId: ${chainData.chainId},`);
    configContent.push(`      contracts: DEPLOYED_CONTRACTS.${chainName},`);
    configContent.push("    },");
  }

  configContent.push("  },");
  configContent.push("");
  configContent.push("  // Quick access functions");
  configContent.push("  getContractAddress: (chain: keyof typeof DEPLOYED_CONTRACTS, contract: string) => {");
  configContent.push("    return DEPLOYED_CONTRACTS[chain][contract as keyof typeof DEPLOYED_CONTRACTS[typeof chain]];");
  configContent.push("  },");
  configContent.push("");
  configContent.push("  isContractDeployed: (chain: keyof typeof DEPLOYED_CONTRACTS, contract: string) => {");
  configContent.push("    return Boolean(DEPLOYED_CONTRACTS[chain]?.[contract as keyof typeof DEPLOYED_CONTRACTS[typeof chain]]);");
  configContent.push("  }");
  configContent.push("};");

  fs.writeFileSync(
    path.join(deploymentsDir, 'contract-config.ts'),
    configContent.join('\n')
  );
}

function generateDocumentation(addresses: ConsolidatedAddresses, deploymentsDir: string): void {
  const docContent = [
    "# 📋 SCRYPTEX Contract Address Guide",
    "",
    `**Generated:** ${new Date(addresses.timestamp).toLocaleString()}`,
    "",
    "## 🌐 Deployed Networks",
    ""
  ];

  for (const [chainName, chainData] of Object.entries(addresses.chains)) {
    docContent.push(`### ${chainData.network}`);
    docContent.push(`- **Chain ID:** ${chainData.chainId}`);
    docContent.push(`- **Internal Name:** ${chainName}`);
    docContent.push("");
    docContent.push("#### Deployed Contracts");
    docContent.push("");

    for (const [contractName, address] of Object.entries(chainData.contracts)) {
      docContent.push(`- **${contractName}:** \`${address}\``);
    }

    docContent.push("");
    docContent.push("---");
    docContent.push("");
  }

  docContent.push("## 📚 Usage Examples");
  docContent.push("");
  docContent.push("### TypeScript Import");
  docContent.push("```typescript");
  docContent.push("import { DEPLOYED_CONTRACTS } from './addresses';");
  docContent.push("");
  docContent.push("// Get contract address");
  docContent.push("const factoryAddress = DEPLOYED_CONTRACTS.RISECHAIN.SCRYPTEX_FACTORY;");
  docContent.push("const dexAddress = DEPLOYED_CONTRACTS.RISECHAIN.SCRYPTEX_DEX;");
  docContent.push("```");
  docContent.push("");
  docContent.push("### Environment Variables");
  docContent.push("```bash");
  docContent.push("# Load from .env.contracts");
  docContent.push("source ./deployments/.env.contracts");
  docContent.push("");
  docContent.push("# Use in scripts");
  docContent.push("echo $RISECHAIN_SCRYPTEX_FACTORY_ADDRESS");
  docContent.push("```");
  docContent.push("");
  docContent.push("## 🔧 Integration");
  docContent.push("");
  docContent.push("### Backend Integration");
  docContent.push("1. Copy `.env.contracts` to your backend project");
  docContent.push("2. Load environment variables in your application");
  docContent.push("3. Use the address constants in your smart contract interactions");
  docContent.push("");
  docContent.push("### Frontend Integration");
  docContent.push("1. Import `addresses.ts` or `contract-config.ts`");
  docContent.push("2. Use the typed contract addresses in your dApp");
  docContent.push("3. Access contracts using the chain-specific configurations");

  fs.writeFileSync(
    path.join(deploymentsDir, 'ADDRESS_GUIDE.md'),
    docContent.join('\n')
  );
}

if (require.main === module) {
  exportAddresses().catch(console.error);
}

export { exportAddresses };
