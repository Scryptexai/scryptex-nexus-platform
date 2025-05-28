
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    risechain: {
      url: "https://testnet.riselabs.xyz",
      chainId: 11155931,
      accounts: process.env.RISECHAIN_DEPLOYER_PRIVATE_KEY ? [process.env.RISECHAIN_DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      timeout: 60000,
    },
    abstract: {
      url: "https://api.testnet.abs.xyz",
      chainId: 11124,
      accounts: process.env.ABSTRACT_DEPLOYER_PRIVATE_KEY ? [process.env.ABSTRACT_DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      timeout: 60000,
    },
    og: {
      url: "https://evmrpc-testnet.0g.ai/",
      chainId: 16601,
      accounts: process.env.OG_DEPLOYER_PRIVATE_KEY ? [process.env.OG_DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      timeout: 60000,
    },
    somnia: {
      url: "https://vsf-rpc.somnia.network/",
      chainId: 50312,
      accounts: process.env.SOMNIA_DEPLOYER_PRIVATE_KEY ? [process.env.SOMNIA_DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      timeout: 60000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      risechain: process.env.RISECHAIN_API_KEY || "",
      abstract: process.env.ABSTRACT_API_KEY || "",
      og: process.env.OG_API_KEY || "",
      somnia: process.env.SOMNIA_API_KEY || "",
    },
    customChains: [
      {
        network: "risechain",
        chainId: 11155931,
        urls: {
          apiURL: "https://explorer.testnet.riselabs.xyz/api",
          browserURL: "https://explorer.testnet.riselabs.xyz"
        }
      },
      {
        network: "abstract",
        chainId: 11124,
        urls: {
          apiURL: "https://api.testnet.abs.xyz/api",
          browserURL: "https://sepolia.abscan.org"
        }
      },
      {
        network: "og",
        chainId: 16601,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/api",
          browserURL: "https://chainscan-galileo.0g.ai"
        }
      },
      {
        network: "somnia",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network"
        }
      }
    ]
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
