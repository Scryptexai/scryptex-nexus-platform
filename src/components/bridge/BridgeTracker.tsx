
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Clock, ArrowUpDown, ExternalLink, RefreshCw } from 'lucide-react'

interface BridgeTransaction {
  id: string
  sourceChain: number
  targetChain: number
  sourceToken: string
  targetToken: string
  amount: string
  status: 'pending' | 'confirming' | 'bridging' | 'completed' | 'failed'
  startTime: Date
  confirmationTime?: Date
  completionTime?: Date
  sourceTxHash: string
  targetTxHash?: string
  estimatedCompletion: Date
  progress: number
}

const CHAIN_NAMES: Record<number, string> = {
  11155931: 'RISE Testnet',
  11124: 'Abstract Testnet',
  16601: '0G Galileo',
  50312: 'Somnia Testnet'
}

const MOCK_TRANSACTIONS: BridgeTransaction[] = [
  {
    id: '1',
    sourceChain: 11155931,
    targetChain: 11124,
    sourceToken: 'ETH',
    targetToken: 'ETH',
    amount: '1.5',
    status: 'bridging',
    startTime: new Date(Date.now() - 180000), // 3 minutes ago
    confirmationTime: new Date(Date.now() - 120000), // 2 minutes ago
    sourceTxHash: '0x1234...5678',
    estimatedCompletion: new Date(Date.now() + 120000), // 2 minutes from now
    progress: 65
  },
  {
    id: '2',
    sourceChain: 11124,
    targetChain: 16601,
    sourceToken: 'USDT',
    targetToken: 'USDT',
    amount: '500.0',
    status: 'completed',
    startTime: new Date(Date.now() - 600000), // 10 minutes ago
    confirmationTime: new Date(Date.now() - 540000), // 9 minutes ago
    completionTime: new Date(Date.now() - 60000), // 1 minute ago
    sourceTxHash: '0x5678...1234',
    targetTxHash: '0x9999...8888',
    estimatedCompletion: new Date(Date.now() - 60000),
    progress: 100
  },
  {
    id: '3',
    sourceChain: 50312,
    targetChain: 11155931,
    sourceToken: 'STT',
    targetToken: 'ETH',
    amount: '100.0',
    status: 'failed',
    startTime: new Date(Date.now() - 900000), // 15 minutes ago
    sourceTxHash: '0x3333...4444',
    estimatedCompletion: new Date(Date.now() - 600000),
    progress: 25
  }
]

export function BridgeTracker() {
  const [transactions, setTransactions] = useState<BridgeTransaction[]>(MOCK_TRANSACTIONS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshTransactions = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update progress for bridging transactions
    setTransactions(prev => prev.map(tx => {
      if (tx.status === 'bridging' && tx.progress < 100) {
        const newProgress = Math.min(tx.progress + 10, 100)
        if (newProgress === 100) {
          return {
            ...tx,
            status: 'completed' as const,
            completionTime: new Date(),
            targetTxHash: '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4),
            progress: newProgress
          }
        }
        return { ...tx, progress: newProgress }
      }
      return tx
    }))
    
    setIsRefreshing(false)
  }

  const getStatusColor = (status: BridgeTransaction['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirming': return 'bg-blue-500'
      case 'bridging': return 'bg-purple-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: BridgeTransaction['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'confirming': return 'Confirming'
      case 'bridging': return 'Bridging'
      case 'completed': return 'Completed'
      case 'failed': return 'Failed'
      default: return 'Unknown'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshTransactions()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="cyber-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="cyber-text">Bridge Transactions</CardTitle>
            <CardDescription>Track your cross-chain bridge transactions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTransactions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No bridge transactions found
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="border border-border/30 rounded-lg p-4 space-y-3">
              {/* Transaction Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{CHAIN_NAMES[tx.sourceChain]}</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{CHAIN_NAMES[tx.targetChain]}</span>
                  </div>
                  <Badge variant="secondary" className={`text-white ${getStatusColor(tx.status)}`}>
                    {getStatusText(tx.status)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getTimeAgo(tx.startTime)}
                </div>
              </div>

              {/* Amount and Tokens */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-lg font-semibold">{tx.amount} {tx.sourceToken}</div>
                  <div className="text-sm text-muted-foreground">
                    To {tx.amount} {tx.targetToken}
                  </div>
                </div>
                {tx.status === 'bridging' && (
                  <div className="text-right space-y-1">
                    <div className="text-xs text-muted-foreground">Progress</div>
                    <div className="text-sm font-medium">{tx.progress}%</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {(tx.status === 'bridging' || tx.status === 'confirming') && (
                <Progress value={tx.progress} className="h-2" />
              )}

              {/* Transaction Hashes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Source Tx:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{tx.sourceTxHash}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-1">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {tx.targetTxHash && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target Tx:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">{tx.targetTxHash}</span>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Timing Info */}
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div>
                  <div>Started</div>
                  <div className="font-medium text-foreground">{formatTime(tx.startTime)}</div>
                </div>
                {tx.confirmationTime && (
                  <div>
                    <div>Confirmed</div>
                    <div className="font-medium text-foreground">{formatTime(tx.confirmationTime)}</div>
                  </div>
                )}
                {tx.completionTime ? (
                  <div>
                    <div>Completed</div>
                    <div className="font-medium text-green-500">{formatTime(tx.completionTime)}</div>
                  </div>
                ) : tx.status === 'failed' ? (
                  <div>
                    <div>Failed</div>
                    <div className="font-medium text-red-500">-</div>
                  </div>
                ) : (
                  <div>
                    <div>ETA</div>
                    <div className="font-medium text-foreground">{formatTime(tx.estimatedCompletion)}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
