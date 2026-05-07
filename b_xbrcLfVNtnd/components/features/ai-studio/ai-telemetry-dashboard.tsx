'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTelemetryStore } from '@/stores/ai-studio-store'
import { getTelemetrySnapshot, getInferenceTraces } from '@/services/ai-studio-api'
import { InferenceFeed } from './inference-feed'
import { 
  Activity, 
  DollarSign, 
  Zap, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Cpu,
  Gauge,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

function MetricCard({ 
  label, 
  value, 
  subValue,
  icon: Icon, 
  color = 'text-zinc-100',
  trend,
}: { 
  label: string
  value: string
  subValue?: string
  icon: typeof Activity
  color?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500">{label}</span>
        <Icon className="h-4 w-4 text-zinc-600" />
      </div>
      <p className={cn("text-2xl font-semibold font-mono", color)}>{value}</p>
      {subValue && (
        <p className="mt-0.5 text-xs text-zinc-500">{subValue}</p>
      )}
      {trend && (
        <div className={cn(
          "mt-2 flex items-center gap-1 text-xs",
          trend === 'up' ? "text-emerald-400" : trend === 'down' ? "text-red-400" : "text-zinc-500"
        )}>
          <TrendingUp className={cn("h-3 w-3", trend === 'down' && "rotate-180")} />
          <span>{trend === 'up' ? '+12%' : trend === 'down' ? '-8%' : '0%'} vs ontem</span>
        </div>
      )}
    </div>
  )
}

function TelemetrySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AiTelemetryDashboard() {
  const { 
    snapshot, 
    inferenceTraces, 
    isLoading, 
    setSnapshot, 
    setInferenceTraces, 
    setLoading 
  } = useTelemetryStore()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [snapshotData, tracesData] = await Promise.all([
          getTelemetrySnapshot(),
          getInferenceTraces(),
        ])
        setSnapshot(snapshotData)
        setInferenceTraces(tracesData)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [setSnapshot, setInferenceTraces, setLoading])

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
    }).format(value)
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100">Telemetria & Observabilidade</h2>
              <p className="text-xs text-zinc-500">Métricas operacionais em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">
              Última atualização: {snapshot ? new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }).format(snapshot.timestamp) : '--:--:--'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 h-8"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {isLoading ? (
            <TelemetrySkeleton />
          ) : snapshot ? (
            <>
              {/* Cost Metrics */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <DollarSign className="h-4 w-4" />
                  Custos Estimados
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <MetricCard
                    label="Custo Diário"
                    value={formatCurrency(snapshot.costEstimate.daily, snapshot.costEstimate.currency)}
                    icon={DollarSign}
                    color="text-emerald-400"
                  />
                  <MetricCard
                    label="Custo Semanal"
                    value={formatCurrency(snapshot.costEstimate.weekly, snapshot.costEstimate.currency)}
                    icon={DollarSign}
                    color="text-zinc-100"
                  />
                  <MetricCard
                    label="Custo Mensal"
                    value={formatCurrency(snapshot.costEstimate.monthly, snapshot.costEstimate.currency)}
                    icon={DollarSign}
                    color="text-zinc-100"
                    trend="up"
                  />
                  <MetricCard
                    label="Custo USD (Mensal)"
                    value={`$${(snapshot.costEstimate.monthly / 5).toFixed(2)}`}
                    subValue="Taxa: R$5.00/USD"
                    icon={DollarSign}
                    color="text-zinc-100"
                  />
                </div>
              </div>

              {/* Token Usage */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <Zap className="h-4 w-4" />
                  Consumo de Tokens (Última Hora)
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <MetricCard
                    label="Total Tokens"
                    value={snapshot.tokensConsumed.totalTokens.toLocaleString('pt-BR')}
                    icon={Zap}
                    color="text-blue-400"
                    trend="up"
                  />
                  <MetricCard
                    label="Prompt Tokens"
                    value={snapshot.tokensConsumed.promptTokens.toLocaleString('pt-BR')}
                    subValue={`${((snapshot.tokensConsumed.promptTokens / snapshot.tokensConsumed.totalTokens) * 100).toFixed(0)}% do total`}
                    icon={BarChart3}
                    color="text-zinc-100"
                  />
                  <MetricCard
                    label="Completion Tokens"
                    value={snapshot.tokensConsumed.completionTokens.toLocaleString('pt-BR')}
                    subValue={`${((snapshot.tokensConsumed.completionTokens / snapshot.tokensConsumed.totalTokens) * 100).toFixed(0)}% do total`}
                    icon={BarChart3}
                    color="text-zinc-100"
                  />
                  <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500">Prompt vs Completion</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-400">Prompt</span>
                        <span className="font-mono text-zinc-400">
                          {((snapshot.tokensConsumed.promptTokens / snapshot.tokensConsumed.totalTokens) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={(snapshot.tokensConsumed.promptTokens / snapshot.tokensConsumed.totalTokens) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <Gauge className="h-4 w-4" />
                  Performance & Latência
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <MetricCard
                    label="Inferências (Hora)"
                    value={snapshot.totalInferences.toLocaleString('pt-BR')}
                    icon={Cpu}
                    color="text-emerald-400"
                    trend="up"
                  />
                  <MetricCard
                    label="Latência Média"
                    value={`${snapshot.avgLatencyMs}ms`}
                    icon={Clock}
                    color="text-zinc-100"
                    trend="down"
                  />
                  <MetricCard
                    label="Taxa de Erro"
                    value={`${snapshot.errorRate.toFixed(1)}%`}
                    icon={AlertTriangle}
                    color={snapshot.errorRate > 5 ? "text-red-400" : snapshot.errorRate > 2 ? "text-amber-400" : "text-emerald-400"}
                  />
                  <MetricCard
                    label="Agentes Ativos"
                    value={snapshot.activeAgents.toString()}
                    icon={Cpu}
                    color="text-zinc-100"
                  />
                </div>
              </div>

              {/* Tool Call Frequency */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <BarChart3 className="h-4 w-4" />
                  Frequência de Chamadas de Ferramentas
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(snapshot.toolCallFrequency).map(([tool, count]) => (
                    <div 
                      key={tool}
                      className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4"
                    >
                      <p className="text-xs text-zinc-500 truncate">{tool}</p>
                      <p className="mt-1 text-xl font-semibold font-mono text-zinc-100">
                        {count.toLocaleString('pt-BR')}
                      </p>
                      <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(snapshot.toolCallFrequency))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inference Feed */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <Activity className="h-4 w-4" />
                  Feed de Inferências
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                </h3>
                <InferenceFeed traces={inferenceTraces} />
              </div>
            </>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}
