
import { ethers } from 'ethers';
import { config } from '@/config/environment';

export function validateAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

export function validateChainId(chainId: number): boolean {
  const supportedChains = Object.values(config.blockchain).map(chain => chain.chainId);
  return supportedChains.includes(chainId);
}

export function validatePrivateKey(privateKey: string): boolean {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

export function validateAmount(amount: string): boolean {
  try {
    const amountBN = ethers.parseEther(amount);
    return amountBN > 0;
  } catch {
    return false;
  }
}

export function validateSlippage(slippage: number): boolean {
  return slippage >= 0 && slippage <= 100;
}

export function validateTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  // Username should be 3-30 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validatePagination(page?: string, limit?: string): { page: number; limit: number } {
  const defaultPage = 1;
  const defaultLimit = 20;
  const maxLimit = 100;

  let validPage = defaultPage;
  let validLimit = defaultLimit;

  if (page) {
    const parsedPage = parseInt(page);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      validPage = parsedPage;
    }
  }

  if (limit) {
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= maxLimit) {
      validLimit = parsedLimit;
    }
  }

  return { page: validPage, limit: validLimit };
}
