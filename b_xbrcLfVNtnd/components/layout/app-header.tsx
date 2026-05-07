'use client'

import { Bell, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore, useSystemStatusStore } from '@/stores/app-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AppHeader() {
  const { user, isLoading: userLoading } = useSessionStore()
  const { status, isConnecting } = useSystemStatusStore()

  const getConnectionStatus = () => {
    if (isConnecting) return { label: 'Conectando...', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    if (!status) return { label: 'Desconectado', color: 'text-zinc-500', bg: 'bg-zinc-500' }
    
    switch (status.websocket) {
      case 'connected':
        return { label: 'WSS: Conectado', color: 'text-emerald-400', bg: 'bg-emerald-500' }
      case 'connecting':
        return { label: 'WSS: Conectando', color: 'text-yellow-500', bg: 'bg-yellow-500' }
      case 'error':
        return { label: 'WSS: Erro', color: 'text-red-500', bg: 'bg-red-500' }
      default:
        return { label: 'WSS: Desconectado', color: 'text-zinc-500', bg: 'bg-zinc-500' }
    }
  }

  const connectionStatus = getConnectionStatus()
  const isConnected = status?.websocket === 'connected'

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800/50 bg-zinc-900/80 px-4 backdrop-blur-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Connection status badge */}
        <div className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5",
          "border border-zinc-800 bg-zinc-900/50",
          "text-xs font-medium transition-colors"
        )}>
          {isConnected ? (
            <Wifi className={cn("h-3.5 w-3.5", connectionStatus.color)} />
          ) : (
            <WifiOff className={cn("h-3.5 w-3.5", connectionStatus.color)} />
          )}
          <span className={connectionStatus.color}>{connectionStatus.label}</span>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            connectionStatus.bg,
            isConnected && "animate-pulse shadow-[0_0_8px_2px] shadow-emerald-500/30"
          )} />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="sr-only">Notificações</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-9 items-center gap-2 rounded-lg px-2 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              {userLoading ? (
                <>
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <Avatar className="h-7 w-7 border border-zinc-700">
                    <AvatarFallback className="bg-zinc-800 text-xs font-medium text-zinc-300">
                      {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-sm font-medium">
                      {user?.name || 'Usuário'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {user?.department || 'Carregando...'}
                    </span>
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100"
          >
            <DropdownMenuLabel className="text-zinc-400">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="text-red-400 focus:bg-zinc-800 focus:text-red-300">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
