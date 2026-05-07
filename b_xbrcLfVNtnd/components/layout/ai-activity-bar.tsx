'use client'

import { Bot, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSystemStatusStore } from '@/stores/app-store'

export function AIActivityBar() {
  const { status, isConnecting } = useSystemStatusStore()

  const getAIStatus = () => {
    if (isConnecting || !status) {
      return { label: 'Inicializando...', active: 0, total: 0 }
    }
    return {
      label: 'Agentes de IA: Operantes',
      active: status.aiAgentsActive,
      total: status.aiAgentsTotal,
    }
  }

  const aiStatus = getAIStatus()
  const isOperational = !isConnecting && status && status.aiAgentsActive > 0

  return (
    <footer className={cn(
      "flex h-10 items-center justify-between",
      "border-t border-zinc-800/50 bg-zinc-900/50 px-4",
      "text-xs text-zinc-500"
    )}>
      <div className="flex items-center gap-4">
        {/* AI Status */}
        <div className="flex items-center gap-2">
          <Bot className={cn(
            "h-3.5 w-3.5",
            isOperational ? "text-emerald-400" : "text-zinc-600"
          )} />
          <span className={cn(
            isOperational ? "text-zinc-300" : "text-zinc-500"
          )}>
            {aiStatus.label}
          </span>
          {isOperational && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-400">
              {aiStatus.active}/{aiStatus.total}
            </span>
          )}
        </div>

        {/* Activity indicator */}
        {isOperational && (
          <div className="flex items-center gap-2 text-zinc-500">
            <Activity className="h-3 w-3" />
            <span>Processando em tempo real</span>
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" style={{ animationDelay: '0ms' }} />
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" style={{ animationDelay: '150ms' }} />
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-zinc-600">
        <span>ArNet v1.0.0</span>
        <span>•</span>
        <span>© 2024</span>
      </div>
    </footer>
  )
}
