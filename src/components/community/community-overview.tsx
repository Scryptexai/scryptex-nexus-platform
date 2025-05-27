
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Vote, Trophy } from "lucide-react"

export function CommunityOverview() {
  const stats = [
    { label: "Total Members", value: "12,459", icon: Users, trend: "+12%" },
    { label: "Active Discussions", value: "234", icon: MessageSquare, trend: "+8%" },
    { label: "Governance Votes", value: "1,456", icon: Vote, trend: "+15%" },
    { label: "Top Contributors", value: "89", icon: Trophy, trend: "+3%" },
  ]

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text">Community Overview</CardTitle>
        <CardDescription>Community statistics across all chains</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-green-400">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
