
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { WalletSelector } from './wallet-selector'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, ChevronDown, LogOut, Network } from 'lucide-react'

interface ConnectedWallet {
  address: string
  chainId: number
  walletType: string
  balance: string
}

const CHAIN_NAMES: Record<number, string> = {
  11155931: 'RISE Testnet',
  11124: 'Abstract Testnet', 
  16601: '0G Galileo',
  50312: 'Somnia Testnet'
}

export function WalletConnector() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Auto-connect to MetaMask if available and previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' })
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            })
            
            setConnectedWallet({
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              walletType: 'MetaMask',
              balance: (parseInt(balance, 16) / 1e18).toFixed(4)
            })
            setIsConnected(true)
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error)
        }
      }
    }

    checkConnection()
  }, [])

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          handleDisconnect()
        } else if (connectedWallet) {
          setConnectedWallet(prev => prev ? { ...prev, address: accounts[0] } : null)
        }
      }

      const handleChainChanged = (chainId: string) => {
        if (connectedWallet) {
          setConnectedWallet(prev => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null)
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [connectedWallet])

  const handleConnect = async (wallet: string, chain: string) => {
    setIsConnecting(true)
    try {
      let accounts: string[] = []
      let chainId: number = 11155931 // Default to RISE

      if (wallet === 'metamask' && window.ethereum) {
        // Connect to MetaMask
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
        chainId = parseInt(currentChainId, 16)

        // Switch to selected chain if different
        const targetChainId = parseInt(chain)
        if (chainId !== targetChainId) {
          await switchNetwork(targetChainId)
          chainId = targetChainId
        }

        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        })

        setConnectedWallet({
          address: accounts[0],
          chainId: chainId,
          walletType: 'MetaMask',
          balance: (parseInt(balance, 16) / 1e18).toFixed(4)
        })
      } else {
        // For other wallets, simulate connection
        setConnectedWallet({
          address: '0x1234...5678',
          chainId: parseInt(chain),
          walletType: wallet,
          balance: '1.0000'
        })
      }

      setIsConnected(true)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) return

    const chainConfigs: Record<number, any> = {
      11155931: {
        chainId: '0xaa36a7',
        chainName: 'RISE Testnet',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://testnet.riselabs.xyz'],
        blockExplorerUrls: ['https://explorer.testnet.riselabs.xyz']
      },
      11124: {
        chainId: '0x2b6c',
        chainName: 'Abstract Testnet',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://api.testnet.abs.xyz'],
        blockExplorerUrls: ['https://sepolia.abscan.org/']
      },
      16601: {
        chainId: '0x40d9',
        chainName: '0G Galileo',
        nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
        rpcUrls: ['https://evmrpc-testnet.0g.ai/'],
        blockExplorerUrls: ['https://chainscan-galileo.0g.ai/']
      },
      50312: {
        chainId: '0xc458',
        chainName: 'Somnia Testnet',
        nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
        rpcUrls: ['https://vsf-rpc.somnia.network/'],
        blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
      }
    }

    const chainConfig = chainConfigs[chainId]
    if (!chainConfig) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.chainId }]
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainConfig]
        })
      }
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setConnectedWallet(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected && connectedWallet) {
    const chainName = CHAIN_NAMES[connectedWallet.chainId] || 'Unknown Chain'
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 bg-secondary/20">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{chainName}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {connectedWallet.balance} {connectedWallet.chainId === 16601 ? 'OG' : connectedWallet.chainId === 50312 ? 'STT' : 'ETH'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 bg-secondary/20">
          <Wallet className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{formatAddress(connectedWallet.address)}</span>
            <span className="text-xs text-muted-foreground">{connectedWallet.walletType}</span>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="cyber-border hover:cyber-glow transition-all duration-300">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect MetaMask or other supported wallets to start bridging across chains.
          </DialogDescription>
        </DialogHeader>
        <WalletSelector onConnect={handleConnect} isConnecting={isConnecting} />
      </DialogContent>
    </Dialog>
  )
}

// Extend window object for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
