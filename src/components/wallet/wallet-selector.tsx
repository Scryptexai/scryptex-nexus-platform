
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Most popular Web3 wallet',
    icon: '🦊',
    status: 'recommended'
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    description: 'Multi-chain wallet with DeFi features',
    icon: '⭕',
    status: 'popular'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Easy-to-use wallet from Coinbase',
    icon: '🔵',
    status: 'available'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect any mobile wallet',
    icon: '🔗',
    status: 'available'
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    description: 'Secure mobile wallet',
    icon: '🛡️',
    status: 'available'
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    description: 'Multi-chain wallet for DeFi',
    icon: '🐰',
    status: 'available'
  }
]

const SUPPORTED_CHAINS = [
  {
    id: 'risechain',
    name: 'RISE Testnet',
    chainId: 11155931,
    currency: 'ETH',
    description: 'Primary chain for trading and token operations',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'abstract',
    name: 'Abstract Testnet',
    chainId: 11124,
    currency: 'ETH',
    description: 'Social features and governance operations',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '0g-galileo',
    name: '0G Galileo',
    chainId: 16601,
    currency: 'OG',
    description: 'Analytics and data storage operations',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'somnia',
    name: 'Somnia Testnet',
    chainId: 50312,
    currency: 'STT',
    description: 'Gaming quests and achievement operations',
    color: 'from-orange-500 to-red-500'
  }
]

interface WalletSelectorProps {
  onConnect: (wallet: string, chain: string) => void
}

export function WalletSelector({ onConnect }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState('')
  const [selectedChain, setSelectedChain] = useState('')

  const handleConnect = () => {
    if (selectedWallet && selectedChain) {
      onConnect(selectedWallet, selectedChain)
    }
  }

  return (
    <Tabs defaultValue="wallet" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="wallet">Choose Wallet</TabsTrigger>
        <TabsTrigger value="chain">Select Chain</TabsTrigger>
      </TabsList>
      
      <TabsContent value="wallet" className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Select your preferred wallet to connect to SCRYPTEX.
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {SUPPORTED_WALLETS.map((wallet) => (
            <Card 
              key={wallet.id} 
              className={`hover:bg-secondary/50 cursor-pointer transition-colors ${
                selectedWallet === wallet.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedWallet(wallet.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{wallet.icon}</span>
                    <CardTitle className="text-base">{wallet.name}</CardTitle>
                  </div>
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
          Choose the chain you want to connect to. Cross-chain operations will be handled automatically.
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
                  <CardTitle className="text-base">{chain.name}</CardTitle>
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
          disabled={!selectedWallet || !selectedChain}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          Connect Wallet
        </Button>
      </div>
    </Tabs>
  )
}
