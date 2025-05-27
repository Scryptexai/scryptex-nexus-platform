
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChainSelector } from './chain-selector'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Wallet, ChevronDown } from 'lucide-react'

export function WalletConnector() {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedChain, setSelectedChain] = useState('risechain')
  const [address, setAddress] = useState('')

  const handleConnect = (chain: string) => {
    setSelectedChain(chain)
    setIsConnected(true)
    // Simulate wallet connection
    setAddress('0x1234...5678')
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAddress('')
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium">{address}</div>
          <div className="text-xs text-muted-foreground capitalize">{selectedChain}</div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog>
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
            Select a chain to connect your wallet. The platform will handle cross-chain operations automatically.
          </DialogDescription>
        </DialogHeader>
        <ChainSelector onSelect={handleConnect} />
      </DialogContent>
    </Dialog>
  )
}
