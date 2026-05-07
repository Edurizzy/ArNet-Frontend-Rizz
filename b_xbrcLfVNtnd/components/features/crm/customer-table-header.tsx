'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useCustomerFiltersStore } from '@/stores/crm-store'
import { cn } from '@/lib/utils'

interface CustomerTableHeaderProps {
  label: string
  sortKey: 'name' | 'createdAt' | 'ltv' | 'lastContact'
  sortable?: boolean
}

export function CustomerTableHeader({ 
  label, 
  sortKey, 
  sortable = true 
}: CustomerTableHeaderProps) {
  const { filters, setFilters } = useCustomerFiltersStore()

  const handleSort = () => {
    if (!sortable) return

    if (filters.sortBy === sortKey) {
      setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      setFilters({ sortBy: sortKey, sortOrder: 'asc' })
    }
  }

  const isActive = filters.sortBy === sortKey

  if (!sortable) {
    return <div>{label}</div>
  }

  return (
    <button
      onClick={handleSort}
      className={cn(
        "flex items-center gap-1 hover:text-zinc-300 transition-colors text-left",
        isActive && "text-zinc-300"
      )}
    >
      {label}
      {isActive ? (
        filters.sortOrder === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  )
}
