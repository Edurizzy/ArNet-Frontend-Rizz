'use client'

import { Suspense } from 'react'
import { DashboardLayout } from '@/components/features/dashboard'
import { PageSkeleton } from '@/components/shared/loading-states'

export function DashboardView() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout />
    </Suspense>
  )
}
