
import { SwapInterface } from '@/components/trading/swap-interface'
import { TokenSelector } from '@/components/trading/token-selector'
import { SwapHistory } from '@/components/trading/swap-history'

const TradingSwap = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Token Swap
        </h1>
        <p className="text-muted-foreground">
          Swap tokens instantly across all supported chains with best price routing.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SwapInterface />
        </div>
        <div className="space-y-6">
          <TokenSelector />
          <SwapHistory />
        </div>
      </div>
    </div>
  )
}

export default TradingSwap
