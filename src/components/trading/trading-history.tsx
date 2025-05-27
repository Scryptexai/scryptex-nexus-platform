
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tradeHistory = [
  { type: 'Swap', pair: 'ETH → USDC', amount: '0.5 ETH', time: '2 min ago', status: 'completed' },
  { type: 'Swap', pair: 'USDC → OG', amount: '100 USDC', time: '15 min ago', status: 'completed' },
  { type: 'Swap', pair: 'STT → ETH', amount: '50 STT', time: '1 hour ago', status: 'pending' },
  { type: 'Swap', pair: 'ETH → BTC', amount: '0.2 ETH', time: '2 hours ago', status: 'completed' },
]

export function TradingHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>Your trading activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tradeHistory.map((trade, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <div className="font-medium text-sm">{trade.pair}</div>
                <div className="text-xs text-muted-foreground">{trade.time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{trade.amount}</div>
                <Badge 
                  variant={trade.status === 'completed' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {trade.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
