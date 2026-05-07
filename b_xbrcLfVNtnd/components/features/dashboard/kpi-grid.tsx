'use client'

import { useKpiDataStore } from '@/stores/dashboard-store'
import { KpiCard } from './kpi-card'
import { WidgetSkeleton } from './widget-skeleton'

export function KpiGrid() {
  const { kpis, state } = useKpiDataStore()

  if (state === 'loading' || kpis.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <WidgetSkeleton key={i} className="h-[100px]" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}
