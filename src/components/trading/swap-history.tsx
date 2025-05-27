
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const swapHistory = [
  { from: 'ETH', to: 'USDC', amount: '0.5', received: '1,225', time: '2 min ago', status: 'completed' },
  { from: 'USDC', to: 'OG', amount: '100', received: '666.67', time: '15 min ago', status: 'completed' },
  { from: 'STT', to: 'ETH', amount: '50', received: '0.017', time: '1 hour ago', status: 'pending' },
]

export function SwapHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap History</CardTitle>
        <CardDescription>Your recent swaps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {swapHistory.map((swap, index) => (
            <div key={index} className="space-y-2 p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">
                  {swap.amount} {swap.from} → {swap.received} {swap.to}
                </div>
                <Badge 
                  variant={swap.status === 'completed' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {swap.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">{swap.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
