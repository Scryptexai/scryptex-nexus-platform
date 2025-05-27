
import { FarmingMetrics } from '@/components/analytics/farming-metrics'
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap'
import { AirdropTracker } from '@/components/analytics/airdrop-tracker'
import { PerformanceCharts } from '@/components/analytics/performance-charts'

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your farming performance, analyze activity patterns, and monitor airdrop eligibility.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FarmingMetrics />
        <ActivityHeatmap />
        <AirdropTracker />
        <PerformanceCharts />
      </div>
    </div>
  )
}

export default Analytics
