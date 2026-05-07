'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LastUpdatedIndicatorProps {
  timestamp: number
  className?: string
}

function getRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return 'agora'
  if (seconds < 120) return '1m'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 7200) return '1h'
  return `${Math.floor(seconds / 3600)}h`
}

export function LastUpdatedIndicator({ timestamp, className }: LastUpdatedIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState(() => getRelativeTime(timestamp))

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(timestamp))
    }, 30000)

    return () => clearInterval(interval)
  }, [timestamp])

  const isStale = Date.now() - timestamp > 120000 // 2 minutes

  return (
    <span className={cn(
      "font-mono text-[9px] tabular-nums",
      isStale ? "text-amber-500" : "text-zinc-600",
      className
    )}>
      {relativeTime}
    </span>
  )
}
