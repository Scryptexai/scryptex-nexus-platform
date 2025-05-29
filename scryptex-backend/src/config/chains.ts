
import { ChainConfig } from '@/types/chain.types';
import { config } from './environment';

export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  sepolia: {
    ...config.chains.sepolia,
  },
  risechain: {
    ...config.chains.risechain,
  },
  abstract: {
    ...config.chains.abstract,
  },
  zerog: {
    ...config.chains.zerog,
  },
  somnia: {
    ...config.chains.somnia,
  },
};

export const getSupportedChains = (): ChainConfig[] => {
  return Object.values(CHAIN_CONFIGS);
};

export const getChainConfig = (chainId: number): ChainConfig | null => {
  return Object.values(CHAIN_CONFIGS).find(chain => chain.chainId === chainId) || null;
};

export const getChainByName = (name: string): ChainConfig | null => {
  return CHAIN_CONFIGS[name.toLowerCase()] || null;
};

export const isChainSupported = (chainId: number): boolean => {
  return Object.values(CHAIN_CONFIGS).some(chain => chain.chainId === chainId);
};

export const getMainTestChain = (): ChainConfig => {
  return CHAIN_CONFIGS.sepolia; // Sepolia as main test chain
};

export const BRIDGE_PAIRS = [
  { from: 11155111, to: 11155931 }, // Sepolia to RiseChain
  { from: 11155111, to: 11124 },   // Sepolia to Abstract
  { from: 11155111, to: 16601 },   // Sepolia to 0G
  { from: 11155111, to: 50312 },   // Sepolia to Somnia
  { from: 11155931, to: 11155111 }, // RiseChain to Sepolia
  { from: 11124, to: 11155111 },   // Abstract to Sepolia
  { from: 16601, to: 11155111 },   // 0G to Sepolia
  { from: 50312, to: 11155111 },   // Somnia to Sepolia
];

export const isBridgePairSupported = (fromChain: number, toChain: number): boolean => {
  return BRIDGE_PAIRS.some(pair => pair.from === fromChain && pair.to === toChain);
};
