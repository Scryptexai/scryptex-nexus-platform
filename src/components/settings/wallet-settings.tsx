
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Wallet, ExternalLink, Shield } from "lucide-react"

export function WalletSettings() {
  const connectedWallets = [
    { name: "MetaMask", address: "0x1234...5678", chain: "RiseChain", connected: true },
    { name: "OKX Wallet", address: "0x8765...4321", chain: "Abstract", connected: true },
    { name: "Coinbase Wallet", address: "0xabcd...efgh", chain: "0G Galileo", connected: false },
  ]

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Settings
        </CardTitle>
        <CardDescription>Manage your connected wallets and security preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Connected Wallets</h4>
          {connectedWallets.map((wallet, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{wallet.name}</span>
                    <Badge variant={wallet.connected ? "default" : "outline"}>
                      {wallet.connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{wallet.address}</p>
                  <p className="text-xs text-muted-foreground">{wallet.chain}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button variant={wallet.connected ? "destructive" : "default"} size="sm">
                  {wallet.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Settings
          </h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-disconnect</Label>
              <p className="text-xs text-muted-foreground">Disconnect wallet after 1 hour of inactivity</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Transaction Confirmation</Label>
              <p className="text-xs text-muted-foreground">Require confirmation for transactions above $100</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Multi-signature</Label>
              <p className="text-xs text-muted-foreground">Enable multi-sig for large transactions</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <Button>Add Wallet</Button>
          <Button variant="outline">Import Wallet</Button>
        </div>
      </CardContent>
    </Card>
  )
}
