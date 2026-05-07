'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function ChartContainer({ 
  title, 
  subtitle, 
  children, 
  className,
  actions
}: ChartContainerProps) {
  return (
    <div className={cn(
      "rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4",
      className
    )}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
          {subtitle && (
            <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Chart content */}
      {children}
    </div>
  )
}
