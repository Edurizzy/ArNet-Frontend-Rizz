'use client'

import { useEffect } from 'react'
import { 
  useCustomerFiltersStore, 
  useCustomerPaginationStore, 
  useCustomerListDataStore,
  useCustomerSelectionStore,
  useBulkSelectionStore
} from '@/stores/crm-store'
import { fetchCustomers } from '@/services/crm-api'
import { CustomerRow } from './customer-row'
import { CustomerTableHeader } from './customer-table-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export function CustomerTable() {
  const { filters } = useCustomerFiltersStore()
  const { pagination, setPagination } = useCustomerPaginationStore()
  const { customers, isLoading, setCustomers, setLoading, setError } = useCustomerListDataStore()
  const { selectedCustomerId, selectCustomer } = useCustomerSelectionStore()
  const { selectedIds, selectAll, clearSelection } = useBulkSelectionStore()

  // Fetch customers when filters or pagination changes
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true)
      try {
        const result = await fetchCustomers(filters, {
          page: pagination.page,
          pageSize: pagination.pageSize,
        })
        setCustomers(result.customers)
        setPagination({
          totalItems: result.total,
          totalPages: Math.ceil(result.total / pagination.pageSize),
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch customers')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [filters, pagination.page, pagination.pageSize])

  const handleSelectAll = () => {
    if (selectedIds.size === customers.length) {
      clearSelection()
    } else {
      selectAll(customers.map((c) => c.id))
    }
  }

  const isAllSelected = customers.length > 0 && selectedIds.size === customers.length
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < customers.length

  if (isLoading && customers.length === 0) {
    return <CustomerTableSkeleton />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Table Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="grid grid-cols-[40px_2fr_140px_180px_140px_120px_140px_80px] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              aria-label="Selecionar todos"
            />
          </div>
          <CustomerTableHeader
            label="Cliente"
            sortKey="name"
          />
          <CustomerTableHeader
            label="CPF/CNPJ"
            sortKey="name"
            sortable={false}
          />
          <div>Canais</div>
          <div>Plano</div>
          <CustomerTableHeader
            label="Status"
            sortKey="name"
            sortable={false}
          />
          <CustomerTableHeader
            label="LTV"
            sortKey="ltv"
          />
          <div className="text-center">Ações</div>
        </div>
      </div>

      {/* Table Body */}
      <ScrollArea className="flex-1">
        <div className="min-w-full">
          {customers.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomerId === customer.id}
              isChecked={selectedIds.has(customer.id)}
              onSelect={() => selectCustomer(customer.id)}
            />
          ))}

          {customers.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <p className="text-sm">Nenhum cliente encontrado</p>
              <p className="mt-1 text-xs">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      <div className="flex-shrink-0 border-t border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} de{' '}
            {pagination.totalItems} clientes
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-2">
              Página {pagination.page} de {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPagination({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomerTableSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
        <div className="grid grid-cols-[40px_2fr_140px_180px_140px_120px_140px_80px] gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-zinc-800/50" />
        ))}
      </div>
    </div>
  )
}
