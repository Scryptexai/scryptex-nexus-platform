
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gamepad2, Coins, Clock, CheckCircle } from "lucide-react"

export function QuestBoard() {
  const quests = [
    {
      id: 1,
      title: "Multi-Chain Explorer",
      description: "Complete transactions on all 4 supported chains",
      reward: "500 XP + NFT Badge",
      progress: 75,
      timeLeft: "2 days",
      difficulty: "Medium",
      status: "active",
      chain: "All Chains"
    },
    {
      id: 2,
      title: "Token Creator",
      description: "Create and deploy your first token",
      reward: "1000 XP + Creator Badge",
      progress: 0,
      timeLeft: "7 days",
      difficulty: "Easy",
      status: "available",
      chain: "RiseChain"
    },
    {
      id: 3,
      title: "Community Leader",
      description: "Participate in 5 governance votes",
      reward: "750 XP + Leader Badge",
      progress: 60,
      timeLeft: "5 days",
      difficulty: "Medium",
      status: "active",
      chain: "Abstract"
    },
    {
      id: 4,
      title: "Data Guardian",
      description: "Store 10GB of data successfully",
      reward: "800 XP + Guardian Badge",
      progress: 100,
      timeLeft: "Completed",
      difficulty: "Hard",
      status: "completed",
      chain: "0G Galileo"
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/20 text-green-400"
      case "Medium": return "bg-yellow-500/20 text-yellow-400"
      case "Hard": return "bg-red-500/20 text-red-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-400" />
      default: return <Gamepad2 className="h-4 w-4 text-primary" />
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Quest Board
        </CardTitle>
        <CardDescription>Available quests and challenges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {quests.map((quest) => (
          <div key={quest.id} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(quest.status)}
                <div>
                  <h4 className="font-medium">{quest.title}</h4>
                  <p className="text-sm text-muted-foreground">{quest.description}</p>
                </div>
              </div>
              <Badge className={getDifficultyColor(quest.difficulty)}>
                {quest.difficulty}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-yellow-400" />
                <span>{quest.reward}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{quest.timeLeft}</span>
              </div>
            </div>

            {quest.status !== "completed" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{quest.progress}%</span>
                </div>
                <Progress value={quest.progress} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge variant="outline">{quest.chain}</Badge>
              {quest.status === "available" && (
                <Button size="sm">Start Quest</Button>
              )}
              {quest.status === "active" && (
                <Button size="sm" variant="outline">Continue</Button>
              )}
              {quest.status === "completed" && (
                <Button size="sm" variant="outline" disabled>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
