
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const popularTokens = [
  { symbol: 'ETH', name: 'Ethereum', balance: '1.5', price: '$2,450' },
  { symbol: 'USDC', name: 'USD Coin', balance: '250.5', price: '$1.00' },
  { symbol: 'OG', name: '0G Token', balance: '1,250', price: '$0.15' },
  { symbol: 'STT', name: 'Somnia Token', balance: '500', price: '$0.85' },
]

export function TokenSelector() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Token</CardTitle>
        <CardDescription>Choose from your available tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search tokens..." className="pl-10" />
        </div>
        
        <div className="space-y-2">
          {popularTokens.map((token, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
              <div>
                <div className="font-medium">{token.symbol}</div>
                <div className="text-sm text-muted-foreground">{token.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{token.balance}</div>
                <div className="text-sm text-muted-foreground">{token.price}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
