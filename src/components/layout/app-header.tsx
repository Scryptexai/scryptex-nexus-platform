
"use client"

import { SidebarTrigger } from '@/components/ui/sidebar'
import { WalletConnector } from '@/components/wallet/wallet-connector'
import { NetworkStatus } from '@/components/wallet/network-status'
import { Button } from '@/components/ui/button'
import { Bell, Search } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search tokens, pools, quests..."
              className="pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NetworkStatus />
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
        </Button>
        <WalletConnector />
      </div>
    </header>
  )
}
