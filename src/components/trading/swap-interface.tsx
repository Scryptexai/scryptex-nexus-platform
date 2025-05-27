
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUpDown, Settings } from 'lucide-react'

export function SwapInterface() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Token Swap</CardTitle>
            <CardDescription>Swap tokens across all supported chains</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <div className="flex items-center gap-2">
            <Input placeholder="0.0" className="flex-1" />
            <Button variant="outline" className="w-24">
              ETH
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            Balance: 1.5 ETH
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" className="rounded-full">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <div className="flex items-center gap-2">
            <Input placeholder="0.0" className="flex-1" />
            <Button variant="outline" className="w-24">
              USDC
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            Balance: 250.5 USDC
          </div>
        </div>
        
        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Swap Tokens
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Rate:</span>
            <span>1 ETH = 2,450 USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Network Fee:</span>
            <span>$2.50</span>
          </div>
          <div className="flex justify-between">
            <span>Cross-chain Fee:</span>
            <span>$0.50</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
