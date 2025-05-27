
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { PerformanceSummary } from '@/components/dashboard/performance-summary'

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SCRYPTEX Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your unified multi-chain testnet farming platform. Monitor activities across RiseChain, Abstract, 0G Galileo, and Somnia.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <DashboardOverview />
          <ActivityFeed />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <PerformanceSummary />
        </div>
      </div>
    </div>
  )
}

export default Index
