'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { helpdeskSocket } from '@/lib/realtime/helpdesk-socket'
import { initAuthCrossTabSync, useAuthStore } from '@/stores/useAuthStore'

interface AuthBootstrapProps {
  children: React.ReactNode
}

function AuthLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400 shadow-2xl shadow-black/30">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        Validando sessão segura...
      </div>
    </div>
  )
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth)

  useEffect(() => {
    initAuthCrossTabSync()
    void hydrateAuth()
  }, [hydrateAuth])

  useEffect(() => {
    return useAuthStore.subscribe((state, previousState) => {
      if (!previousState.isAuthenticated && state.isAuthenticated) {
        helpdeskSocket.reconnectWithLatestAuth('manual')
        return
      }

      if (previousState.accessToken && state.accessToken && previousState.accessToken !== state.accessToken) {
        helpdeskSocket.reconnectWithLatestAuth('manual')
        return
      }

      if (previousState.isAuthenticated && !state.isAuthenticated) {
        helpdeskSocket.forceDisconnect()
      }
    })
  }, [])

  if (!isHydrated) return <AuthLoadingFallback />

  return <>{children}</>
}
