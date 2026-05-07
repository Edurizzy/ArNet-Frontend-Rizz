'use client'

import { useState } from 'react'
import { Search, Filter, Plus, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useCustomerFiltersStore, useCustomerPaginationStore } from '@/stores/crm-store'
import { mockPlans } from '@/services/crm-api'
import type { CustomerStatusFilter } from '@/types/crm'

const statusOptions: { value: CustomerStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inadimplente', label: 'Inadimplente' },
  { value: 'suspenso', label: 'Suspenso' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function CustomerFilters() {
  const { filters, setFilters, resetFilters, setSearch } = useCustomerFiltersStore()
  const { pagination } = useCustomerPaginationStore()
  const [isFiltersExpanded, setFiltersExpanded] = useState(false)

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.planId !== null,
  ].filter(Boolean).length

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleStatusChange = (status: CustomerStatusFilter) => {
    setFilters({ status })
  }

  const handlePlanChange = (planId: string | null) => {
    setFilters({ planId })
  }

  const handleClearFilters = () => {
    resetFilters()
  }

  const selectedStatusLabel = statusOptions.find((s) => s.value === filters.status)?.label || 'Status'
  const selectedPlanLabel = filters.planId
    ? mockPlans.find((p) => p.id === filters.planId)?.name || 'Plano'
    : 'Todos os Planos'

  return (
    <div className="px-6 py-4">
      {/* Header Row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">
            Base de Clientes e Assinaturas
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {pagination.totalItems} clientes cadastrados
          </p>
        </div>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ, telefone ou identificador..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:ring-emerald-600/20"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "min-w-[140px] justify-between border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
                filters.status !== 'all' && "border-emerald-600/50 text-emerald-400"
              )}
            >
              {selectedStatusLabel}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[180px] bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuLabel className="text-zinc-500 text-xs font-normal">
              Status Financeiro
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  "text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer",
                  filters.status === option.value && "text-emerald-400"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Plan Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "min-w-[160px] justify-between border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
                filters.planId && "border-emerald-600/50 text-emerald-400"
              )}
            >
              {selectedPlanLabel}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[200px] bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuLabel className="text-zinc-500 text-xs font-normal">
              Plano de Assinatura
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => handlePlanChange(null)}
              className={cn(
                "text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer",
                !filters.planId && "text-emerald-400"
              )}
            >
              Todos os Planos
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            {mockPlans.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                onClick={() => handlePlanChange(plan.id)}
                className={cn(
                  "text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer",
                  filters.planId === plan.id && "text-emerald-400"
                )}
              >
                <span>{plan.name}</span>
                <span className="ml-auto text-xs text-zinc-500">
                  R$ {plan.price.toFixed(2)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
