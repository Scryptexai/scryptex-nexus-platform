
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChainSelector } from './chain-selector'
import { WalletSelector } from './wallet-selector'
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
  const [selectedWallet, setSelectedWallet] = useState('')
  const [address, setAddress] = useState('')

  const handleConnect = (wallet: string, chain: string) => {
    setSelectedWallet(wallet)
    setSelectedChain(chain)
    setIsConnected(true)
    // Simulate wallet connection
    setAddress('0x1234...5678')
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAddress('')
    setSelectedWallet('')
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium">{address}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {selectedWallet} • {selectedChain}
          </div>
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
            Select your preferred wallet and chain to start farming across the ecosystem.
          </DialogDescription>
        </DialogHeader>
        <WalletSelector onConnect={handleConnect} />
      </DialogContent>
    </Dialog>
  )
}
