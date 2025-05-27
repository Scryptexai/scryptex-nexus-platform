
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { PerformanceSummary } from '@/components/dashboard/performance-summary'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl" />
        <div className="relative bg-card/50 backdrop-blur-sm rounded-lg border border-primary/20 p-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to SCRYPTEX
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unified Multi-Chain Testnet Farming Platform
            </p>
            <p className="text-sm text-muted-foreground">
              Farming across RiseChain • Abstract • 0G Galileo • Somnia
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Stats */}
        <div className="lg:col-span-2">
          <DashboardOverview />
        </div>
        
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Activity and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <PerformanceSummary />
      </div>
    </div>
  )
}
