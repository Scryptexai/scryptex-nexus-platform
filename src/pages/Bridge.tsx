
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CrossChainSwap } from "@/components/bridge/CrossChainSwap"
import { BridgeTracker } from "@/components/bridge/BridgeTracker"
import { MultiChainPortfolio } from "@/components/bridge/MultiChainPortfolio"
import { ArrowLeftRight, ArrowUpDown, Wallet, BarChart3 } from "lucide-react"

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Cross-Chain Bridge
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bridge assets seamlessly across RISE, Abstract, 0G, and Somnia testnets. 
            The first comprehensive bridge for new testnet ecosystems.
          </p>
        </div>

        {/* Bridge Interface */}
        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="swap" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Bridge</span>
            </TabsTrigger>
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="mt-8">
            <div className="flex justify-center">
              <CrossChainSwap />
            </div>
          </TabsContent>

          <TabsContent value="tracker" className="mt-8">
            <BridgeTracker />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-8">
            <MultiChainPortfolio />
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="cyber-text">Bridge Analytics</CardTitle>
                <CardDescription>Coming soon - Advanced bridge analytics and insights</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Comprehensive bridge analytics including volume, fees, popular routes, 
                      and optimization suggestions will be available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="cyber-border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <span className="text-sm font-medium">RISE Testnet</span>
              </div>
              <div className="text-2xl font-bold">$2,150</div>
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
            </CardContent>
          </Card>

          <Card className="cyber-border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <span className="text-sm font-medium">Abstract Testnet</span>
              </div>
              <div className="text-2xl font-bold">$1,200</div>
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
            </CardContent>
          </Card>

          <Card className="cyber-border bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <span className="text-sm font-medium">0G Galileo</span>
              </div>
              <div className="text-2xl font-bold">$150</div>
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
            </CardContent>
          </Card>

          <Card className="cyber-border bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
                <span className="text-sm font-medium">Somnia Testnet</span>
              </div>
              <div className="text-2xl font-bold">$25</div>
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
