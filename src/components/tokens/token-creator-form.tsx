
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Upload } from "lucide-react"

export function TokenCreatorForm() {
  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Token Creator
        </CardTitle>
        <CardDescription>Create and deploy your custom token across supported chains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="token-name">Token Name</Label>
            <Input id="token-name" placeholder="e.g., My Awesome Token" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token-symbol">Token Symbol</Label>
            <Input id="token-symbol" placeholder="e.g., MAT" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total-supply">Total Supply</Label>
          <Input id="total-supply" type="number" placeholder="e.g., 1000000" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe your token's purpose and features..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deployment-chain">Deployment Chain</Label>
          <Select defaultValue="auto">
            <SelectTrigger>
              <SelectValue placeholder="Select deployment chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-select (Recommended)</SelectItem>
              <SelectItem value="risechain">RiseChain Testnet</SelectItem>
              <SelectItem value="abstract">Abstract Testnet</SelectItem>
              <SelectItem value="0g">0G Galileo Testnet</SelectItem>
              <SelectItem value="somnia">Somnia Testnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Token Features</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mintable</Label>
              <p className="text-xs text-muted-foreground">Allow additional tokens to be minted</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Burnable</Label>
              <p className="text-xs text-muted-foreground">Allow tokens to be burned</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pausable</Label>
              <p className="text-xs text-muted-foreground">Allow contract to be paused</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Token Logo</Label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </Button>
            <span className="text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
            <h4 className="text-sm font-medium text-primary mb-2">Estimated Deployment Cost</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Gas Fee:</span>
                <span className="ml-2">0.005 ETH</span>
              </div>
              <div>
                <span className="text-muted-foreground">Platform Fee:</span>
                <span className="ml-2">0.001 ETH</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Total:</span>
              <span className="ml-2 font-medium">0.006 ETH (~$12.50)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">Deploy Token</Button>
          <Button variant="outline">Save Draft</Button>
        </div>
      </CardContent>
    </Card>
  )
}
