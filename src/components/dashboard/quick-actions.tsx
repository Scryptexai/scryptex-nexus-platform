
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Factory, ArrowRightLeft, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const quickActions = [
  {
    title: "Create Token",
    description: "Launch a new token",
    icon: Factory,
    href: "/tokens/create",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Start Trading",
    description: "Swap tokens",
    icon: ArrowRightLeft,
    href: "/trading/swap",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "View Quests",
    description: "Complete challenges",
    icon: Trophy,
    href: "/quests",
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: "Join Community",
    description: "Connect with farmers",
    icon: Users,
    href: "/community",
    color: "from-purple-500 to-pink-500"
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Jump into farming activities across all chains
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.href}>
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mr-3`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
