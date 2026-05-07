'use client'

import { Download, RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useDashboardUiStore, useRealtimeStatusStore } from '@/stores/dashboard-store'
import type { TimeRange } from '@/types/dashboard'

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

export function DashboardHeader() {
  const { activeTimeRange, setTimeRange } = useDashboardUiStore()
  const { status } = useRealtimeStatusStore()

  const handleExport = () => {
    // Placeholder for export functionality
    console.log('Exporting dashboard report...')
  }

  return (
    <header className="flex-shrink-0 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Title Section */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">
              Visão Geral da Operação
            </h1>
            <p className="text-xs text-zinc-500">
              Central de Inteligência Operacional
            </p>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-400">LIVE</span>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex items-center gap-3">
          {/* Last sync indicator */}
          {status && (
            <div className="hidden items-center gap-1.5 text-xs text-zinc-500 md:flex">
              <Clock className="h-3 w-3" />
              <span className="font-mono">
                Sync: {formatTimestamp(status.lastSync)}
              </span>
            </div>
          )}

          {/* Time Range Selector */}
          <Select
            value={activeTimeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="h-8 w-[140px] border-zinc-800 bg-zinc-900/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 Dias</SelectItem>
              <SelectItem value="30d">Este Mês</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-zinc-800 bg-zinc-900/50 text-xs"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-zinc-800 bg-zinc-900/50 text-xs"
            onClick={handleExport}
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Exportar Relatório</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
