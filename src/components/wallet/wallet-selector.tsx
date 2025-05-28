
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, Download } from 'lucide-react'

// Add wallet type declarations
declare global {
  interface Window {
    ethereum?: any
    okxwallet?: any
  }
}

const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Most popular Web3 wallet with full testnet support',
    icon: '🦊',
    status: 'recommended',
    installUrl: 'https://metamask.io/download/',
    deepLink: 'https://metamask.app.link/dapp/',
    available: typeof window !== 'undefined' && !!window.ethereum
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect any mobile wallet via QR code',
    icon: '🔗',
    status: 'mobile',
    available: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Easy-to-use wallet from Coinbase',
    icon: '🔵',
    status: 'popular',
    installUrl: 'https://www.coinbase.com/wallet',
    available: typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    description: 'Multi-chain wallet with DeFi features',
    icon: '⭕',
    status: 'available',
    installUrl: 'https://www.okx.com/web3',
    available: typeof window !== 'undefined' && !!window.okxwallet
  }
]

const SUPPORTED_CHAINS = [
  {
    id: '11155931',
    name: 'RISE Testnet',
    chainId: 11155931,
    currency: 'ETH',
    description: 'Primary chain for trading and token operations',
    color: 'from-green-500 to-emerald-500',
    rpcUrl: 'https://testnet.riselabs.xyz',
    explorerUrl: 'https://explorer.testnet.riselabs.xyz'
  },
  {
    id: '11124',
    name: 'Abstract Testnet',
    chainId: 11124,
    currency: 'ETH',
    description: 'Social features and governance operations',
    color: 'from-purple-500 to-pink-500',
    rpcUrl: 'https://api.testnet.abs.xyz',
    explorerUrl: 'https://sepolia.abscan.org/'
  },
  {
    id: '16601',
    name: '0G Galileo',
    chainId: 16601,
    currency: 'OG',
    description: 'Analytics and data storage operations',
    color: 'from-blue-500 to-cyan-500',
    rpcUrl: 'https://evmrpc-testnet.0g.ai/',
    explorerUrl: 'https://chainscan-galileo.0g.ai/'
  },
  {
    id: '50312',
    name: 'Somnia Testnet',
    chainId: 50312,
    currency: 'STT',
    description: 'Gaming quests and achievement operations',
    color: 'from-orange-500 to-red-500',
    rpcUrl: 'https://vsf-rpc.somnia.network/',
    explorerUrl: 'https://shannon-explorer.somnia.network/'
  }
]

interface WalletSelectorProps {
  onConnect: (wallet: string, chain: string) => void
  isConnecting?: boolean
}

export function WalletSelector({ onConnect, isConnecting = false }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState('metamask') // Default to MetaMask
  const [selectedChain, setSelectedChain] = useState('11155931') // Default to RISE
  const [hasMetaMask, setHasMetaMask] = useState(false)

  useEffect(() => {
    // Check if MetaMask is installed
    setHasMetaMask(typeof window !== 'undefined' && !!window.ethereum)
  }, [])

  const handleConnect = () => {
    if (selectedWallet && selectedChain) {
      onConnect(selectedWallet, selectedChain)
    }
  }

  const handleInstallWallet = (installUrl: string) => {
    window.open(installUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* MetaMask Priority Alert */}
      {!hasMetaMask && (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>MetaMask not detected. Install for the best experience.</span>
            <Button variant="outline" size="sm" onClick={() => handleInstallWallet('https://metamask.io/download/')}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Install
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet">Choose Wallet</TabsTrigger>
          <TabsTrigger value="chain">Select Chain</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Select your preferred wallet. MetaMask is recommended for the best experience.
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {SUPPORTED_WALLETS.map((wallet) => (
              <Card 
                key={wallet.id} 
                className={`hover:bg-secondary/50 cursor-pointer transition-colors relative ${
                  selectedWallet === wallet.id ? 'ring-2 ring-primary' : ''
                } ${!wallet.available ? 'opacity-60' : ''}`}
                onClick={() => wallet.available && setSelectedWallet(wallet.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{wallet.icon}</span>
                      <CardTitle className="text-base">{wallet.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {wallet.status === 'recommended' && (
                        <Badge variant="default" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                      {wallet.status === 'popular' && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                      {wallet.status === 'mobile' && (
                        <Badge variant="outline" className="text-xs">
                          Mobile
                        </Badge>
                      )}
                      {!wallet.available && wallet.installUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInstallWallet(wallet.installUrl!)
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {wallet.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="chain" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Choose your starting chain. You can bridge to other chains later.
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {SUPPORTED_CHAINS.map((chain) => (
              <Card 
                key={chain.id} 
                className={`hover:bg-secondary/50 cursor-pointer transition-colors ${
                  selectedChain === chain.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedChain(chain.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${chain.color}`} />
                      <CardTitle className="text-base">{chain.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {chain.currency}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {chain.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-xs text-muted-foreground">
          {selectedWallet && selectedChain ? (
            `Ready to connect ${SUPPORTED_WALLETS.find(w => w.id === selectedWallet)?.name} to ${SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}`
          ) : (
            'Select both wallet and chain to continue'
          )}
        </div>
        <Button 
          onClick={handleConnect}
          disabled={!selectedWallet || !selectedChain || isConnecting}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    </div>
  )
}
