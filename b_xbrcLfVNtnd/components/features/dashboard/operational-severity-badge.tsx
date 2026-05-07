'use client'

import { cn } from '@/lib/utils'
import type { SeverityLevel } from '@/types/dashboard'

interface OperationalSeverityBadgeProps {
  severity: SeverityLevel
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const severityConfig = {
  critical: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    text: 'text-red-400',
    label: 'Crítico',
  },
  warning: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    text: 'text-amber-400',
    label: 'Atenção',
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
    text: 'text-blue-400',
    label: 'Info',
  },
  success: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
    text: 'text-emerald-400',
    label: 'OK',
  },
}

export function OperationalSeverityBadge({ 
  severity, 
  size = 'sm',
  showLabel = false
}: OperationalSeverityBadgeProps) {
  const config = severityConfig[severity]
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
  
  if (showLabel) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 border",
        config.bg,
        config.border
      )}>
        <span className={cn("rounded-full", dotSize, config.dot)} />
        <span className={cn("text-[10px] font-medium", config.text)}>
          {config.label}
        </span>
      </div>
    )
  }
  
  return (
    <span className={cn(
      "flex-shrink-0 rounded-full",
      dotSize,
      config.dot,
      severity === 'critical' && "animate-pulse"
    )} />
  )
}
