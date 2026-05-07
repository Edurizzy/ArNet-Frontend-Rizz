'use client'

import { Wifi, WifiOff, Activity, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRealtimeStatusStore } from '@/stores/dashboard-store'
import { LivePulseIndicator } from './live-pulse-indicator'

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

const qualityColors = {
  excellent: 'text-emerald-400',
  good: 'text-emerald-400',
  fair: 'text-amber-400',
  poor: 'text-red-400',
}

export function RealtimeStatusBar() {
  const { status } = useRealtimeStatusStore()

  if (!status) {
    return (
      <div className="flex-shrink-0 border-t border-zinc-800/60 bg-zinc-950/80 px-4 py-1.5">
        <div className="h-4 w-48 rounded bg-zinc-800/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 border-t border-zinc-800/60 bg-zinc-950/80">
      <div className="flex items-center justify-between px-4 py-1.5">
        {/* Left side - Connection status */}
        <div className="flex items-center gap-4">
          {/* WSS Status */}
          <div className="flex items-center gap-1.5">
            {status.wssConnected ? (
              <>
                <LivePulseIndicator color="emerald" />
                <Wifi className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400">WSS</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-400" />
                <span className="text-[10px] font-mono text-red-400">DESCONECTADO</span>
              </>
            )}
          </div>
          
          {/* Connection quality */}
          <div className="flex items-center gap-1 text-[10px]">
            <Activity className="h-3 w-3 text-zinc-500" />
            <span className={cn("font-mono uppercase", qualityColors[status.connectionQuality])}>
              {status.connectionQuality}
            </span>
          </div>
        </div>
        
        {/* Right side - Metrics */}
        <div className="flex items-center gap-4">
          {/* Event rate */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-500">
            <Zap className="h-3 w-3" />
            <span className="font-mono tabular-nums">
              {status.eventIngestionRate} evt/min
            </span>
          </div>
          
          {/* Refresh cadence */}
          <div className="hidden md:flex items-center gap-1 text-[10px] text-zinc-500">
            <span className="font-mono">
              Refresh: {status.refreshCadence}s
            </span>
          </div>
          
          {/* Pending events */}
          {status.pendingEvents > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400">
              <span className="font-mono tabular-nums">
                {status.pendingEvents} pendentes
              </span>
            </div>
          )}
          
          {/* Last sync */}
          <div className="flex items-center gap-1 text-[10px] text-zinc-600">
            <Clock className="h-3 w-3" />
            <span className="font-mono tabular-nums">
              {formatTimestamp(status.lastSync)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
