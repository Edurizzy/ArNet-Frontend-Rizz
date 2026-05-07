'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ModulePlaceholderProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function ModulePlaceholder({ 
  title, 
  description = 'Este módulo está sendo desenvolvido e estará disponível em breve.',
  icon 
}: ModulePlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className={cn(
        "mb-6 flex h-20 w-20 items-center justify-center rounded-2xl",
        "border border-zinc-800 bg-zinc-900/50",
        "text-zinc-600"
      )}>
        {icon || (
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        )}
      </div>
      <h2 className="mb-2 text-lg font-semibold text-zinc-200">{title}</h2>
      <p className="max-w-md text-sm text-zinc-500">{description}</p>
    </div>
  )
}

// Page-level loading skeleton
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-64 bg-zinc-800/60" />
        </div>
        <Skeleton className="h-9 w-32 bg-zinc-800" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
            <Skeleton className="mb-3 h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-8 w-16 bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
          <Skeleton className="mb-4 h-5 w-32 bg-zinc-800" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                  <Skeleton className="h-3 w-1/2 bg-zinc-800/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
          <Skeleton className="mb-4 h-5 w-40 bg-zinc-800" />
          <Skeleton className="h-48 w-full rounded-lg bg-zinc-800/50" />
        </div>
      </div>
    </div>
  )
}

// Card-level loading skeleton
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
      <Skeleton className="mb-3 h-4 w-32 bg-zinc-800" />
      <Skeleton className="mb-2 h-6 w-20 bg-zinc-800" />
      <Skeleton className="h-3 w-24 bg-zinc-800/60" />
    </div>
  )
}

// Table loading skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50">
      {/* Header */}
      <div className="flex gap-4 border-b border-zinc-800/50 p-4">
        <Skeleton className="h-4 w-32 bg-zinc-800" />
        <Skeleton className="h-4 w-24 bg-zinc-800" />
        <Skeleton className="h-4 w-28 bg-zinc-800" />
        <Skeleton className="h-4 w-20 bg-zinc-800" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-zinc-800/30 p-4 last:border-0">
          <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
          <Skeleton className="h-4 w-40 bg-zinc-800" />
          <Skeleton className="h-4 w-28 bg-zinc-800/60" />
          <Skeleton className="h-4 w-20 bg-zinc-800/60" />
          <Skeleton className="ml-auto h-6 w-16 rounded-full bg-zinc-800" />
        </div>
      ))}
    </div>
  )
}
