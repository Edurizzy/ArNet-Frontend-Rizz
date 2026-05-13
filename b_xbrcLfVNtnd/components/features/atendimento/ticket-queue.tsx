'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, ChevronDown, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TicketCard } from './ticket-card'
import { getAtendimentoConversations } from '@/services/atendimento-api'
import { useTicketQueueUIStore, useActiveConversationStore } from '@/stores/atendimento-store'
import { useTicketStore } from '@/stores/useTicketStore'
import { useHelpdeskSocket } from '@/hooks/useHelpdeskSocket'
import type { TicketStatusFilter } from '@/types/atendimento'

const statusFilterOptions: { value: TicketStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'with-ai', label: 'Com IA' },
  { value: 'in-progress', label: 'Em Atendimento' },
]

function TicketQueueSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-3 w-full bg-zinc-800/60" />
            </div>
            <Skeleton className="h-3 w-8 bg-zinc-800/40" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TicketQueue() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const filters = useTicketQueueUIStore((state) => state.filters)
  const setFilters = useTicketQueueUIStore((state) => state.setFilters)
  const selectedConversationId = useActiveConversationStore((state) => state.selectedConversationId)
  const selectConversation = useActiveConversationStore((state) => state.selectConversation)
  const hydrateTickets = useTicketStore((state) => state.hydrateTickets)
  const clearUnread = useTicketStore((state) => state.clearUnread)
  const conversations = useTicketStore(
    useShallow((state) => state.queueIds.map((id) => state.ticketsById[id]).filter(Boolean))
  )

  const loadConversations = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await getAtendimentoConversations({ signal })
      if (signal?.aborted) return
      hydrateTickets(data)
    } catch (error) {
      if (signal?.aborted) return
      setLoadError(error instanceof Error ? error.message : 'Falha ao carregar fila')
      console.error('Failed to load conversations:', error)
    } finally {
      if (signal?.aborted) return
      setIsLoading(false)
    }
  }, [hydrateTickets])

  const handleSocketResync = useCallback(() => {
    void loadConversations()
  }, [loadConversations])

  const { connectionState, isConnected, reconnect } = useHelpdeskSocket({
    onResync: handleSocketResync,
  })

  useEffect(() => {
    const abortController = new AbortController()
    void loadConversations(abortController.signal)
    return () => abortController.abort()
  }, [loadConversations])

  const filteredConversations = useMemo(() => conversations.filter((conv) => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesName = conv.customerName.toLowerCase().includes(query)
      const matchesId = conv.id.toLowerCase().includes(query)
      if (!matchesName && !matchesId) return false
    }

    // Status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'waiting':
          if (conv.status !== 'pending') return false
          break
        case 'with-ai':
          if (!conv.assignedAIAgentId) return false
          break
        case 'in-progress':
          if (conv.status !== 'open' || !conv.assignedAgentId) return false
          break
      }
    }

    return true
  }), [conversations, filters.searchQuery, filters.status])

  const handleSelectConversation = useCallback((id: string) => {
    selectConversation(id)
    clearUnread(id)
  }, [clearUnread, selectConversation])

  const currentFilterLabel = statusFilterOptions.find(
    (opt) => opt.value === filters.status
  )?.label || 'Todos'

  const connectionTone = useMemo(() => {
    if (isConnected) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    if (connectionState === 'connecting' || connectionState === 'reconnecting') {
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    }
    return 'border-red-500/30 bg-red-500/10 text-red-300'
  }, [connectionState, isConnected])

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header with search and filters */}
      <div className="sticky top-0 z-10 space-y-3 border-b border-zinc-800/30 bg-zinc-950 p-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Buscar cliente ou ticket..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="h-9 border-zinc-800/50 bg-zinc-900/50 pl-9 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-0"
          />
        </div>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-between border border-zinc-800/50 bg-zinc-900/30 text-xs text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
            >
              <span>Status: {currentFilterLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 border-zinc-800 bg-zinc-900">
            {statusFilterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setFilters({ status: option.value })}
                className={cn(
                  "text-sm text-zinc-400 focus:bg-zinc-800 focus:text-zinc-200",
                  filters.status === option.value && "text-emerald-400"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Conversation count */}
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-600">
          <span>{filteredConversations.length} conversa{filteredConversations.length !== 1 ? 's' : ''}</span>
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]', connectionTone)}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connectionState}
          </span>
        </div>
      </div>

      {/* Ticket list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <TicketQueueSkeleton />
        ) : loadError ? (
          <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-red-300">Não foi possível carregar a fila</p>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{loadError}</p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void loadConversations()}
                className="h-7 gap-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <RefreshCw className="h-3 w-3" />
                Recarregar
              </Button>
              {!isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reconnect}
                  className="h-7 gap-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  Reconectar
                </Button>
              )}
            </div>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-0.5 p-2">
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <TicketCard
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-600">Nenhuma conversa encontrada</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
