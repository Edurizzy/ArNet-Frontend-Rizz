'use client'

import { cn } from '@/lib/utils'
import { CustomerFilters } from './customer-filters'
import { CustomerTable } from './customer-table'
import { CustomerDetailPanel } from './customer-detail-panel'
import { useCustomerSelectionStore } from '@/stores/crm-store'

export function CrmLayout() {
  const { isDetailPanelOpen } = useCustomerSelectionStore()

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-zinc-950">
      {/* Header & Filters */}
      <div className="flex-shrink-0 border-b border-zinc-800/50">
        <CustomerFilters />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Customer Table */}
        <div className="flex-1 overflow-hidden">
          <CustomerTable />
        </div>

        {/* Detail Panel */}
        <div
          className={cn(
            "flex-shrink-0 border-l border-zinc-800/50 bg-zinc-900/50 transition-all duration-300 ease-in-out",
            isDetailPanelOpen ? "w-[420px]" : "w-0 overflow-hidden"
          )}
        >
          <CustomerDetailPanel />
        </div>
      </div>
    </div>
  )
}
