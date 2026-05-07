'use client'

import { Suspense, useState, useEffect } from 'react'
import { 
  Bot, 
  Plus,
  MoreHorizontal,
  Zap,
  MessageSquare,
  Clock,
  ThumbsUp,
  Play,
  Pause,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAIAgents, getAIAgentStats } from '@/services/mock-api'
import type { AIAgent } from '@/types/domain'
import { PageSkeleton } from '@/components/shared/loading-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  training: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  training: 'Em Treino',
  error: 'Erro',
}

const typeIcons: Record<string, typeof Bot> = {
  assistant: MessageSquare,
  classifier: Zap,
  summarizer: Bot,
  translator: Bot,
  custom: Settings,
}

function AIAgentCard({ agent }: { agent: AIAgent }) {
  const Icon = typeIcons[agent.type] || Bot
  const isActive = agent.status === 'active'

  return (
    <div className={cn(
      "group relative rounded-xl border bg-zinc-900/50 p-5 transition-all duration-200",
      isActive 
        ? "border-emerald-500/20 hover:border-emerald-500/40" 
        : "border-zinc-800/50 hover:border-zinc-700/50"
    )}>
      {/* Status indicator */}
      {isActive && (
        <div className="absolute right-4 top-4 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          isActive 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "bg-zinc-800/50 text-zinc-500"
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-100">{agent.name}</h3>
            <Badge 
              variant="outline" 
              className={cn("border text-xs", statusColors[agent.status])}
            >
              {statusLabels[agent.status]}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">{agent.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MessageSquare className="h-3 w-3" />
            <span>Conversas</span>
          </div>
          <p className="mt-1 text-lg font-medium text-zinc-200">
            {agent.conversationsHandled.toLocaleString('pt-BR')}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            <span>Resp. Média</span>
          </div>
          <p className="mt-1 text-lg font-medium text-zinc-200">
            {(agent.avgResponseTime / 1000).toFixed(1)}s
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <ThumbsUp className="h-3 w-3" />
            <span>Satisfação</span>
          </div>
          <p className={cn(
            "mt-1 text-lg font-medium",
            agent.satisfactionScore >= 90 
              ? "text-emerald-400" 
              : agent.satisfactionScore >= 80 
                ? "text-yellow-400" 
                : "text-red-400"
          )}>
            {agent.satisfactionScore}%
          </p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {agent.capabilities.map((cap) => (
          <span 
            key={cap} 
            className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-xs text-zinc-400"
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Model info */}
      <div className="mb-4 flex items-center gap-2 text-xs text-zinc-600">
        <span className="rounded bg-zinc-800 px-2 py-1">{agent.model}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "border-zinc-800 text-xs",
              isActive 
                ? "bg-zinc-900 text-yellow-400 hover:bg-zinc-800" 
                : "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
            )}
          >
            {isActive ? (
              <>
                <Pause className="mr-1.5 h-3 w-3" /> Pausar
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3 w-3" /> Ativar
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Settings className="mr-1.5 h-3 w-3" /> Configurar
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface Stats {
  total: number
  active: number
  avgSatisfaction: number
  totalConversations: number
}

function AIStudioContent() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [agentsResult, statsResult] = await Promise.all([
          getAIAgents(),
          getAIAgentStats(),
        ])
        setAgents(agentsResult)
        setStats(statsResult)
      } catch (error) {
        console.error('Failed to load AI agents:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">AI Studio</h1>
          <p className="text-sm text-zinc-500">
            Gerencie e monitore seus agentes de inteligência artificial
          </p>
        </div>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agente
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Total de Agentes</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{stats?.total || 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Agentes Ativos</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{stats?.active || 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Satisfação Média</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{stats?.avgSatisfaction || 0}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Conversas Processadas</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">
            {(stats?.totalConversations || 0).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Agents grid */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <AIAgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Placeholder for AI training/insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <Bot className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-sm font-medium text-zinc-500">Módulo em Construção</p>
          <p className="text-xs text-zinc-600">Central de treinamento e fine-tuning</p>
        </div>
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <Zap className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-sm font-medium text-zinc-500">Módulo em Construção</p>
          <p className="text-xs text-zinc-600">Analytics e insights de performance</p>
        </div>
      </div>
    </div>
  )
}

export function AIStudioView() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AIStudioContent />
    </Suspense>
  )
}
