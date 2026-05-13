'use client'

import { cn } from '@/lib/utils'

interface WidgetSkeletonProps {
  className?: string
}

export function WidgetSkeleton({ className }: WidgetSkeletonProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3",
      className
    )}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent" />
      
      {/* Content skeleton */}
      <div className="space-y-2">
        <div className="h-2 w-16 rounded bg-zinc-800/50" />
        <div className="h-5 w-24 rounded bg-zinc-800/50" />
        <div className="h-2 w-20 rounded bg-zinc-800/50" />
      </div>
    </div>
  )
}

interface ChartSkeletonProps {
  className?: string
  showLegend?: boolean
}

export function ChartSkeleton({ className, showLegend = true }: ChartSkeletonProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4",
      className
    )}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent" />
      
      {/* Header skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-3 w-32 rounded bg-zinc-800/50" />
        <div className="h-2 w-16 rounded bg-zinc-800/50" />
      </div>
      
      {/* Chart area skeleton */}
      <div className="flex h-[200px] items-end gap-2 px-4">
          {[35, 60, 25, 45, 80, 55, 30, 70, 40, 65, 50, 85].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-zinc-800/30"
              style={{ height: `${height}%` }}
            />
          ))}
      </div>
      
      {/* Legend skeleton */}
      {showLegend && (
        <div className="mt-4 flex justify-center gap-4">
          <div className="h-2 w-16 rounded bg-zinc-800/50" />
          <div className="h-2 w-16 rounded bg-zinc-800/50" />
        </div>
      )}
    </div>
  )
}
