'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useToolsOrchestrationStore } from '@/stores/ai-studio-store'
import { getToolAssignments } from '@/services/ai-studio-api'
import type { ToolAssignment } from '@/types/ai-studio'
import { 
  Wrench, 
  Search, 
  Plus,
  Globe,
  Database,
  Zap,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Settings,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const categoryConfig: Record<ToolAssignment['category'], {
  label: string
  icon: typeof Server
  color: string
}> = {
  'internal-api': {
    label: 'API Interna',
    icon: Server,
    color: 'text-blue-400',
  },
  'external-api': {
    label: 'API Externa',
    icon: Globe,
    color: 'text-purple-400',
  },
  'database': {
    label: 'Database',
    icon: Database,
    color: 'text-amber-400',
  },
  'automation': {
    label: 'Automação',
    icon: Zap,
    color: 'text-emerald-400',
  },
}

const healthConfig: Record<ToolAssignment['healthStatus'], {
  label: string
  color: string
  bgColor: string
  icon: typeof CheckCircle2
}> = {
  healthy: {
    label: 'Saudável',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degradado',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    icon: AlertTriangle,
  },
  offline: {
    label: 'Offline',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    icon: XCircle,
  },
}

function ToolCard({ tool }: { tool: ToolAssignment }) {
  const category = categoryConfig[tool.category]
  const health = healthConfig[tool.healthStatus]
  const CategoryIcon = category.icon
  const HealthIcon = health.icon

  const formatLatency = (ms: number) => {
    if (ms === 0) return '--'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatLastCalled = (date: Date | null) => {
    if (!date) return 'Nunca'
    const diff = Date.now() - date.getTime()
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  return (
    <div className={cn(
      "group rounded-xl border p-4 transition-all",
      tool.healthStatus === 'offline'
        ? "border-red-500/30 bg-red-500/5"
        : tool.healthStatus === 'degraded'
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            tool.healthStatus === 'healthy'
              ? "bg-zinc-800/50"
              : tool.healthStatus === 'degraded'
                ? "bg-amber-500/10"
                : "bg-red-500/10"
          )}>
            <CategoryIcon className={cn("h-5 w-5", category.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100">{tool.name}</h3>
            <p className="text-xs text-zinc-500">{tool.description}</p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn("border text-xs font-mono", health.bgColor, health.color)}
        >
          <HealthIcon className="mr-1 h-3 w-3" />
          {health.label}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div>
          <p className="text-xs text-zinc-600">Chamadas</p>
          <p className="font-mono text-sm font-medium text-zinc-300">
            {tool.totalCalls.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-600">Latência</p>
          <p className="font-mono text-sm font-medium text-zinc-300">
            {formatLatency(tool.avgExecutionMs)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-600">Sucesso</p>
          <p className={cn(
            "font-mono text-sm font-medium",
            tool.successRate >= 95 
              ? "text-emerald-400" 
              : tool.successRate >= 80 
                ? "text-amber-400" 
                : "text-red-400"
          )}>
            {tool.successRate > 0 ? `${tool.successRate.toFixed(1)}%` : '--'}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-600">Timeout</p>
          <p className="font-mono text-sm font-medium text-zinc-300">
            {(tool.timeoutMs / 1000).toFixed(0)}s
          </p>
        </div>
      </div>

      {/* Endpoint */}
      {tool.endpoint && (
        <div className="mb-3 rounded-lg bg-black px-3 py-2">
          <p className="font-mono text-xs text-zinc-500 truncate">{tool.endpoint}</p>
        </div>
      )}

      {/* Assigned Agents */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-600" />
          {tool.assignedAgents.length > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-400">
                {tool.assignedAgents.length} agente{tool.assignedAgents.length > 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-600">Sem atribuição</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatLastCalled(tool.lastCalledAt)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
              <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                <Settings className="mr-2 h-4 w-4" />
                Configurar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Agentes
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                <Zap className="mr-2 h-4 w-4" />
                Testar Execução
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function ToolsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-start gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j}>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ToolCallingConfig() {
  const { tools, isLoading, setTools, setLoading } = useToolsOrchestrationStore()

  useEffect(() => {
    const loadTools = async () => {
      setLoading(true)
      try {
        const data = await getToolAssignments()
        setTools(data)
      } finally {
        setLoading(false)
      }
    }
    loadTools()
  }, [setTools, setLoading])

  // Group by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = []
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, typeof tools>)

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100">Orquestração de Ferramentas</h2>
              <p className="text-xs text-zinc-500">Capacidades e integrações dos agentes</p>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 h-8">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nova Ferramenta
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            placeholder="Buscar ferramentas..."
            className="h-8 bg-zinc-900 border-zinc-800 pl-9 text-sm placeholder:text-zinc-600"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {isLoading ? (
            <ToolsSkeleton />
          ) : (
            Object.entries(toolsByCategory).map(([category, categoryTools]) => {
              const config = categoryConfig[category as ToolAssignment['category']]
              const CategoryIcon = config.icon
              
              return (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2">
                    <CategoryIcon className={cn("h-4 w-4", config.color)} />
                    <span className={cn("text-xs font-medium uppercase tracking-wide", config.color)}>
                      {config.label} ({categoryTools.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
