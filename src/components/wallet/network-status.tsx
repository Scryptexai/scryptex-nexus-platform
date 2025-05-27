
"use client"

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff } from 'lucide-react'

const CHAIN_STATUS = [
  { name: 'RISE', status: 'connected', latency: 45 },
  { name: 'Abstract', status: 'connected', latency: 67 },
  { name: '0G', status: 'connected', latency: 89 },
  { name: 'Somnia', status: 'degraded', latency: 234 }
]

export function NetworkStatus() {
  const overallStatus = CHAIN_STATUS.every(chain => chain.status === 'connected') ? 'healthy' : 'degraded'
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {overallStatus === 'healthy' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-yellow-500" />
            )}
            <Badge variant={overallStatus === 'healthy' ? 'default' : 'secondary'}>
              {overallStatus === 'healthy' ? 'All Systems Operational' : 'Some Issues Detected'}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <div className="font-medium">Chain Status</div>
            {CHAIN_STATUS.map((chain) => (
              <div key={chain.name} className="flex items-center justify-between gap-4 text-sm">
                <span>{chain.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{chain.latency}ms</span>
                  <div className={`h-2 w-2 rounded-full ${
                    chain.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
