'use client'

import { MoreHorizontal, Edit, Pause, Eye, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { FinancialStatusBadge } from './financial-status-badge'
import { OmnichannelIndicators } from './omnichannel-indicators'
import { useBulkSelectionStore } from '@/stores/crm-store'
import { cn } from '@/lib/utils'
import type { CrmCustomer } from '@/types/crm'

interface CustomerRowProps {
  customer: CrmCustomer
  isSelected: boolean
  isChecked: boolean
  onSelect: () => void
}

export function CustomerRow({ customer, isSelected, isChecked, onSelect }: CustomerRowProps) {
  const { toggleSelection } = useBulkSelectionStore()

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSelection(customer.id)
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "grid grid-cols-[40px_2fr_140px_180px_140px_120px_140px_80px] gap-4 px-4 py-3 border-b border-zinc-800/30 cursor-pointer transition-colors",
        isSelected 
          ? "bg-emerald-950/20 border-l-2 border-l-emerald-500" 
          : "hover:bg-zinc-900/50",
        isChecked && "bg-zinc-800/30"
      )}
    >
      {/* Checkbox */}
      <div 
        className="flex items-center justify-center"
        onClick={handleCheckboxChange}
      >
        <Checkbox
          checked={isChecked}
          className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          aria-label={`Selecionar ${customer.name}`}
        />
      </div>

      {/* Customer Name & Avatar */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={customer.avatarUrl} alt={customer.name} />
          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">
            {customer.name}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {customer.email}
          </p>
        </div>
      </div>

      {/* CPF/CNPJ */}
      <div className="flex items-center">
        <span className="text-sm text-zinc-400 font-mono">
          {customer.cpfCnpj}
        </span>
      </div>

      {/* Omnichannel Identities */}
      <div className="flex items-center">
        <OmnichannelIndicators identities={customer.omnichannelIdentities} />
      </div>

      {/* Plan */}
      <div className="flex items-center">
        <div>
          <p className="text-sm text-zinc-200">
            {customer.subscription.planName}
          </p>
          <p className="text-xs text-zinc-500">
            {customer.subscription.speed}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <FinancialStatusBadge status={customer.billingStatus} />
      </div>

      {/* LTV */}
      <div className="flex items-center">
        <div>
          <p className="text-sm font-medium text-zinc-200">
            {formatCurrency(customer.metrics.ltv)}
          </p>
          <p className="text-xs text-zinc-500">
            {customer.metrics.totalTickets} tickets
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[180px] bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Abrir Atendimento
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="text-amber-400 focus:bg-zinc-800 focus:text-amber-300 cursor-pointer">
              <Pause className="mr-2 h-4 w-4" />
              Suspender
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
