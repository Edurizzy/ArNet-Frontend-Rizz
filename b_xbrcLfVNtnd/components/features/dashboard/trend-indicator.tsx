'use client'

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrendDirection } from '@/types/dashboard'

interface TrendIndicatorProps {
  direction: TrendDirection
  delta: number
  period?: string
  size?: 'sm' | 'md'
}

export function TrendIndicator({ 
  direction, 
  delta, 
  period,
  size = 'sm' 
}: TrendIndicatorProps) {
  const isUp = direction === 'up'
  const isDown = direction === 'down'
  const isStable = direction === 'stable'
  
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  
  return (
    <div className={cn(
      "flex items-center gap-1",
      textSize,
      isUp && "text-emerald-400",
      isDown && "text-red-400",
      isStable && "text-zinc-500"
    )}>
      {isUp && <ArrowUpRight className={iconSize} />}
      {isDown && <ArrowDownRight className={iconSize} />}
      {isStable && <Minus className={iconSize} />}
      <span className="font-mono tabular-nums">
        {isUp ? '+' : isDown ? '-' : ''}{Math.abs(delta).toFixed(1)}%
      </span>
      {period && (
        <span className="text-zinc-600 ml-0.5">{period}</span>
      )}
    </div>
  )
}
