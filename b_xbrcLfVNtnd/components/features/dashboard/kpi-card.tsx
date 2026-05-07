'use client'

import { cn } from '@/lib/utils'
import type { KpiMetric } from '@/types/dashboard'
import { TrendIndicator } from './trend-indicator'
import { MetricSparkline } from './metric-sparkline'
import { LastUpdatedIndicator } from './last-updated-indicator'

interface KpiCardProps {
  kpi: KpiMetric
}

function formatValue(value: number, unit: KpiMetric['unit']): string {
  switch (unit) {
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'minutes':
      return `${value.toFixed(1)}m`
    case 'seconds':
      return `${value}s`
    case 'ratio':
      return value.toFixed(1)
    case 'currency':
      return `R$ ${value.toLocaleString('pt-BR')}`
    case 'count':
    default:
      return value.toLocaleString('pt-BR')
  }
}

const severityColors = {
  success: 'border-emerald-500/20 bg-emerald-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  critical: 'border-red-500/20 bg-red-500/5',
  info: 'border-zinc-700/50 bg-zinc-900/50',
}

const severityTextColors = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
  info: 'text-zinc-100',
}

export function KpiCard({ kpi }: KpiCardProps) {
  const isCritical = kpi.severity === 'critical'
  
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-3 transition-all duration-200",
        severityColors[kpi.severity],
        "hover:border-zinc-600/50",
        isCritical && "animate-pulse-subtle"
      )}
    >
      {/* Critical glow effect */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          {kpi.label}
        </span>
        <LastUpdatedIndicator timestamp={kpi.lastUpdated} />
      </div>
      
      {/* Value */}
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={cn(
          "font-mono text-xl font-semibold tabular-nums",
          severityTextColors[kpi.severity]
        )}>
          {formatValue(kpi.value, kpi.unit)}
        </span>
      </div>
      
      {/* Trend */}
      <div className="mt-1.5">
        <TrendIndicator
          direction={kpi.trend.direction}
          delta={kpi.trend.delta}
          period={kpi.trend.period}
        />
      </div>
      
      {/* Sparkline */}
      {kpi.sparkline && (
        <div className="mt-2 h-6">
          <MetricSparkline 
            data={kpi.sparkline} 
            severity={kpi.severity}
          />
        </div>
      )}
    </div>
  )
}
