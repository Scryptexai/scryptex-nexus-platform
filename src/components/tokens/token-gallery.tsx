
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ExternalLink, TrendingUp, Users, Droplets } from 'lucide-react'

const mockTokens = [
  {
    id: 1,
    name: "FarmCoin",
    symbol: "FARM",
    totalSupply: "1,000,000",
    currentPrice: "$0.45",
    change24h: "+12.5%",
    volume24h: "$15,420",
    holders: 234,
    chain: "RISE",
    isPositive: true,
    logo: "🌾"
  },
  {
    id: 2,
    name: "TestNet Gold",
    symbol: "TGLD",
    totalSupply: "500,000",
    currentPrice: "$1.23",
    change24h: "-3.2%",
    volume24h: "$8,760",
    holders: 156,
    chain: "RISE",
    isPositive: false,
    logo: "🥇"
  },
  {
    id: 3,
    name: "Community Coin",
    symbol: "COMM",
    totalSupply: "2,000,000",
    currentPrice: "$0.18",
    change24h: "+8.7%",
    volume24h: "$12,340",
    holders: 89,
    chain: "RISE",
    isPositive: true,
    logo: "👥"
  },
  {
    id: 4,
    name: "Quest Token",
    symbol: "QUEST",
    totalSupply: "750,000",
    currentPrice: "$0.67",
    change24h: "+15.3%",
    volume24h: "$22,180",
    holders: 312,
    chain: "RISE",
    isPositive: true,
    logo: "🎯"
  }
]

export function TokenGallery() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tokens</CardTitle>
        <CardDescription>
          Tokens you've created across all supported chains
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {mockTokens.map((token) => (
              <div key={token.id} className="p-4 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-xl">
                      {token.logo}
                    </div>
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-muted-foreground">{token.symbol}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{token.chain}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Supply: {token.totalSupply}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="font-medium">{token.currentPrice}</div>
                    <div className={`text-sm flex items-center gap-1 ${
                      token.isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {token.change24h}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm font-medium">{token.volume24h}</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Droplets className="h-3 w-3" />
                      24h Volume
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{token.holders}</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Users className="h-3 w-3" />
                      Holders
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
