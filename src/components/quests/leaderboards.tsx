
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Medal, Trophy } from "lucide-react"

export function Leaderboards() {
  const leaderboard = [
    {
      rank: 1,
      name: "QuestMaster",
      avatar: "/placeholder.svg",
      score: 15420,
      completedQuests: 87,
      badge: "Legendary"
    },
    {
      rank: 2,
      name: "ChainHopper",
      avatar: "/placeholder.svg",
      score: 14250,
      completedQuests: 79,
      badge: "Epic"
    },
    {
      rank: 3,
      name: "TokenKing",
      avatar: "/placeholder.svg",
      score: 13180,
      completedQuests: 72,
      badge: "Epic"
    },
    {
      rank: 4,
      name: "CryptoNinja",
      avatar: "/placeholder.svg",
      score: 12340,
      completedQuests: 68,
      badge: "Rare"
    },
    {
      rank: 5,
      name: "DeFiGuru",
      avatar: "/placeholder.svg",
      score: 11890,
      completedQuests: 65,
      badge: "Rare"
    }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-400" />
      case 2: return <Medal className="h-4 w-4 text-gray-300" />
      case 3: return <Trophy className="h-4 w-4 text-orange-400" />
      default: return <span className="text-xs font-bold w-4 text-center">{rank}</span>
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Legendary": return "bg-yellow-500/20 text-yellow-400"
      case "Epic": return "bg-purple-500/20 text-purple-400"
      case "Rare": return "bg-blue-500/20 text-blue-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboards
        </CardTitle>
        <CardDescription>Top quest completers this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.map((player) => (
          <div
            key={player.rank}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              player.rank <= 3 
                ? "border-primary/30 bg-primary/5" 
                : "border-border/30 hover:border-primary/20"
            }`}
          >
            <div className="flex items-center justify-center w-6">
              {getRankIcon(player.rank)}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={player.avatar} />
              <AvatarFallback>{player.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{player.name}</span>
                <Badge className={getBadgeColor(player.badge)}>
                  {player.badge}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{player.score.toLocaleString()} XP</span>
                <span>{player.completedQuests} quests</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
