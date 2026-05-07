'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAgentsDataStore, useAgentSelectionStore } from '@/stores/ai-studio-store'
import { getOperationalAgents } from '@/services/ai-studio-api'
import { AgentCard } from './agent-card'
import { Bot, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

function AgentManagerSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
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

export function AgentManager() {
  const { agents, isLoading, setAgents, setLoading } = useAgentsDataStore()
  const { selectedAgentId, selectAgent, setSelectedAgent, initializeDraft } = useAgentSelectionStore()

  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true)
      try {
        const data = await getOperationalAgents()
        setAgents(data)
      } finally {
        setLoading(false)
      }
    }
    loadAgents()
  }, [setAgents, setLoading])

  const handleSelectAgent = (agent: typeof agents[0]) => {
    selectAgent(agent.id)
    setSelectedAgent(agent)
    initializeDraft(agent)
  }

  // Group agents by lifecycle state
  const activeAgents = agents.filter(a => 
    a.lifecycleState === 'active' || a.lifecycleState === 'processing'
  )
  const idleAgents = agents.filter(a => a.lifecycleState === 'idle')
  const degradedAgents = agents.filter(a => 
    a.lifecycleState === 'degraded' || a.lifecycleState === 'offline'
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold text-zinc-100">Agentes Operacionais</h2>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">
              {agents.length}
            </span>
          </div>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 h-8">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Novo Agente
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <Input
              placeholder="Buscar agentes..."
              className="h-8 bg-zinc-900 border-zinc-800 pl-9 text-sm placeholder:text-zinc-600"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 h-8"
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Agent List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {isLoading ? (
            <AgentManagerSkeleton />
          ) : (
            <>
              {/* Active Agents */}
              {activeAgents.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                      Ativos ({activeAgents.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {activeAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onSelect={handleSelectAgent}
                        isSelected={selectedAgentId === agent.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Idle Agents */}
              {idleAgents.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-500" />
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Ociosos ({idleAgents.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {idleAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onSelect={handleSelectAgent}
                        isSelected={selectedAgentId === agent.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Degraded/Offline Agents */}
              {degradedAgents.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium uppercase tracking-wide text-amber-500">
                      Atenção Necessária ({degradedAgents.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {degradedAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onSelect={handleSelectAgent}
                        isSelected={selectedAgentId === agent.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
