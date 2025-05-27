
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Factory, ArrowRightLeft, Trophy, Users, Vote, Coins } from 'lucide-react'

const activities = [
  {
    type: "token_created",
    title: "Created FARM token",
    description: "New token deployed on RiseChain",
    timestamp: "2 minutes ago",
    chain: "RISE",
    icon: Factory,
    color: "text-blue-500"
  },
  {
    type: "trade",
    title: "Swapped 100 USDC for ETH",
    description: "Trade executed across multiple chains",
    timestamp: "5 minutes ago",
    chain: "Multi",
    icon: ArrowRightLeft,
    color: "text-green-500"
  },
  {
    type: "quest_completed",
    title: "Completed Daily Trading Quest",
    description: "Earned 50 XP and NFT badge",
    timestamp: "12 minutes ago",
    chain: "Somnia",
    icon: Trophy,
    color: "text-yellow-500"
  },
  {
    type: "governance",
    title: "Voted on Proposal #42",
    description: "Community governance participation",
    timestamp: "1 hour ago",
    chain: "Abstract",
    icon: Vote,
    color: "text-purple-500"
  },
  {
    type: "reward",
    title: "Received Airdrop Points",
    description: "+250 points for platform activity",
    timestamp: "2 hours ago",
    chain: "0G",
    icon: Coins,
    color: "text-cyan-500"
  },
  {
    type: "social",
    title: "Joined Farming Guild",
    description: "Now part of Elite Farmers group",
    timestamp: "3 hours ago",
    chain: "Abstract",
    icon: Users,
    color: "text-pink-500"
  }
]

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Cross-chain farming activities and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg border border-border/30">
                <div className={`h-8 w-8 rounded-full bg-secondary flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {activity.chain}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
