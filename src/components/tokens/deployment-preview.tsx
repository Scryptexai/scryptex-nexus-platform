
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, ExternalLink, Eye } from "lucide-react"

export function DeploymentPreview() {
  const deploymentSteps = [
    { name: "Validate Parameters", status: "completed", time: "2s" },
    { name: "Optimize Chain Selection", status: "completed", time: "1s" },
    { name: "Generate Contract", status: "completed", time: "3s" },
    { name: "Deploy to Chain", status: "in-progress", time: "~30s" },
    { name: "Verify Contract", status: "pending", time: "~15s" },
    { name: "Index Token", status: "pending", time: "~10s" }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-400" />
      case "in-progress": return <Clock className="h-4 w-4 text-blue-400 animate-pulse" />
      case "pending": return <Clock className="h-4 w-4 text-gray-400" />
      default: return <AlertCircle className="h-4 w-4 text-red-400" />
    }
  }

  const totalSteps = deploymentSteps.length
  const completedSteps = deploymentSteps.filter(step => step.status === "completed").length
  const progress = (completedSteps / totalSteps) * 100

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Deployment Preview
        </CardTitle>
        <CardDescription>Real-time deployment status and contract preview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Token Preview */}
        <div className="p-4 rounded-lg border border-border/30 space-y-3">
          <h4 className="font-medium">Token Preview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2">ScryptexCoin</span>
            </div>
            <div>
              <span className="text-muted-foreground">Symbol:</span>
              <span className="ml-2">SXT</span>
            </div>
            <div>
              <span className="text-muted-foreground">Supply:</span>
              <span className="ml-2">1,000,000</span>
            </div>
            <div>
              <span className="text-muted-foreground">Chain:</span>
              <Badge className="ml-2 bg-blue-500/20 text-blue-400">RiseChain</Badge>
            </div>
          </div>
        </div>

        {/* Deployment Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Deployment Progress</h4>
            <span className="text-sm text-muted-foreground">{completedSteps}/{totalSteps} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="space-y-2">
            {deploymentSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border border-border/20">
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <span className="text-sm">{step.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{step.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chain Optimization */}
        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
          <h4 className="text-sm font-medium text-green-400 mb-2">Chain Optimization Result</h4>
          <p className="text-xs text-muted-foreground mb-3">
            RiseChain selected for optimal gas fees and liquidity. Estimated savings: 35% vs Ethereum mainnet.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Gas Price:</span>
              <span className="ml-2 text-green-400">0.1 gwei</span>
            </div>
            <div>
              <span className="text-muted-foreground">Liquidity Score:</span>
              <span className="ml-2 text-green-400">8.5/10</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Contract
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Add to Wallet
          </Button>
        </div>

        {/* Recent Deployments */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Deployments</h4>
          <div className="space-y-2">
            {[
              { name: "TestCoin", symbol: "TST", chain: "Abstract", status: "Success" },
              { name: "MyToken", symbol: "MTK", chain: "0G Galileo", status: "Success" },
              { name: "DemoToken", symbol: "DMO", chain: "Somnia", status: "Failed" }
            ].map((token, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border border-border/20 text-sm">
                <div className="flex items-center gap-2">
                  <span>{token.name} ({token.symbol})</span>
                  <Badge variant="outline">{token.chain}</Badge>
                </div>
                <Badge className={token.status === "Success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {token.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
