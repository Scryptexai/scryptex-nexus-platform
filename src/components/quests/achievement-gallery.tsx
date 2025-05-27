
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Star, Crown, Shield, Zap } from "lucide-react"

export function AchievementGallery() {
  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first transaction",
      icon: Star,
      rarity: "Common",
      unlocked: true,
      date: "2024-01-15"
    },
    {
      id: 2,
      name: "Token Creator",
      description: "Deploy your first token",
      icon: Crown,
      rarity: "Rare",
      unlocked: true,
      date: "2024-01-20"
    },
    {
      id: 3,
      name: "Community Leader",
      description: "Reach 1000 reputation points",
      icon: Trophy,
      rarity: "Epic",
      unlocked: true,
      date: "2024-02-01"
    },
    {
      id: 4,
      name: "Chain Hopper",
      description: "Use all 4 supported chains",
      icon: Zap,
      rarity: "Rare",
      unlocked: true,
      date: "2024-02-10"
    },
    {
      id: 5,
      name: "Quest Master",
      description: "Complete 50 quests",
      icon: Medal,
      rarity: "Epic",
      unlocked: false,
      date: null
    },
    {
      id: 6,
      name: "Legendary Farmer",
      description: "Achieve maximum farming score",
      icon: Shield,
      rarity: "Legendary",
      unlocked: false,
      date: null
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "bg-gray-500/20 text-gray-400"
      case "Rare": return "bg-blue-500/20 text-blue-400"
      case "Epic": return "bg-purple-500/20 text-purple-400"
      case "Legendary": return "bg-yellow-500/20 text-yellow-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getIconColor = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return "text-gray-600"
    switch (rarity) {
      case "Common": return "text-gray-400"
      case "Rare": return "text-blue-400"
      case "Epic": return "text-purple-400"
      case "Legendary": return "text-yellow-400"
      default: return "text-gray-400"
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievement Gallery
        </CardTitle>
        <CardDescription>Your collected NFT achievements and badges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                achievement.unlocked 
                  ? "border-primary/30 hover:border-primary/50 cyber-glow" 
                  : "border-border/30 opacity-60"
              }`}
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <achievement.icon 
                    className={`h-8 w-8 ${getIconColor(achievement.rarity, achievement.unlocked)}`} 
                  />
                </div>
                <h4 className="font-medium text-sm">{achievement.name}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                <Badge className={getRarityColor(achievement.rarity)}>
                  {achievement.rarity}
                </Badge>
                {achievement.unlocked && achievement.date && (
                  <p className="text-xs text-muted-foreground">
                    Unlocked: {achievement.date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
