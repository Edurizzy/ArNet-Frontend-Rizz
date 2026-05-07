'use client'

import { cn } from '@/lib/utils'
import type { BillingStatus } from '@/types/crm'

interface FinancialStatusBadgeProps {
  status: BillingStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<BillingStatus, { label: string; className: string }> = {
  'em-dia': {
    label: 'Em dia',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  'atrasado': {
    label: 'Atrasado',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  'suspenso': {
    label: 'Suspenso',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  'cancelado': {
    label: 'Cancelado',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
}

export function FinancialStatusBadge({ status, size = 'sm' }: FinancialStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          status === 'em-dia' && 'bg-emerald-400',
          status === 'atrasado' && 'bg-amber-400',
          status === 'suspenso' && 'bg-red-400',
          status === 'cancelado' && 'bg-zinc-400'
        )}
      />
      {config.label}
    </span>
  )
}
