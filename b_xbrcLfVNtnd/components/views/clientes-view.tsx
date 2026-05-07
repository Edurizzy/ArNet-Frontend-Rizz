'use client'

import { Suspense, useState, useEffect } from 'react'
import { 
  Users, 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Building2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCustomers, getCustomerStats } from '@/services/mock-api'
import type { Customer } from '@/types/domain'
import { PageSkeleton, TableSkeleton } from '@/components/shared/loading-states'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const segmentLabels: Record<string, string> = {
  enterprise: 'Enterprise',
  'mid-market': 'Mid-Market',
  'small-business': 'PME',
  individual: 'Individual',
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  inactive: 'bg-zinc-500/20 text-zinc-400',
  churned: 'bg-red-500/20 text-red-400',
  prospect: 'bg-blue-500/20 text-blue-400',
}

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  churned: 'Churn',
  prospect: 'Prospect',
}

function CustomerRow({ customer }: { customer: Customer }) {
  const healthColor = customer.healthScore >= 80 
    ? 'text-emerald-400' 
    : customer.healthScore >= 60 
      ? 'text-yellow-400' 
      : 'text-red-400'

  return (
    <div className={cn(
      "group flex items-center gap-4 border-b border-zinc-800/30 p-4",
      "transition-colors hover:bg-zinc-800/20 last:border-0"
    )}>
      {/* Avatar */}
      <Avatar className="h-10 w-10 border border-zinc-700">
        <AvatarFallback className="bg-zinc-800 text-sm font-medium text-zinc-300">
          {customer.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-200 truncate">{customer.name}</span>
          <Badge variant="outline" className="border-zinc-700 text-xs text-zinc-500">
            {segmentLabels[customer.segment]}
          </Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-zinc-500">
          {customer.company && (
            <>
              <Building2 className="h-3 w-3" />
              <span className="truncate">{customer.company}</span>
            </>
          )}
        </div>
      </div>

      {/* Health score */}
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-1">
          {customer.healthScore >= 70 ? (
            <TrendingUp className={cn("h-4 w-4", healthColor)} />
          ) : (
            <TrendingDown className={cn("h-4 w-4", healthColor)} />
          )}
          <span className={cn("text-sm font-medium", healthColor)}>
            {customer.healthScore}%
          </span>
        </div>
      </div>

      {/* Revenue */}
      <div className="hidden text-right lg:block">
        <span className="text-sm font-medium text-zinc-200">
          {customer.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* Status */}
      <span className={cn(
        "rounded-full px-2.5 py-1 text-xs",
        statusColors[customer.status]
      )}>
        {statusLabels[customer.status]}
      </span>

      {/* Actions */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface Stats {
  total: number
  active: number
  atRisk: number
  avgHealthScore: number
}

function ClientesContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [customersResult, statsResult] = await Promise.all([
          getCustomers(),
          getCustomerStats(),
        ])
        setCustomers(customersResult)
        setStats(statsResult)
      } catch (error) {
        console.error('Failed to load customers:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-32 rounded bg-zinc-800 animate-pulse" />
            <div className="mt-2 h-4 w-48 rounded bg-zinc-800/60 animate-pulse" />
          </div>
        </div>
        <TableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Clientes</h1>
          <p className="text-sm text-zinc-500">
            {stats?.total || 0} clientes • {stats?.active || 0} ativos • {stats?.atRisk || 0} em risco
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input 
              placeholder="Buscar clientes..." 
              className="w-64 border-zinc-800 bg-zinc-900 pl-9 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700"
            />
          </div>
          <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Total de Clientes</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{stats?.total || 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Clientes Ativos</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{stats?.active || 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Em Risco</p>
          <p className="mt-1 text-2xl font-semibold text-red-400">{stats?.atRisk || 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Health Score Médio</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{stats?.avgHealthScore || 0}%</p>
        </div>
      </div>

      {/* Customers list */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <CustomerRow key={customer.id} customer={customer} />
          ))
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Users className="mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Placeholder */}
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
        <Users className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
        <p className="text-sm font-medium text-zinc-500">Módulo em Construção</p>
        <p className="text-xs text-zinc-600">Detalhes do cliente, histórico e análise de churn</p>
      </div>
    </div>
  )
}

export function ClientesView() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ClientesContent />
    </Suspense>
  )
}
