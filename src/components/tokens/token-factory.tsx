
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Factory, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function TokenFactory() {
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    description: '',
    logoUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    
    // Simulate token creation
    setTimeout(() => {
      setIsCreating(false)
      toast({
        title: "Token Created Successfully!",
        description: `${formData.name} (${formData.symbol}) has been deployed on RiseChain`,
      })
      setFormData({
        name: '',
        symbol: '',
        totalSupply: '',
        description: '',
        logoUrl: ''
      })
    }, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5" />
          Create New Token
        </CardTitle>
        <CardDescription>
          Deploy tokens with automatic chain optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Token"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="MAT"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              maxLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supply">Total Supply</Label>
            <Input
              id="supply"
              type="number"
              placeholder="1000000"
              value={formData.totalSupply}
              onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your token's utility and purpose..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL (Optional)</Label>
            <Input
              id="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
            />
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Deployment Chain</span>
              <Badge variant="secondary">Auto-Selected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                RiseChain (Optimal for token operations)
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Creating Token...
              </>
            ) : (
              <>
                <Factory className="h-4 w-4 mr-2" />
                Create Token
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
