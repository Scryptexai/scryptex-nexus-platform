
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const priceData = [
  { time: '00:00', price: 2400 },
  { time: '04:00', price: 2420 },
  { time: '08:00', price: 2380 },
  { time: '12:00', price: 2450 },
  { time: '16:00', price: 2460 },
  { time: '20:00', price: 2440 },
  { time: '24:00', price: 2450 },
]

export function PriceCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ETH/USDC Price Chart</CardTitle>
        <CardDescription>24-hour price movement</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#00d4ff" 
              strokeWidth={2}
              dot={{ fill: '#00d4ff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
