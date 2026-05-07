'use client'

import { 
  Server, 
  Wifi, 
  Database, 
  Cpu, 
  HardDrive,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSystemHealthStore, useDashboardUiStore } from '@/stores/dashboard-store'
import { OperationalSeverityBadge } from './operational-severity-badge'
import { WidgetSkeleton } from './widget-skeleton'
import type { SystemComponent, SystemHealthState } from '@/types/dashboard'

const statusConfig: Record<SystemHealthState, { 
  label: string
  color: string
  severity: 'success' | 'warning' | 'critical' | 'info'
}> = {
  healthy: { label: 'Operacional', color: 'text-emerald-400', severity: 'success' },
  degraded: { label: 'Degradado', color: 'text-amber-400', severity: 'warning' },
  critical: { label: 'Crítico', color: 'text-red-400', severity: 'critical' },
  offline: { label: 'Offline', color: 'text-red-500', severity: 'critical' },
  unknown: { label: 'Desconhecido', color: 'text-zinc-500', severity: 'info' },
}

const componentIcons: Record<string, typeof Server> = {
  wss: Wifi,
  'ai-inference': Cpu,
  'queue-processor': Activity,
  'background-workers': Activity,
  'vector-db': Database,
  redis: Database,
  postgres: Database,
  cdn: Server,
}

interface ComponentStatusRowProps {
  component: SystemComponent
}

function ComponentStatusRow({ component }: ComponentStatusRowProps) {
  const Icon = componentIcons[component.id] || Server
  const config = statusConfig[component.status]
  
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-md transition-colors",
      "hover:bg-zinc-800/30",
      component.status === 'critical' && "bg-red-500/5"
    )}>
      <div className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-300">{component.name}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Latency */}
        {component.latency !== undefined && (
          <span className={cn(
            "text-[10px] font-mono tabular-nums",
            component.latency > 200 ? "text-amber-400" : "text-zinc-500"
          )}>
            {component.latency}ms
          </span>
        )}
        
        {/* Uptime */}
        {component.uptime !== undefined && (
          <span className={cn(
            "text-[10px] font-mono tabular-nums",
            component.uptime < 99 ? "text-amber-400" : "text-zinc-500"
          )}>
            {component.uptime.toFixed(1)}%
          </span>
        )}
        
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <OperationalSeverityBadge severity={config.severity} />
          <span className={cn("text-[10px] font-medium", config.color)}>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  )
}

export function SystemHealthPanel() {
  const { health, state } = useSystemHealthStore()
  const { healthPanelExpanded, setHealthPanelExpanded } = useDashboardUiStore()

  if (state === 'loading' || !health) {
    return <WidgetSkeleton className="h-16" />
  }

  const overallConfig = statusConfig[health.overall]
  const healthyCount = health.components.filter((c) => c.status === 'healthy').length
  const totalCount = health.components.length

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30">
      {/* Header - Always visible */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/20 transition-colors"
        onClick={() => setHealthPanelExpanded(!healthPanelExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-200">
              Saúde do Sistema
            </span>
          </div>
          
          <OperationalSeverityBadge severity={overallConfig.severity} showLabel />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 font-mono">
            {healthyCount}/{totalCount} componentes OK
          </span>
          {healthPanelExpanded ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </button>
      
      {/* Expanded content */}
      {healthPanelExpanded && (
        <div className="border-t border-zinc-800/50 px-1 py-2">
          <div className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-4">
            {health.components.map((component) => (
              <ComponentStatusRow key={component.id} component={component} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
