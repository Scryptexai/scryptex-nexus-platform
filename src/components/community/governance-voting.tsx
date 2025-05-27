
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Vote, CheckCircle, Clock } from "lucide-react"

export function GovernanceVoting() {
  const proposals = [
    {
      id: 1,
      title: "Increase farming rewards",
      description: "Proposal to increase base farming rewards by 15%",
      status: "active",
      forVotes: 75,
      againstVotes: 25,
      timeLeft: "2 days",
      userVoted: false
    },
    {
      id: 2,
      title: "New chain integration",
      description: "Add support for Polygon zkEVM testnet",
      status: "passed",
      forVotes: 85,
      againstVotes: 15,
      timeLeft: "Ended",
      userVoted: true
    },
    {
      id: 3,
      title: "Update tokenomics",
      description: "Revise token distribution model",
      status: "pending",
      forVotes: 0,
      againstVotes: 0,
      timeLeft: "5 days",
      userVoted: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500/20 text-blue-400"
      case "passed": return "bg-green-500/20 text-green-400"
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Governance Voting
        </CardTitle>
        <CardDescription>Active proposals and voting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="p-4 rounded-lg border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{proposal.title}</h4>
              <Badge className={getStatusColor(proposal.status)}>
                {proposal.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
            
            {proposal.status !== "pending" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>For: {proposal.forVotes}%</span>
                  <span>Against: {proposal.againstVotes}%</span>
                </div>
                <Progress value={proposal.forVotes} className="h-2" />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{proposal.timeLeft}</span>
                {proposal.userVoted && (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>Voted</span>
                  </div>
                )}
              </div>
              {proposal.status === "active" && !proposal.userVoted && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Against</Button>
                  <Button size="sm">For</Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
