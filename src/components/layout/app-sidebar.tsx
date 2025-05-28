
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Factory, 
  TrendingUp, 
  Users, 
  Trophy, 
  BarChart3, 
  Settings,
  Zap,
  ArrowLeftRight
} from "lucide-react"
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Token Factory",
    url: "/tokens",
    icon: Factory,
  },
  {
    title: "Trading Hub",
    url: "/trading",
    icon: TrendingUp,
  },
  {
    title: "Cross-Chain Bridge",
    url: "/bridge",
    icon: ArrowLeftRight,
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
  },
  {
    title: "Quests",
    url: "/quests",
    icon: Trophy,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

const utilityItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold cyber-text">SCRYPTEX</h2>
            <p className="text-xs text-muted-foreground">Multi-Chain Platform</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:cyber-glow transition-all duration-300"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Utilities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            Multi-Chain Farming v1.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
