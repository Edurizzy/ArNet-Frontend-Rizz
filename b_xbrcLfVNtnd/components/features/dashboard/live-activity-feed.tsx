'use client'

import { Pause, Play, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useActivityFeedStore, useDashboardUiStore } from '@/stores/dashboard-store'
import { OperationalSeverityBadge } from './operational-severity-badge'
import { LivePulseIndicator } from './live-pulse-indicator'
import { WidgetSkeleton } from './widget-skeleton'
import type { ActivityEvent } from '@/types/dashboard'

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

const sourceModuleLabels: Record<string, string> = {
  atendimento: 'ATD',
  crm: 'CRM',
  ai_studio: 'AI',
  infrastructure: 'INFRA',
  billing: 'BILL',
  security: 'SEC',
}

interface ActivityEventRowProps {
  event: ActivityEvent
}

function ActivityEventRow({ event }: ActivityEventRowProps) {
  return (
    <div className={cn(
      "group flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
      "hover:bg-zinc-800/30",
      !event.isRead && "bg-zinc-800/10"
    )}>
      {/* Severity indicator */}
      <OperationalSeverityBadge severity={event.severity} size="sm" />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-zinc-600 uppercase">
            {sourceModuleLabels[event.sourceModule] || event.sourceModule}
          </span>
          <span className="text-zinc-700">·</span>
          <span className="text-[9px] font-mono text-zinc-600 tabular-nums">
            {formatTimestamp(event.timestamp)}
          </span>
        </div>
        <p className="text-xs text-zinc-300 truncate mt-0.5">
          {event.title}
        </p>
      </div>
    </div>
  )
}

export function LiveActivityFeed() {
  const { events, state } = useActivityFeedStore()
  const { feedPaused, setFeedPaused } = useDashboardUiStore()

  if (state === 'loading' && events.length === 0) {
    return (
      <div className="h-[280px] rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <WidgetSkeleton className="h-4 w-24 !p-0 !border-0" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <WidgetSkeleton key={i} className="h-10 mb-1 !p-0 !border-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="h-[280px] rounded-lg border border-zinc-800/50 bg-zinc-900/30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-300">
            Atividade em Tempo Real
          </span>
          {!feedPaused && <LivePulseIndicator />}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setFeedPaused(!feedPaused)}
        >
          {feedPaused ? (
            <Play className="h-3 w-3 text-zinc-500" />
          ) : (
            <Pause className="h-3 w-3 text-zinc-500" />
          )}
        </Button>
      </div>
      
      {/* Feed content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-zinc-600">
              Nenhum evento recente
            </div>
          ) : (
            events.map((event) => (
              <ActivityEventRow key={event.id} event={event} />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer status */}
      <div className="px-3 py-1.5 border-t border-zinc-800/30 text-[9px] text-zinc-600 font-mono">
        {events.length} eventos · {feedPaused ? 'pausado' : 'ao vivo'}
      </div>
    </div>
  )
}
