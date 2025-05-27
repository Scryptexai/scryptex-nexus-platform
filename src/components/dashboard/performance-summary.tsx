
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const performanceMetrics = [
  {
    name: "Token Creation",
    current: 12,
    target: 15,
    progress: 80,
    trend: "up",
    change: "+3"
  },
  {
    name: "Trading Volume",
    current: 45230,
    target: 50000,
    progress: 90,
    trend: "up",
    change: "+12.5%"
  },
  {
    name: "Community Engagement",
    current: 2847,
    target: 3000,
    progress: 95,
    trend: "up",
    change: "+156"
  },
  {
    name: "Quest Completion",
    current: 28,
    target: 35,
    progress: 80,
    trend: "steady",
    change: "0"
  },
  {
    name: "Airdrop Eligibility",
    current: 98,
    target: 100,
    progress: 98,
    trend: "up",
    change: "+2%"
  }
]

export function PerformanceSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
        <CardDescription>
          Your farming efficiency across all activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{metric.name}</span>
              <div className="flex items-center gap-2">
                {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {metric.trend === 'steady' && <Minus className="h-3 w-3 text-gray-500" />}
                <Badge variant="secondary" className="text-xs">
                  {metric.change}
                </Badge>
              </div>
            </div>
            <Progress value={metric.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{metric.current.toLocaleString()}</span>
              <span>Target: {metric.target.toLocaleString()}</span>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-border/50">
          <div className="text-center space-y-2">
            <div className="text-lg font-bold text-primary">Elite Farmer</div>
            <div className="text-sm text-muted-foreground">Top 5% of all platform users</div>
            <Badge className="bg-gradient-to-r from-primary to-accent">
              Multi-Chain Expert
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
