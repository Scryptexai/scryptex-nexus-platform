
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell } from "lucide-react"

export function NotificationSettings() {
  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>Configure your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Quest Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quest Completion</Label>
              <p className="text-xs text-muted-foreground">Notify when quests are completed</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Quest Available</Label>
              <p className="text-xs text-muted-foreground">Notify when new quests are available</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quest Deadlines</Label>
              <p className="text-xs text-muted-foreground">Remind about upcoming quest deadlines</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Trading Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Price Alerts</Label>
              <p className="text-xs text-muted-foreground">Notify about significant price changes</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Transaction Status</Label>
              <p className="text-xs text-muted-foreground">Notify about transaction confirmations</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Community Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Governance Proposals</Label>
              <p className="text-xs text-muted-foreground">Notify about new governance proposals</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Community Updates</Label>
              <p className="text-xs text-muted-foreground">Notify about community announcements</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notification Frequency</Label>
          <Select defaultValue="immediate">
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
