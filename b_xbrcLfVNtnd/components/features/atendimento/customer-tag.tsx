'use client'

import { cn } from '@/lib/utils'

interface CustomerTagProps {
  tag: string
}

// Map common tags to colors
const tagColors: Record<string, string> = {
  'suporte técnico': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'queda de rede': 'bg-red-500/20 text-red-400 border-red-500/30',
  'cliente premium': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'risco de churn': 'bg-red-500/20 text-red-400 border-red-500/30',
  'retenção urgente': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'financeiro': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'interesse em upgrade': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'novo cliente': 'bg-green-500/20 text-green-400 border-green-500/30',
  'instalação pendente': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export function CustomerTag({ tag }: CustomerTagProps) {
  const normalizedTag = tag.toLowerCase()
  const colorClass = tagColors[normalizedTag] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium",
        colorClass
      )}
    >
      {tag}
    </span>
  )
}
