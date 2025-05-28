"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpDown, TrendingUp, DollarSign, ArrowLeftRight } from 'lucide-react'

interface TokenBalance {
  address: string
  symbol: string
  name: string
  balance: string
  value: string
  price: string
  change24h: string
}

interface ChainPortfolio {
  chainId: number
  name: string
  color: string
  totalValue: string
  tokens: TokenBalance[]
  pendingBridges: number
}

const MOCK_PORTFOLIO: ChainPortfolio[] = [
  {
    chainId: 11155931,
    name: 'RISE Testnet',
    color: 'from-green-500 to-emerald-500',
    totalValue: '2,150.50',
    tokens: [
      {
        address: '0x0',
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '1.5',
        value: '2,100.00',
        price: '1,400.00',
        change24h: '+2.5'
      },
      {
        address: '0x1',
        symbol: 'USDT',
        name: 'Tether USD',
        balance: '50.50',
        value: '50.50',
        price: '1.00',
        change24h: '0.0'
      }
    ],
    pendingBridges: 1
  },
  {
    chainId: 11124,
    name: 'Abstract Testnet',
    color: 'from-purple-500 to-pink-500',
    totalValue: '1,200.00',
    tokens: [
      {
        address: '0x0',
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '0.8',
        value: '1,120.00',
        price: '1,400.00',
        change24h: '+2.5'
      },
      {
        address: '0x2',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '80.00',
        value: '80.00',
        price: '1.00',
        change24h: '+0.1'
      }
    ],
    pendingBridges: 0
  },
  {
    chainId: 16601,
    name: '0G Galileo',
    color: 'from-blue-500 to-cyan-500',
    totalValue: '150.00',
    tokens: [
      {
        address: '0x0',
        symbol: 'OG',
        name: '0G Token',
        balance: '100.0',
        value: '150.00',
        price: '1.50',
        change24h: '+5.2'
      }
    ],
    pendingBridges: 0
  },
  {
    chainId: 50312,
    name: 'Somnia Testnet',
    color: 'from-orange-500 to-red-500',
    totalValue: '25.00',
    tokens: [
      {
        address: '0x0',
        symbol: 'STT',
        name: 'Somnia Test Token',
        balance: '50.0',
        value: '25.00',
        price: '0.50',
        change24h: '-1.2'
      }
    ],
    pendingBridges: 0
  }
]

export function MultiChainPortfolio() {
  const [selectedChain, setSelectedChain] = useState<number | null>(null)

  const totalPortfolioValue = MOCK_PORTFOLIO.reduce((sum, chain) => sum + parseFloat(chain.totalValue.replace(',', '')), 0)
  const totalChange24h = 2.8 // Mock 24h change

  const formatValue = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(value.replace(',', '')))
  }

  const formatChange = (change: string) => {
    const num = parseFloat(change)
    return {
      value: Math.abs(num),
      isPositive: num >= 0,
      formatted: `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
    }
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="cyber-text">Multi-Chain Portfolio</CardTitle>
          <CardDescription>Your assets across all supported chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
              <div className="text-3xl font-bold">{formatValue(totalPortfolioValue.toString())}</div>
              <div className={`text-sm flex items-center gap-1 ${totalChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className="h-3 w-3" />
                {formatChange(totalChange24h.toString()).formatted} (24h)
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Active Chains</div>
              <div className="text-2xl font-bold">{MOCK_PORTFOLIO.length}</div>
              <div className="text-sm text-muted-foreground">Connected networks</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Pending Bridges</div>
              <div className="text-2xl font-bold">
                {MOCK_PORTFOLIO.reduce((sum, chain) => sum + chain.pendingBridges, 0)}
              </div>
              <div className="text-sm text-muted-foreground">In progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Breakdown */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="cyber-text">Chain Distribution</CardTitle>
          <CardDescription>Asset allocation across different chains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MOCK_PORTFOLIO.map((chain) => {
            const percentage = (parseFloat(chain.totalValue.replace(',', '')) / totalPortfolioValue) * 100
            
            return (
              <div key={chain.chainId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${chain.color}`} />
                    <div>
                      <div className="font-medium">{chain.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {chain.tokens.length} token{chain.tokens.length !== 1 ? 's' : ''}
                        {chain.pendingBridges > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {chain.pendingBridges} pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatValue(chain.totalValue)}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Detailed Chain View */}
      <Tabs value={selectedChain?.toString() || MOCK_PORTFOLIO[0].chainId.toString()} onValueChange={(value) => setSelectedChain(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-4">
          {MOCK_PORTFOLIO.map((chain) => (
            <TabsTrigger key={chain.chainId} value={chain.chainId.toString()}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${chain.color}`} />
                <span className="hidden sm:inline">{chain.name.split(' ')[0]}</span>
                <span className="sm:hidden">{chain.name.substring(0, 4)}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {MOCK_PORTFOLIO.map((chain) => (
          <TabsContent key={chain.chainId} value={chain.chainId.toString()}>
            <Card className="cyber-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="cyber-text flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${chain.color}`} />
                      {chain.name} Portfolio
                    </CardTitle>
                    <CardDescription>Assets on this chain</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Bridge Assets
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chain.tokens.map((token) => {
                    const change = formatChange(token.change24h)
                    
                    return (
                      <div key={token.address} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="text-xs font-bold">{token.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">{token.balance} {token.symbol}</div>
                          <div className="text-xs text-muted-foreground">{formatValue(token.value)}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">{formatValue(token.price)}</div>
                          <div className={`text-xs ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {change.formatted}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
