
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tradingPairs = [
  { pair: 'ETH/USDC', price: '$2,450.50', change: '+2.4%', volume: '$1.2M', positive: true },
  { pair: 'BTC/ETH', price: '17.5 ETH', change: '-1.2%', volume: '$890K', positive: false },
  { pair: 'OG/ETH', price: '0.0045 ETH', change: '+15.6%', volume: '$245K', positive: true },
  { pair: 'STT/USDC', price: '$0.85', change: '+5.2%', volume: '$156K', positive: true },
]

export function TradingPairs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Pairs</CardTitle>
        <CardDescription>Popular trading pairs across all chains</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tradingPairs.map((pair, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
              <div>
                <div className="font-medium">{pair.pair}</div>
                <div className="text-sm text-muted-foreground">{pair.volume}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{pair.price}</div>
                <Badge variant={pair.positive ? 'default' : 'destructive'} className="text-xs">
                  {pair.change}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
