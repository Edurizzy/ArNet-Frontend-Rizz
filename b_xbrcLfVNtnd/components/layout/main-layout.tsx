'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useNavigationStore, useSessionStore, useSystemStatusStore } from '@/stores/app-store'
import { getCurrentUser, getSystemStatus } from '@/services/mock-api'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { AIActivityBar } from '@/components/layout/ai-activity-bar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardView } from '@/components/views/dashboard-view'
import { AtendimentoView } from '@/components/views/atendimento-view'
import { ClientesView } from '@/components/views/clientes-view'
import { AIStudioView } from '@/components/views/ai-studio-view'
import { AutomacoesView } from '@/components/views/automacoes-view'
import { SettingsView } from '@/components/views/settings-view'

export function MainLayout() {
  const { currentRoute } = useNavigationStore()
  const { setUser } = useSessionStore()
  const { setStatus, setConnecting } = useSystemStatusStore()

  // Initialize session and system status
  useEffect(() => {
    const init = async () => {
      setConnecting(true)
      try {
        const [user, status] = await Promise.all([
          getCurrentUser(),
          getSystemStatus(),
        ])
        setUser(user)
        setStatus(status)
      } catch (error) {
        console.error('Failed to initialize:', error)
      }
    }
    init()
  }, [setUser, setStatus, setConnecting])

  // Render current view based on route
  const renderView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView />
      case 'atendimento':
        return <AtendimentoView />
      case 'clientes':
        return <ClientesView />
      case 'ai-studio':
        return <AIStudioView />
      case 'automacoes':
        return <AutomacoesView />
      case 'configuracoes':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn(
        'flex min-h-screen w-full bg-zinc-950 text-zinc-100'
      )}>
        <AppSidebar />
        <SidebarInset className="flex flex-col bg-zinc-950">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {renderView()}
          </main>
          <AIActivityBar />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
