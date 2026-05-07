'use client'

import { useMemo } from 'react'
import type { MetricSparklineData, SeverityLevel } from '@/types/dashboard'

interface MetricSparklineProps {
  data: MetricSparklineData
  severity: SeverityLevel
  height?: number
}

const severityStrokeColors = {
  success: '#34d399',
  warning: '#fbbf24',
  critical: '#f87171',
  info: '#71717a',
}

export function MetricSparkline({ data, severity, height = 24 }: MetricSparklineProps) {
  const path = useMemo(() => {
    if (!data.points.length) return ''
    
    const width = 100
    const padding = 2
    const range = data.max - data.min || 1
    
    const points = data.points.map((point, i) => {
      const x = padding + (i / (data.points.length - 1)) * (width - padding * 2)
      const y = height - padding - ((point.value - data.min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }, [data, height])

  const areaPath = useMemo(() => {
    if (!data.points.length) return ''
    
    const width = 100
    const padding = 2
    const range = data.max - data.min || 1
    
    const points = data.points.map((point, i) => {
      const x = padding + (i / (data.points.length - 1)) * (width - padding * 2)
      const y = height - padding - ((point.value - data.min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    
    return `M ${padding},${height} L ${points.join(' L ')} L ${100 - padding},${height} Z`
  }, [data, height])

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className="w-full overflow-visible"
      preserveAspectRatio="none"
    >
      {/* Area fill */}
      <path
        d={areaPath}
        fill={severityStrokeColors[severity]}
        fillOpacity={0.1}
      />
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={severityStrokeColors[severity]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
