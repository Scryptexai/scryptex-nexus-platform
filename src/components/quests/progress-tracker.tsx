
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Zap, Calendar } from "lucide-react"

export function ProgressTracker() {
  const currentLevel = 12
  const currentXP = 8450
  const nextLevelXP = 10000
  const progressToNext = (currentXP / nextLevelXP) * 100

  const weeklyGoals = [
    {
      title: "Complete 5 Quests",
      progress: 80,
      current: 4,
      target: 5,
      reward: "200 XP"
    },
    {
      title: "Trade 10 Times",
      progress: 60,
      current: 6,
      target: 10,
      reward: "150 XP"
    },
    {
      title: "Create 1 Token",
      progress: 0,
      current: 0,
      target: 1,
      reward: "500 XP"
    }
  ]

  const dailyStreak = 7

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Target className="h-5 w-5" />
          Progress Tracker
        </CardTitle>
        <CardDescription>Your quest progress and goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Level {currentLevel}</span>
            <span className="text-sm text-muted-foreground">
              {currentXP} / {nextLevelXP} XP
            </span>
          </div>
          <Progress value={progressToNext} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {nextLevelXP - currentXP} XP to next level
          </p>
        </div>

        {/* Daily Streak */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/30">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">Daily Streak</span>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400">
            {dailyStreak} days
          </Badge>
        </div>

        {/* Weekly Goals */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Weekly Goals</span>
          </div>
          {weeklyGoals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{goal.title}</span>
                <span className="text-muted-foreground">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Reward: {goal.reward}</span>
                {goal.progress === 100 && (
                  <Badge className="bg-green-500/20 text-green-400">
                    Complete!
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
