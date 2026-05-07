'use client'

import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SLAInfo } from '@/types/atendimento'

interface SLATimerProps {
  slaInfo: SLAInfo
}

export function SLATimer({ slaInfo }: SLATimerProps) {
  const { remainingMinutes, status } = slaInfo

  const formatTime = (minutes: number): string => {
    if (minutes < 0) return `${Math.abs(minutes)}m atrasado`
    if (minutes < 60) return `${minutes}m restantes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m restantes`
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        status === 'on-track' && "bg-zinc-800/50 text-zinc-400",
        status === 'warning' && "bg-amber-500/10 text-amber-400",
        status === 'breached' && "bg-red-500/10 text-red-400"
      )}
    >
      {status === 'breached' ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      <span>SLA: {formatTime(remainingMinutes)}</span>
    </div>
  )
}
