
import { SwapInterface } from '@/components/trading/swap-interface'
import { TradingPairs } from '@/components/trading/trading-pairs'
import { TradingHistory } from '@/components/trading/trading-history'
import { PriceCharts } from '@/components/trading/price-charts'

const Trading = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Trading Hub
        </h1>
        <p className="text-muted-foreground">
          Swap tokens and trade across all supported chains with unified liquidity.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SwapInterface />
          <PriceCharts />
        </div>
        <div className="space-y-6">
          <TradingPairs />
          <TradingHistory />
        </div>
      </div>
    </div>
  )
}

export default Trading
