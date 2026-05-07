'use client'

import { cn } from '@/lib/utils'

interface LivePulseIndicatorProps {
  className?: string
  color?: 'emerald' | 'blue' | 'amber' | 'red'
}

const colorStyles = {
  emerald: {
    ping: 'bg-emerald-400',
    dot: 'bg-emerald-500',
  },
  blue: {
    ping: 'bg-blue-400',
    dot: 'bg-blue-500',
  },
  amber: {
    ping: 'bg-amber-400',
    dot: 'bg-amber-500',
  },
  red: {
    ping: 'bg-red-400',
    dot: 'bg-red-500',
  },
}

export function LivePulseIndicator({ 
  className,
  color = 'emerald'
}: LivePulseIndicatorProps) {
  const styles = colorStyles[color]
  
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className={cn(
        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
        styles.ping
      )} />
      <span className={cn(
        "relative inline-flex h-2 w-2 rounded-full",
        styles.dot
      )} />
    </span>
  )
}
