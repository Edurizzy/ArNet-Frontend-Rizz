'use client'

import { cn } from '@/lib/utils'

interface AIConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low'
  source?: string
}

const confidenceLabels: Record<string, string> = {
  high: 'Alta Confiança',
  medium: 'Média Confiança',
  low: 'Baixa Confiança',
}

const confidenceColors: Record<string, string> = {
  high: 'text-emerald-400',
  medium: 'text-amber-400',
  low: 'text-red-400',
}

export function AIConfidenceBadge({ confidence, source }: AIConfidenceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px]",
        confidenceColors[confidence]
      )}
    >
      <span className="font-medium">{source || 'Agente Autônomo'}</span>
      <span className="text-zinc-600">—</span>
      <span>{confidenceLabels[confidence]}</span>
    </span>
  )
}
