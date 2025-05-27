
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, Zap } from "lucide-react"

export function UserProfiles() {
  const topUsers = [
    {
      name: "CryptoKing",
      avatar: "/placeholder.svg",
      reputation: 2450,
      level: "Legend",
      badges: ["Top Farmer", "Community Leader"],
      rank: 1
    },
    {
      name: "DeFiQueen",
      avatar: "/placeholder.svg",
      reputation: 2280,
      level: "Master",
      badges: ["Quest Master", "Governance Pro"],
      rank: 2
    },
    {
      name: "ChainHopper",
      avatar: "/placeholder.svg",
      reputation: 1950,
      level: "Expert",
      badges: ["Multi-Chain", "Early Adopter"],
      rank: 3
    },
    {
      name: "TokenFarmer",
      avatar: "/placeholder.svg",
      reputation: 1720,
      level: "Advanced",
      badges: ["Token Creator", "Yield Hunter"],
      rank: 4
    }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-400" />
      case 2: return <Star className="h-4 w-4 text-gray-300" />
      case 3: return <Zap className="h-4 w-4 text-orange-400" />
      default: return <span className="h-4 w-4 text-center text-xs font-bold">{rank}</span>
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Legend": return "bg-yellow-500/20 text-yellow-400"
      case "Master": return "bg-purple-500/20 text-purple-400"
      case "Expert": return "bg-blue-500/20 text-blue-400"
      default: return "bg-green-500/20 text-green-400"
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text">Top Contributors</CardTitle>
        <CardDescription>Leading community members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topUsers.map((user) => (
          <div key={user.rank} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-center w-6">
              {getRankIcon(user.rank)}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{user.name}</span>
                <Badge className={getLevelColor(user.level)}>
                  {user.level}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Rep: {user.reputation}</span>
              </div>
              <div className="flex gap-1">
                {user.badges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
