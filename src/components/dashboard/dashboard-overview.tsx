
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Factory, TrendingUp, Users, Trophy, BarChart3, Coins } from 'lucide-react'

const stats = [
  {
    title: "Tokens Created",
    value: "12",
    change: "+3 this week",
    icon: Factory,
    color: "text-blue-500"
  },
  {
    title: "Trading Volume",
    value: "$45,230",
    change: "+12.5%",
    icon: TrendingUp,
    color: "text-green-500"
  },
  {
    title: "Community Score",
    value: "2,847",
    change: "Rank #156",
    icon: Users,
    color: "text-purple-500"
  },
  {
    title: "Quests Completed",
    value: "28/35",
    change: "80% complete",
    icon: Trophy,
    color: "text-yellow-500"
  },
  {
    title: "Farming Score",
    value: "8,920",
    change: "Elite tier",
    icon: BarChart3,
    color: "text-cyan-500"
  },
  {
    title: "Airdrop Points",
    value: "15,420",
    change: "98% eligible",
    icon: Coins,
    color: "text-emerald-500"
  }
]

export function DashboardOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Overview</CardTitle>
        <CardDescription>
          Your cross-chain farming performance across all supported networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-3 p-4 bg-secondary/20 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <Badge variant="secondary" className="text-xs">
                  Multi-chain
                </Badge>
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
              <div className="text-xs text-muted-foreground">{stat.change}</div>
            </div>
          ))}
        </div>
        
        {/* Overall Progress */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Overall Farming Progress</h4>
            <span className="text-sm text-muted-foreground">Level 12</span>
          </div>
          <Progress value={75} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>8,920 / 12,000 XP</span>
            <span>3,080 XP to next level</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
