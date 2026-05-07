'use client'

import { Calendar, CreditCard, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubscriptionDetails, PaymentState } from '@/types/crm'

interface SubscriptionCardProps {
  subscription: SubscriptionDetails
  payment: PaymentState
}

export function SubscriptionCard({ subscription, payment }: SubscriptionCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  const statusColors = {
    active: 'border-emerald-500/30 bg-emerald-950/20',
    pending: 'border-amber-500/30 bg-amber-950/20',
    suspended: 'border-red-500/30 bg-red-950/20',
    cancelled: 'border-zinc-500/30 bg-zinc-800/20',
  }

  const statusLabels = {
    active: 'Ativo',
    pending: 'Pendente',
    suspended: 'Suspenso',
    cancelled: 'Cancelado',
  }

  return (
    <div className={cn(
      "rounded-lg border p-4",
      statusColors[subscription.status]
    )}>
      {/* Plan Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-zinc-100">
            {subscription.planName}
          </h4>
          {subscription.speed && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Velocidade: {subscription.speed}
            </p>
          )}
        </div>
        <span className={cn(
          "px-2 py-0.5 text-xs font-medium rounded-full",
          subscription.status === 'active' && 'bg-emerald-500/20 text-emerald-400',
          subscription.status === 'pending' && 'bg-amber-500/20 text-amber-400',
          subscription.status === 'suspended' && 'bg-red-500/20 text-red-400',
          subscription.status === 'cancelled' && 'bg-zinc-500/20 text-zinc-400',
        )}>
          {statusLabels[subscription.status]}
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-bold text-zinc-100">
          {formatCurrency(subscription.monthlyPrice)}
        </span>
        <span className="text-sm text-zinc-500">/mês</span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>Vencimento: dia {subscription.billingCycleDay}</span>
        </div>
        
        <div className="flex items-center gap-2 text-zinc-400">
          <CreditCard className="h-3.5 w-3.5" />
          <span>
            {payment.paymentMethod === 'pix' && 'PIX'}
            {payment.paymentMethod === 'boleto' && 'Boleto'}
            {payment.paymentMethod === 'cartao' && 'Cartão de Crédito'}
            {payment.paymentMethod === 'debito-automatico' && 'Débito Automático'}
          </span>
        </div>

        {payment.overdueAmount > 0 && (
          <div className="flex items-center gap-2 text-red-400 mt-3 pt-3 border-t border-red-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {formatCurrency(payment.overdueAmount)} em atraso ({payment.overdueDays} dias)
            </span>
          </div>
        )}
      </div>

      {/* Contract Period */}
      <div className="mt-4 pt-3 border-t border-zinc-700/30 text-xs text-zinc-500">
        <p>
          Contrato: {formatDate(subscription.contractStart)}
          {subscription.contractEnd && ` até ${formatDate(subscription.contractEnd)}`}
        </p>
      </div>
    </div>
  )
}
