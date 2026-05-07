'use client'

import { Suspense, useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Bot,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDashboardData } from '@/services/mock-api'
import { PageSkeleton, CardSkeleton } from '@/components/shared/loading-states'

interface StatCardProps {
  label: string
  value: string | number
  change?: { value: number; trend: 'up' | 'down' }
  icon: React.ReactNode
  accent?: string
}

function StatCard({ label, value, change, icon, accent = 'emerald' }: StatCardProps) {
  const accentColors: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    violet: 'text-violet-400 bg-violet-500/10',
  }

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl",
      "border border-zinc-800/50 bg-zinc-900/50 p-5",
      "transition-all duration-200 hover:border-zinc-700/50 hover:bg-zinc-900/70"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{value}</p>
          {change && (
            <div className={cn(
              "mt-2 flex items-center gap-1 text-xs",
              change.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}>
              {change.trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{change.value}% vs. mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          accentColors[accent]
        )}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardData>> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const result = await getDashboardData()
        setData(result)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading || !data) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500">Visão geral da operação em tempo real</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Conversas Abertas"
          value={data.conversationStats.open}
          change={{ value: 12, trend: 'up' }}
          icon={<MessageSquare className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Clientes Ativos"
          value={data.customerStats.active}
          change={{ value: 8, trend: 'up' }}
          icon={<Users className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          label="Score de Saúde"
          value={`${data.customerStats.avgHealthScore}%`}
          change={{ value: 3, trend: 'up' }}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          label="Agentes IA Ativos"
          value={`${data.aiStats.active}/${data.aiStats.total}`}
          icon={<Bot className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity placeholder */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
          <h3 className="mb-4 text-sm font-medium text-zinc-300">Atividade Recente</h3>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-sm text-zinc-600">Módulo em Construção</p>
              <p className="text-xs text-zinc-700">Feed de atividades em tempo real</p>
            </div>
          </div>
        </div>

        {/* AI performance placeholder */}
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
          <h3 className="mb-4 text-sm font-medium text-zinc-300">Performance dos Agentes IA</h3>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30">
            <div className="text-center">
              <Bot className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-sm text-zinc-600">Módulo em Construção</p>
              <p className="text-xs text-zinc-700">Gráficos de performance AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Tempo Médio de Resposta</span>
            <span className="text-lg font-medium text-zinc-100">
              {Math.round(data.conversationStats.avgResponseTime / 1000)}s
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Satisfação IA</span>
            <span className="text-lg font-medium text-zinc-100">{data.aiStats.avgSatisfaction}%</span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Total Conversas IA</span>
            <span className="text-lg font-medium text-zinc-100">
              {data.aiStats.totalConversations.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardView() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
