
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, DollarSign, Users, TrendingUp } from "lucide-react"

export function ChainOptimizer() {
  const chainAnalysis = [
    {
      name: "RiseChain",
      score: 95,
      gasPrice: "0.1 gwei",
      liquidity: "High",
      userBase: "12.4K",
      fees: "$0.05",
      recommended: true
    },
    {
      name: "Abstract",
      score: 88,
      gasPrice: "0.2 gwei",
      liquidity: "Medium",
      userBase: "8.7K",
      fees: "$0.08",
      recommended: false
    },
    {
      name: "0G Galileo",
      score: 82,
      gasPrice: "0.15 gwei",
      liquidity: "Medium",
      userBase: "6.2K",
      fees: "$0.06",
      recommended: false
    },
    {
      name: "Somnia",
      score: 75,
      gasPrice: "0.3 gwei",
      liquidity: "Low",
      userBase: "4.1K",
      fees: "$0.12",
      recommended: false
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 80) return "text-yellow-400"
    return "text-orange-400"
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Chain Optimizer
        </CardTitle>
        <CardDescription>AI-powered chain selection for optimal deployment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
          <h4 className="text-sm font-medium text-primary mb-2">Optimization Factors</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>Gas Fees</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Liquidity</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>User Base</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Speed</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Chain Analysis</h4>
          {chainAnalysis.map((chain, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border transition-colors ${
                chain.recommended 
                  ? "border-primary/50 bg-primary/5 cyber-glow" 
                  : "border-border/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{chain.name}</span>
                  {chain.recommended && (
                    <Badge className="bg-green-500/20 text-green-400">
                      Recommended
                    </Badge>
                  )}
                </div>
                <span className={`text-sm font-medium ${getScoreColor(chain.score)}`}>
                  {chain.score}/100
                </span>
              </div>
              
              <Progress value={chain.score} className="h-2 mb-3" />
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Gas Price:</span>
                  <span className="ml-2">{chain.gasPrice}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Fees:</span>
                  <span className="ml-2">{chain.fees}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Liquidity:</span>
                  <span className="ml-2">{chain.liquidity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Users:</span>
                  <span className="ml-2">{chain.userBase}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
          <h4 className="text-sm font-medium text-green-400 mb-2">Recommendation</h4>
          <p className="text-xs text-muted-foreground">
            RiseChain offers the best combination of low fees, high liquidity, and active user base for your token deployment. 
            Expected deployment cost: <span className="text-green-400 font-medium">$0.05</span> vs $1.50 on Ethereum mainnet.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
