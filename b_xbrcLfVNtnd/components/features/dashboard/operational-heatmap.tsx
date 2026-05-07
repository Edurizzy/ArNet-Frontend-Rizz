'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useHeatmapDataStore } from '@/stores/dashboard-store'
import { ChartContainer } from './chart-container'
import { ChartSkeleton } from './widget-skeleton'
import type { HeatmapCell } from '@/types/dashboard'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const densityColors = {
  low: 'bg-zinc-800/50',
  medium: 'bg-emerald-900/40',
  high: 'bg-emerald-700/50',
  critical: 'bg-emerald-500/60',
}

const densityBorders = {
  low: 'border-zinc-700/30',
  medium: 'border-emerald-800/30',
  high: 'border-emerald-600/30',
  critical: 'border-emerald-400/30',
}

interface HeatmapCellProps {
  cell: HeatmapCell
  maxValue: number
}

function HeatmapCellComponent({ cell, maxValue }: HeatmapCellProps) {
  return (
    <div
      className={cn(
        "aspect-square rounded-[2px] border transition-all duration-150",
        "hover:scale-110 hover:z-10 cursor-default",
        densityColors[cell.density],
        densityBorders[cell.density]
      )}
      title={`${DAYS[cell.dayIndex]} ${cell.hourIndex}:00 - ${cell.value} tickets`}
    />
  )
}

export function OperationalHeatmap() {
  const { heatmap, state } = useHeatmapDataStore()

  const cellsByPosition = useMemo(() => {
    if (!heatmap) return new Map<string, HeatmapCell>()
    
    const map = new Map<string, HeatmapCell>()
    heatmap.cells.forEach((cell) => {
      map.set(`${cell.dayIndex}-${cell.hourIndex}`, cell)
    })
    return map
  }, [heatmap])

  if (state === 'loading' || !heatmap) {
    return <ChartSkeleton className="h-[280px]" showLegend={false} />
  }

  return (
    <ChartContainer
      title="Densidade Operacional"
      subtitle={`Total: ${heatmap.totalTickets.toLocaleString('pt-BR')} tickets no período`}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="mb-1 ml-10 flex gap-[2px]">
            {HOURS.filter((h) => h % 3 === 0).map((hour) => (
              <div
                key={hour}
                className="text-[9px] font-mono text-zinc-600"
                style={{ width: `${100 / 8}%`, textAlign: 'left' }}
              >
                {hour.toString().padStart(2, '0')}h
              </div>
            ))}
          </div>
          
          {/* Grid */}
          <div className="flex flex-col gap-[2px]">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-[2px]">
                {/* Day label */}
                <div className="w-8 text-right text-[9px] font-mono text-zinc-500 pr-1.5">
                  {day}
                </div>
                
                {/* Hour cells */}
                <div className="flex flex-1 gap-[2px]">
                  {HOURS.map((hourIndex) => {
                    const cell = cellsByPosition.get(`${dayIndex}-${hourIndex}`)
                    if (!cell) return <div key={hourIndex} className="aspect-square flex-1 rounded-[2px] bg-zinc-900/20" />
                    return (
                      <div key={hourIndex} className="flex-1">
                        <HeatmapCellComponent 
                          cell={cell} 
                          maxValue={heatmap.maxValue}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <span className="text-[9px] text-zinc-600">Menor</span>
            <div className="flex gap-0.5">
              <div className={cn("h-3 w-3 rounded-[2px]", densityColors.low)} />
              <div className={cn("h-3 w-3 rounded-[2px]", densityColors.medium)} />
              <div className={cn("h-3 w-3 rounded-[2px]", densityColors.high)} />
              <div className={cn("h-3 w-3 rounded-[2px]", densityColors.critical)} />
            </div>
            <span className="text-[9px] text-zinc-600">Maior</span>
          </div>
        </div>
      </div>
    </ChartContainer>
  )
}
