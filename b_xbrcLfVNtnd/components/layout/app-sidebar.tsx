'use client'

import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Bot,
  Workflow,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/app-store'
import type { NavigationRoute } from '@/types/domain'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

interface NavItem {
  id: NavigationRoute
  label: string
  icon: typeof LayoutDashboard
  badge?: number
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'atendimento', label: 'Atendimento', icon: MessageSquare, badge: 3 },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'ai-studio', label: 'AI Studio', icon: Bot },
  { id: 'automacoes', label: 'Automações', icon: Workflow },
]

export function AppSidebar() {
  const { currentRoute, setCurrentRoute } = useNavigationStore()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-zinc-800/50 bg-zinc-900/50"
    >
      <SidebarHeader className="border-b border-zinc-800/50 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "bg-gradient-to-br from-emerald-500 to-teal-600",
            "text-white font-bold text-sm"
          )}>
            AR
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100">ArNet</span>
              <span className="text-xs text-zinc-500">Enterprise Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentRoute === item.id
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setCurrentRoute(item.id)}
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "relative h-10 gap-3 px-3 transition-all duration-200",
                    "hover:bg-zinc-800/60 hover:text-zinc-100",
                    isActive && "bg-zinc-800/80 text-emerald-400 font-medium",
                    isActive && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                    isActive && "before:h-5 before:w-0.5 before:rounded-r before:bg-emerald-500"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-emerald-400" : "text-zinc-400"
                  )} />
                  <span className={cn(
                    "truncate",
                    isCollapsed && "sr-only"
                  )}>
                    {item.label}
                  </span>
                  {item.badge && !isCollapsed && (
                    <span className={cn(
                      "ml-auto flex h-5 min-w-5 items-center justify-center",
                      "rounded-full bg-emerald-500/20 px-1.5",
                      "text-xs font-medium text-emerald-400"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800/50 px-3 py-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Operante</span>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
