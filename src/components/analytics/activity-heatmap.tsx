
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export function ActivityHeatmap() {
  const generateHeatmapData = () => {
    const data = []
    for (let i = 0; i < 7; i++) {
      const week = []
      for (let j = 0; j < 52; j++) {
        week.push(Math.floor(Math.random() * 5))
      }
      data.push(week)
    }
    return data
  }

  const heatmapData = generateHeatmapData()
  const getIntensityColor = (value: number) => {
    const colors = ['bg-slate-800', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary/80']
    return colors[value] || colors[0]
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activity Heatmap
        </CardTitle>
        <CardDescription>Your farming activity over the past year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(day)}`}
                  title={`Activity level: ${day}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
