'use client'

import { Mail, Phone, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomerTag } from './customer-tag'
import { useActiveConversationStore } from '@/stores/atendimento-store'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const sentimentLabels: Record<string, { label: string; color: string }> = {
  positive: { label: 'Positivo', color: 'bg-emerald-500/20 text-emerald-400' },
  neutral: { label: 'Neutro', color: 'bg-zinc-500/20 text-zinc-400' },
  negative: { label: 'Negativo', color: 'bg-amber-500/20 text-amber-400' },
  irritated: { label: 'Irritado', color: 'bg-red-500/20 text-red-400' },
}

const subscriptionStatusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'text-emerald-400' },
  pending: { label: 'Pendente', color: 'text-amber-400' },
  suspended: { label: 'Suspenso', color: 'text-red-400' },
  cancelled: { label: 'Cancelado', color: 'text-zinc-500' },
}

function CustomerContextSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Profile skeleton */}
      <div className="flex flex-col items-center space-y-3">
        <Skeleton className="h-16 w-16 rounded-full bg-zinc-800" />
        <Skeleton className="h-5 w-32 bg-zinc-800" />
        <Skeleton className="h-3 w-24 bg-zinc-800/60" />
      </div>

      <Skeleton className="h-px w-full bg-zinc-800/30" />

      {/* Details skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20 bg-zinc-800" />
        <Skeleton className="h-3 w-full bg-zinc-800/60" />
        <Skeleton className="h-3 w-full bg-zinc-800/60" />
      </div>
    </div>
  )
}

function EmptyCustomerState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-zinc-600">
        Selecione uma conversa para ver os dados do cliente
      </p>
    </div>
  )
}

export function CustomerContext() {
  const { customerProfile, isLoadingProfile } = useActiveConversationStore()

  if (isLoadingProfile) {
    return (
      <ScrollArea className="h-full">
        <CustomerContextSkeleton />
      </ScrollArea>
    )
  }

  if (!customerProfile) {
    return <EmptyCustomerState />
  }

  const sentiment = customerProfile.sentiment
    ? sentimentLabels[customerProfile.sentiment]
    : null

  const subscriptionStatus = customerProfile.subscription?.status
    ? subscriptionStatusLabels[customerProfile.subscription.status]
    : null

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* Customer Profile Section */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <Avatar className="h-16 w-16 border-2 border-zinc-700/50">
            <AvatarFallback className="bg-zinc-800 text-lg font-medium text-zinc-200">
              {getInitials(customerProfile.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold text-zinc-100">
              {customerProfile.name}
            </h3>
            {customerProfile.cpfCnpj && (
              <p className="mt-0.5 text-xs text-zinc-500">
                {customerProfile.cpfCnpj}
              </p>
            )}
          </div>

          {/* Sentiment badge */}
          {sentiment && (
            <Badge
              variant="secondary"
              className={cn(
                "h-6 rounded-full px-2.5 text-xs font-normal",
                sentiment.color
              )}
            >
              Sentimento: {sentiment.label}
            </Badge>
          )}
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Contato
          </h4>
          <div className="space-y-2">
            {customerProfile.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-zinc-600" />
                <span className="truncate text-zinc-300">
                  {customerProfile.email}
                </span>
              </div>
            )}
            {customerProfile.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-zinc-600" />
                <span className="text-zinc-300">{customerProfile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription info */}
        {customerProfile.subscription && (
          <>
            <Separator className="bg-zinc-800/50" />

            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Assinatura Ativa
              </h4>

              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 space-y-2.5">
                {/* Plan name and status */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-200">
                    {customerProfile.subscription.planName}
                  </span>
                  {subscriptionStatus && (
                    <span className={cn("text-xs font-medium", subscriptionStatus.color)}>
                      {subscriptionStatus.label}
                    </span>
                  )}
                </div>

                {/* Plan value */}
                {customerProfile.subscription.monthlyValue && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <CreditCard className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      {formatCurrency(customerProfile.subscription.monthlyValue)}/mês
                    </span>
                  </div>
                )}

                {/* Next billing */}
                {customerProfile.subscription.nextBillingDate && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      Próx. cobrança: {formatDate(customerProfile.subscription.nextBillingDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tags */}
        {customerProfile.tags && customerProfile.tags.length > 0 && (
          <>
            <Separator className="bg-zinc-800/50" />

            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Tags Operacionais
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {customerProfile.tags.map((tag, index) => (
                  <CustomerTag key={index} tag={tag} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  )
}
