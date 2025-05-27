
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp } from "lucide-react"

export function PerformanceCharts() {
  const performanceData = [
    { month: "Jan", score: 45, volume: 1200 },
    { month: "Feb", score: 52, volume: 1800 },
    { month: "Mar", score: 48, volume: 1600 },
    { month: "Apr", score: 68, volume: 2400 },
    { month: "May", score: 75, volume: 3200 },
    { month: "Jun", score: 85, volume: 4100 },
  ]

  return (
    <Card className="cyber-border lg:col-span-2">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Charts
        </CardTitle>
        <CardDescription>Farming score and trading volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-4 text-primary">Farming Score Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(0, 212, 255, 0.3)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#00D4FF" 
                  strokeWidth={2}
                  dot={{ fill: '#00D4FF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-4 text-accent">Trading Volume</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(139, 92, 246, 0.3)' 
                  }} 
                />
                <Bar dataKey="volume" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
