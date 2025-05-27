
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Parachute, CheckCircle, Clock, AlertCircle } from "lucide-react"

export function AirdropTracker() {
  const airdrops = [
    { name: "RiseChain", progress: 85, status: "eligible", requirements: "Complete 5 trades" },
    { name: "Abstract", progress: 60, status: "pending", requirements: "Join 3 communities" },
    { name: "0G Galileo", progress: 100, status: "qualified", requirements: "Store 1GB data" },
    { name: "Somnia", progress: 45, status: "in-progress", requirements: "Complete 10 quests" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "qualified": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "eligible": return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qualified": return "bg-green-500/20 text-green-400"
      case "eligible": return "bg-blue-500/20 text-blue-400"
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      default: return "bg-orange-500/20 text-orange-400"
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Parachute className="h-5 w-5" />
          Airdrop Tracker
        </CardTitle>
        <CardDescription>Track your airdrop eligibility across all chains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {airdrops.map((airdrop, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(airdrop.status)}
                <span className="font-medium">{airdrop.name}</span>
              </div>
              <Badge className={getStatusColor(airdrop.status)}>
                {airdrop.status}
              </Badge>
            </div>
            <Progress value={airdrop.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{airdrop.requirements}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
