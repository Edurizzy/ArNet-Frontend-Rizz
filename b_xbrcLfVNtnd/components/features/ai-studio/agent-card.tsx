'use client'

import { cn } from '@/lib/utils'
import type { OperationalAgent, AgentLifecycleState } from '@/types/ai-studio'
import { 
  Bot, 
  Activity, 
  Clock, 
  Zap, 
  AlertTriangle,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const lifecycleConfig: Record<AgentLifecycleState, { 
  label: string
  color: string
  bgColor: string
  dotColor: string
  pulse: boolean
}> = {
  active: {
    label: 'Ativo',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    pulse: true,
  },
  idle: {
    label: 'Ocioso',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10 border-zinc-500/30',
    dotColor: 'bg-zinc-500',
    pulse: false,
  },
  processing: {
    label: 'Processando',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    dotColor: 'bg-blue-500',
    pulse: true,
  },
  degraded: {
    label: 'Degradado',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    dotColor: 'bg-amber-500',
    pulse: false,
  },
  offline: {
    label: 'Offline',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    dotColor: 'bg-red-500',
    pulse: false,
  },
  warmup: {
    label: 'Aquecendo',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    dotColor: 'bg-orange-500',
    pulse: true,
  },
}

interface AgentCardProps {
  agent: OperationalAgent
  onSelect?: (agent: OperationalAgent) => void
  isSelected?: boolean
}

export function AgentCard({ agent, onSelect, isSelected }: AgentCardProps) {
  const lifecycle = lifecycleConfig[agent.lifecycleState]
  const isOperational = agent.lifecycleState === 'active' || agent.lifecycleState === 'processing'
  
  const formatLatency = (ms: number) => {
    if (ms === 0) return '--'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }
  
  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }
  
  const formatLastExecution = (date: Date | null) => {
    if (!date) return 'Nunca'
    const diff = Date.now() - date.getTime()
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
    return `${Math.floor(diff / 86400000)}d atrás`
  }

  return (
    <div 
      onClick={() => onSelect?.(agent)}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-zinc-900/50 p-4 transition-all duration-200",
        isSelected
          ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
          : isOperational
            ? "border-zinc-800/50 hover:border-emerald-500/30"
            : "border-zinc-800/50 hover:border-zinc-700/50"
      )}
    >
      {/* Status indicator - top right */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        {lifecycle.pulse && (
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              lifecycle.dotColor
            )} />
            <span className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              lifecycle.dotColor
            )} />
          </span>
        )}
        <Badge 
          variant="outline" 
          className={cn("border text-xs font-mono", lifecycle.bgColor, lifecycle.color)}
        >
          {lifecycle.label}
        </Badge>
      </div>

      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          isOperational 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "bg-zinc-800/50 text-zinc-500"
        )}>
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1 pr-20">
          <h3 className="font-semibold text-zinc-100">{agent.name}</h3>
          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
            {agent.description}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-3 grid grid-cols-4 gap-3">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <Zap className="h-3 w-3" />
            <span>Infer.</span>
          </div>
          <p className="mt-0.5 font-mono text-sm font-medium text-zinc-300">
            {formatNumber(agent.totalInferences)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <Clock className="h-3 w-3" />
            <span>Latência</span>
          </div>
          <p className="mt-0.5 font-mono text-sm font-medium text-zinc-300">
            {formatLatency(agent.avgLatencyMs)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <Activity className="h-3 w-3" />
            <span>Conf.</span>
          </div>
          <p className={cn(
            "mt-0.5 font-mono text-sm font-medium",
            agent.confidenceScore >= 90 
              ? "text-emerald-400" 
              : agent.confidenceScore >= 70 
                ? "text-amber-400" 
                : "text-red-400"
          )}>
            {agent.confidenceScore > 0 ? `${agent.confidenceScore}%` : '--'}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <AlertTriangle className="h-3 w-3" />
            <span>Erro</span>
          </div>
          <p className={cn(
            "mt-0.5 font-mono text-sm font-medium",
            agent.errorRate <= 1 
              ? "text-emerald-400" 
              : agent.errorRate <= 5 
                ? "text-amber-400" 
                : "text-red-400"
          )}>
            {agent.errorRate > 0 ? `${agent.errorRate.toFixed(1)}%` : '--'}
          </p>
        </div>
      </div>

      {/* Model & Last Execution */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-zinc-400">
          {agent.model.name}
        </span>
        <span className="text-zinc-600">
          Última exec: {formatLastExecution(agent.lastExecutionAt)}
        </span>
      </div>

      {/* Active Inferences Indicator */}
      {agent.activeInferences > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/5 px-3 py-2 text-xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-emerald-400">
            {agent.activeInferences} inferência{agent.activeInferences > 1 ? 's' : ''} ativa{agent.activeInferences > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "border-zinc-800 text-xs h-7 px-2",
              isOperational 
                ? "bg-zinc-900 text-amber-400 hover:bg-zinc-800" 
                : "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {isOperational ? (
              <>
                <Pause className="mr-1 h-3 w-3" /> Pausar
              </>
            ) : (
              <>
                <Play className="mr-1 h-3 w-3" /> Ativar
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 h-7 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings className="mr-1 h-3 w-3" /> Config
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
