"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowDown, ArrowUpDown, ArrowLeftRight, Clock, DollarSign } from 'lucide-react'

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  logoUrl: string
}

interface ChainConfig {
  chainId: number
  name: string
  symbol: string
  logoUrl: string
  color: string
}

interface BridgeRoute {
  estimatedTime: number
  totalFees: string
  priceImpact: string
  confidence: number
}

const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    chainId: 11155931,
    name: 'RISE Testnet',
    symbol: 'ETH',
    logoUrl: '/icons/chains/rise.svg',
    color: 'from-green-500 to-emerald-500'
  },
  {
    chainId: 11124,
    name: 'Abstract Testnet',
    symbol: 'ETH',
    logoUrl: '/icons/chains/abstract.svg',
    color: 'from-purple-500 to-pink-500'
  },
  {
    chainId: 16601,
    name: '0G Galileo',
    symbol: 'OG',
    logoUrl: '/icons/chains/0g.svg',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    chainId: 50312,
    name: 'Somnia Testnet',
    symbol: 'STT',
    logoUrl: '/icons/chains/somnia.svg',
    color: 'from-orange-500 to-red-500'
  }
]

const MOCK_TOKENS: Record<number, Token[]> = {
  11155931: [
    { address: '0x0', symbol: 'ETH', name: 'Ethereum', decimals: 18, balance: '1.5', logoUrl: '/icons/tokens/eth.svg' },
    { address: '0x1', symbol: 'USDT', name: 'Tether USD', decimals: 6, balance: '1000.0', logoUrl: '/icons/tokens/usdt.svg' }
  ],
  11124: [
    { address: '0x0', symbol: 'ETH', name: 'Ethereum', decimals: 18, balance: '0.8', logoUrl: '/icons/tokens/eth.svg' },
    { address: '0x2', symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '500.0', logoUrl: '/icons/tokens/usdc.svg' }
  ],
  16601: [
    { address: '0x0', symbol: 'OG', name: '0G Token', decimals: 18, balance: '100.0', logoUrl: '/icons/tokens/og.svg' }
  ],
  50312: [
    { address: '0x0', symbol: 'STT', name: 'Somnia Test Token', decimals: 18, balance: '50.0', logoUrl: '/icons/tokens/stt.svg' }
  ]
}

export function CrossChainSwap() {
  const [sourceChain, setSourceChain] = useState<number>(11155931)
  const [targetChain, setTargetChain] = useState<number>(11124)
  const [sourceToken, setSourceToken] = useState<Token | null>(null)
  const [targetToken, setTargetToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [bridgeRoute, setBridgeRoute] = useState<BridgeRoute | null>(null)

  useEffect(() => {
    // Auto-select first token when chain changes
    const tokens = MOCK_TOKENS[sourceChain]
    if (tokens && tokens.length > 0) {
      setSourceToken(tokens[0])
    }
  }, [sourceChain])

  useEffect(() => {
    // Auto-select corresponding token on target chain
    const tokens = MOCK_TOKENS[targetChain]
    if (tokens && tokens.length > 0) {
      setTargetToken(tokens[0])
    }
  }, [targetChain])

  useEffect(() => {
    // Calculate bridge route when parameters change
    if (sourceChain && targetChain && amount && parseFloat(amount) > 0) {
      const route: BridgeRoute = {
        estimatedTime: 300, // 5 minutes
        totalFees: '0.001',
        priceImpact: '0.1',
        confidence: 95
      }
      setBridgeRoute(route)
    } else {
      setBridgeRoute(null)
    }
  }, [sourceChain, targetChain, amount])

  const handleSwapChains = () => {
    const temp = sourceChain
    setSourceChain(targetChain)
    setTargetChain(temp)
  }

  const handleBridge = async () => {
    if (!sourceToken || !targetToken || !amount) return

    setIsLoading(true)
    try {
      // Bridge transaction logic will be implemented here
      console.log('Initiating bridge:', {
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        amount
      })
      
      // Simulate bridge transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset form after successful bridge
      setAmount('')
    } catch (error) {
      console.error('Bridge failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sourceChainConfig = SUPPORTED_CHAINS.find(c => c.chainId === sourceChain)
  const targetChainConfig = SUPPORTED_CHAINS.find(c => c.chainId === targetChain)
  const sourceTokens = MOCK_TOKENS[sourceChain] || []
  const targetTokens = MOCK_TOKENS[targetChain] || []

  return (
    <Card className="w-full max-w-lg mx-auto cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Cross-Chain Bridge
        </CardTitle>
        <CardDescription>
          Bridge assets seamlessly across testnets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Chain */}
        <div className="space-y-3">
          <label className="text-sm font-medium">From</label>
          <div className="flex gap-3">
            <Select value={sourceChain.toString()} onValueChange={(value) => setSourceChain(parseInt(value))}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.filter(chain => chain.chainId !== targetChain).map((chain) => (
                  <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${chain.color}`} />
                      {chain.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={sourceToken?.address || ''} 
              onValueChange={(value) => {
                const token = sourceTokens.find(t => t.address === value)
                setSourceToken(token || null)
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {sourceTokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    <div className="flex items-center justify-between w-full">
                      <span>{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">{token.balance}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
            />
            {sourceToken && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                Balance: {sourceToken.balance}
              </div>
            )}
          </div>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapChains}
            className="rounded-full p-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Target Chain */}
        <div className="space-y-3">
          <label className="text-sm font-medium">To</label>
          <div className="flex gap-3">
            <Select value={targetChain.toString()} onValueChange={(value) => setTargetChain(parseInt(value))}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.filter(chain => chain.chainId !== sourceChain).map((chain) => (
                  <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${chain.color}`} />
                      {chain.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={targetToken?.address || ''} 
              onValueChange={(value) => {
                const token = targetTokens.find(t => t.address === value)
                setTargetToken(token || null)
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {targetTokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-3 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">You will receive</div>
            <div className="text-lg font-semibold">
              {amount && parseFloat(amount) > 0 ? `≈ ${amount}` : '0.0'} {targetToken?.symbol || '---'}
            </div>
          </div>
        </div>

        {/* Bridge Route Info */}
        {bridgeRoute && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium">Route Information</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="text-sm font-medium">~{Math.floor(bridgeRoute.estimatedTime / 60)}m</div>
                </div>
                <div className="space-y-1">
                  <DollarSign className="h-4 w-4 mx-auto text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">Fees</div>
                  <div className="text-sm font-medium">{bridgeRoute.totalFees} ETH</div>
                </div>
                <div className="space-y-1">
                  <div className="w-4 h-4 mx-auto bg-green-500 rounded-full" />
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                  <div className="text-sm font-medium">{bridgeRoute.confidence}%</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bridge Button */}
        <Button
          onClick={handleBridge}
          disabled={!sourceToken || !targetToken || !amount || parseFloat(amount) <= 0 || isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          size="lg"
        >
          {isLoading ? 'Bridging...' : 'Bridge Assets'}
        </Button>
      </CardContent>
    </Card>
  )
}
