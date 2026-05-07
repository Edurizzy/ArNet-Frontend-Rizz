'use client'

import { useEffect } from 'react'
import { X, Edit, Pause, Play, MessageCircle, ExternalLink } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { FinancialStatusBadge } from './financial-status-badge'
import { SubscriptionCard } from './subscription-card'
import { OmnichannelIdentities } from './omnichannel-identities'
import { CustomerMetadata } from './customer-metadata'
import { useCustomerSelectionStore } from '@/stores/crm-store'
import { fetchCustomerById } from '@/services/crm-api'

export function CustomerDetailPanel() {
  const {
    selectedCustomerId,
    selectedCustomer,
    isLoadingCustomer,
    setSelectedCustomer,
    setLoadingCustomer,
    closeDetailPanel,
  } = useCustomerSelectionStore()

  // Fetch customer details when selection changes
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomer(null)
      return
    }

    const loadCustomer = async () => {
      setLoadingCustomer(true)
      try {
        const customer = await fetchCustomerById(selectedCustomerId)
        setSelectedCustomer(customer)
      } catch (error) {
        console.error('Failed to load customer:', error)
      } finally {
        setLoadingCustomer(false)
      }
    }

    loadCustomer()
  }, [selectedCustomerId])

  if (!selectedCustomerId) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="text-zinc-500">
          <p className="text-sm">Selecione um cliente</p>
          <p className="mt-1 text-xs">para ver os detalhes</p>
        </div>
      </div>
    )
  }

  if (isLoadingCustomer || !selectedCustomer) {
    return <CustomerDetailSkeleton />
  }

  const initials = selectedCustomer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedCustomer.avatarUrl} alt={selectedCustomer.name} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                {selectedCustomer.name}
              </h2>
              <p className="text-sm text-zinc-500">
                {selectedCustomer.type === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </p>
            </div>
          </div>
          <button
            onClick={closeDetailPanel}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status & Quick Actions */}
        <div className="mt-4 flex items-center gap-2">
          <FinancialStatusBadge status={selectedCustomer.billingStatus} size="md" />
          
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
            {selectedCustomer.billingStatus === 'suspenso' ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800"
              >
                <Play className="h-3.5 w-3.5" />
              </Button>
            ) : selectedCustomer.billingStatus !== 'cancelado' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-amber-400 hover:text-amber-300 hover:bg-zinc-800"
              >
                <Pause className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
              Informações de Contato
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">CPF/CNPJ</span>
                <span className="text-zinc-200 font-mono">{selectedCustomer.cpfCnpj}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Email</span>
                <span className="text-zinc-200">{selectedCustomer.email}</span>
              </div>
              {selectedCustomer.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Telefone</span>
                  <span className="text-zinc-200">{selectedCustomer.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-zinc-800/50" />

          {/* Subscription */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
              Assinatura
            </h3>
            <SubscriptionCard 
              subscription={selectedCustomer.subscription}
              payment={selectedCustomer.payment}
            />
          </div>

          <Separator className="bg-zinc-800/50" />

          {/* Omnichannel */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
              Canais Vinculados
            </h3>
            <OmnichannelIdentities identities={selectedCustomer.omnichannelIdentities} />
          </div>

          <Separator className="bg-zinc-800/50" />

          {/* Metadata */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
              Métricas Operacionais
            </h3>
            <CustomerMetadata metrics={selectedCustomer.metrics} />
          </div>

          {/* Notes */}
          {selectedCustomer.notes && (
            <>
              <Separator className="bg-zinc-800/50" />
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
                  Observações
                </h3>
                <p className="text-sm text-zinc-400 bg-zinc-900/50 rounded-lg p-3">
                  {selectedCustomer.notes}
                </p>
              </div>
            </>
          )}

          {/* Tags */}
          {selectedCustomer.tags.length > 0 && (
            <>
              <Separator className="bg-zinc-800/50" />
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCustomer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function CustomerDetailSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full bg-zinc-800" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-zinc-800" />
          <Skeleton className="h-3 w-24 bg-zinc-800" />
        </div>
      </div>
      <Skeleton className="h-24 w-full bg-zinc-800" />
      <Skeleton className="h-32 w-full bg-zinc-800" />
      <Skeleton className="h-20 w-full bg-zinc-800" />
    </div>
  )
}
