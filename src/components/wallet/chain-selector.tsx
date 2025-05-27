
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SUPPORTED_CHAINS = [
  {
    id: 'risechain',
    name: 'RISE Testnet',
    chainId: 11155931,
    currency: 'ETH',
    rpcUrl: 'https://testnet-rpc.risechain.org',
    description: 'Primary chain for trading and token operations',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'abstract',
    name: 'Abstract Testnet',
    chainId: 11124,
    currency: 'ETH',
    rpcUrl: 'https://api.testnet.abs.xyz',
    description: 'Social features and governance operations',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '0g-galileo',
    name: '0G Galileo',
    chainId: 16601,
    currency: 'OG',
    rpcUrl: 'https://evmrpc-testnet.0g.ai',
    description: 'Analytics and data storage operations',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'somnia',
    name: 'Somnia Testnet',
    chainId: 50312,
    currency: 'STT',
    rpcUrl: 'https://dreamnet.somnia.network',
    description: 'Gaming quests and achievement operations',
    color: 'from-orange-500 to-red-500'
  }
]

interface ChainSelectorProps {
  onSelect: (chainId: string) => void
}

export function ChainSelector({ onSelect }: ChainSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Choose your preferred chain for wallet connection. Cross-chain operations will be handled automatically.
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {SUPPORTED_CHAINS.map((chain) => (
          <Card key={chain.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
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
            <CardContent className="pt-0">
              <Button
                onClick={() => onSelect(chain.id)}
                className="w-full bg-gradient-to-r ${chain.color} hover:opacity-90 transition-opacity"
                size="sm"
              >
                Connect to {chain.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        MetaMask, WalletConnect, and other Web3 wallets supported
      </div>
    </div>
  )
}
