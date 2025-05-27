
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react"

export function FarmingMetrics() {
  const metrics = [
    { label: "Farming Score", value: 85, trend: "up", icon: TrendingUp },
    { label: "Activity Level", value: 92, trend: "up", icon: Activity },
    { label: "Efficiency Rate", value: 78, trend: "down", icon: Zap },
    { label: "Cross-Chain Score", value: 65, trend: "up", icon: TrendingUp },
  ]

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text">Farming Metrics</CardTitle>
        <CardDescription>Your farming performance across all chains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">{metric.value}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
