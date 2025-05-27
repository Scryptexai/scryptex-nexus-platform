
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Smartphone, AlertTriangle } from "lucide-react"

export function SecuritySettings() {
  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription>Manage your account security and authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4" />
            Authentication
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Enter current password" />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="Enter new password" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm new password" />
            </div>
            <Button variant="outline">Update Password</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Two-Factor Authentication
          </h4>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">2FA Status</span>
                <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Two-factor authentication is currently enabled
              </p>
            </div>
            <Button variant="outline" size="sm">Disable</Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Backup Codes</Label>
              <p className="text-xs text-muted-foreground">Generate backup authentication codes</p>
            </div>
            <Button variant="outline" size="sm">Generate</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Security Preferences</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Notifications</Label>
              <p className="text-xs text-muted-foreground">Notify about new device logins</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Timeout</Label>
              <p className="text-xs text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Whitelist</Label>
              <p className="text-xs text-muted-foreground">Only allow access from trusted IP addresses</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-orange-400">Security Recommendation</h4>
              <p className="text-xs text-muted-foreground">
                Consider enabling IP whitelist and using hardware wallets for enhanced security.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
