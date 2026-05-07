'use client'

import { cn } from '@/lib/utils'
import type { InferenceTrace } from '@/types/ai-studio'
import { 
  Bot, 
  Clock, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Wrench,
  ChevronRight,
} from 'lucide-react'

interface InferenceFeedProps {
  traces: InferenceTrace[]
}

const statusConfig: Record<InferenceTrace['status'], {
  icon: typeof CheckCircle2
  color: string
  bgColor: string
}> = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  timeout: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
}

function InferenceTraceRow({ trace }: { trace: InferenceTrace }) {
  const status = statusConfig[trace.status]
  const StatusIcon = status.icon

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <div className={cn(
      "group flex items-center gap-3 rounded-lg border p-3 transition-all",
      trace.status === 'success' 
        ? "border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700/50"
        : trace.status === 'error'
          ? "border-red-500/30 bg-red-500/5"
          : "border-amber-500/30 bg-amber-500/5"
    )}>
      {/* Status Icon */}
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
        status.bgColor
      )}>
        <StatusIcon className={cn("h-4 w-4", status.color)} />
      </div>

      {/* Agent & Action */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-200 text-sm">{trace.agentName}</span>
          {trace.triggeredTools.length > 0 && (
            <>
              <ChevronRight className="h-3 w-3 text-zinc-600" />
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <Wrench className="h-3 w-3" />
                {trace.triggeredTools.join(', ')}
              </span>
            </>
          )}
        </div>
        {trace.errorMessage && (
          <p className="mt-0.5 text-xs text-red-400 truncate">{trace.errorMessage}</p>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Confidence */}
        <div className="text-right w-12">
          <p className={cn(
            "font-mono text-xs font-medium",
            trace.confidenceScore >= 90 
              ? "text-emerald-400" 
              : trace.confidenceScore >= 70 
                ? "text-amber-400" 
                : "text-red-400"
          )}>
            {trace.confidenceScore}%
          </p>
        </div>

        {/* Tokens */}
        <div className="text-right w-16">
          <p className="font-mono text-xs text-zinc-400">
            {trace.tokenUsage.totalTokens.toLocaleString()} tok
          </p>
        </div>

        {/* Duration */}
        <div className="text-right w-14">
          <p className="font-mono text-xs text-zinc-400 flex items-center justify-end gap-1">
            <Clock className="h-3 w-3" />
            {trace.durationMs}ms
          </p>
        </div>

        {/* Timestamp */}
        <div className="text-right w-16">
          <p className="font-mono text-xs text-zinc-600">
            {formatTime(trace.timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function InferenceFeed({ traces }: InferenceFeedProps) {
  if (traces.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
        <Bot className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
        <p className="text-sm text-zinc-500">Nenhuma inferência recente</p>
        <p className="text-xs text-zinc-600">As inferências aparecerão aqui em tempo real</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-600">
        <div className="w-8" />
        <div className="flex-1">Agente / Ação</div>
        <div className="w-12 text-right">Conf.</div>
        <div className="w-16 text-right">Tokens</div>
        <div className="w-14 text-right">Tempo</div>
        <div className="w-16 text-right">Hora</div>
      </div>
      
      {/* Traces */}
      <div className="space-y-1.5">
        {traces.map((trace) => (
          <InferenceTraceRow key={trace.id} trace={trace} />
        ))}
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-zinc-600">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Monitorando em tempo real
      </div>
    </div>
  )
}
