'use client'

import { 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Target,
  Smile,
  Meh,
  Frown,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerMetrics } from '@/types/crm'

interface CustomerMetadataProps {
  metrics: CustomerMetrics
}

export function CustomerMetadata({ metrics }: CustomerMetadataProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  const sentimentConfig = {
    positive: { icon: Smile, label: 'Positivo', color: 'text-emerald-400' },
    neutral: { icon: Meh, label: 'Neutro', color: 'text-zinc-400' },
    negative: { icon: Frown, label: 'Negativo', color: 'text-red-400' },
    unknown: { icon: Meh, label: 'Desconhecido', color: 'text-zinc-500' },
  }

  const sentiment = sentimentConfig[metrics.sentiment]
  const SentimentIcon = sentiment.icon

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* LTV */}
      <div className="rounded-lg bg-zinc-900/50 p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs text-zinc-500">LTV</span>
        </div>
        <p className="text-sm font-semibold text-zinc-100">
          {formatCurrency(metrics.ltv)}
        </p>
      </div>

      {/* Total Tickets */}
      <div className="rounded-lg bg-zinc-900/50 p-3">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs text-zinc-500">Tickets</span>
        </div>
        <p className="text-sm font-semibold text-zinc-100">
          {metrics.totalTickets}
          {metrics.openTickets > 0 && (
            <span className="ml-1 text-xs font-normal text-amber-400">
              ({metrics.openTickets} abertos)
            </span>
          )}
        </p>
      </div>

      {/* Avg Response Time */}
      <div className="rounded-lg bg-zinc-900/50 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs text-zinc-500">Tempo Médio</span>
        </div>
        <p className="text-sm font-semibold text-zinc-100">
          {metrics.avgResponseTime} min
        </p>
      </div>

      {/* SLA Compliance */}
      <div className="rounded-lg bg-zinc-900/50 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs text-zinc-500">SLA</span>
        </div>
        <p className={cn(
          "text-sm font-semibold",
          metrics.avgSlaCompliance >= 90 ? 'text-emerald-400' :
          metrics.avgSlaCompliance >= 70 ? 'text-amber-400' : 'text-red-400'
        )}>
          {metrics.avgSlaCompliance}%
        </p>
      </div>

      {/* Sentiment */}
      <div className="rounded-lg bg-zinc-900/50 p-3">
        <div className="flex items-center gap-2 mb-1">
          <SentimentIcon className={cn("h-3.5 w-3.5", sentiment.color)} />
          <span className="text-xs text-zinc-500">Sentimento</span>
        </div>
        <p className={cn("text-sm font-semibold", sentiment.color)}>
          {sentiment.label}
        </p>
      </div>

      {/* Last Contact */}
      <div className="rounded-lg bg-zinc-900/50 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs text-zinc-500">Último Contato</span>
        </div>
        <p className="text-sm font-semibold text-zinc-100">
          {formatDate(metrics.lastContactAt)}
        </p>
      </div>

      {/* Full Width - Created At */}
      <div className="col-span-2 rounded-lg bg-zinc-900/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Cliente desde</span>
          <span className="text-sm text-zinc-300">
            {formatDate(metrics.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
