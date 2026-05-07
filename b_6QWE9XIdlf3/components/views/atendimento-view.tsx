'use client'

import { Suspense, useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  User,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getConversations } from '@/services/mock-api'
import type { Conversation } from '@/types/domain'
import { PageSkeleton, TableSkeleton } from '@/components/shared/loading-states'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

const statusLabels: Record<string, string> = {
  open: 'Aberta',
  pending: 'Pendente',
  resolved: 'Resolvida',
  escalated: 'Escalada',
}

const channelIcons: Record<string, string> = {
  chat: '💬',
  email: '✉️',
  whatsapp: '📱',
  phone: '📞',
  social: '🌐',
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const timeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  return (
    <div className={cn(
      "group flex items-center gap-4 border-b border-zinc-800/30 p-4",
      "transition-colors hover:bg-zinc-800/20 last:border-0"
    )}>
      {/* Channel icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 text-lg">
        {channelIcons[conversation.channel] || '💬'}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-200 truncate">
            {conversation.customerName}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-medium text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-zinc-500">
          {conversation.subject || conversation.lastMessage}
        </p>
      </div>

      {/* Assigned to */}
      <div className="hidden items-center gap-1.5 text-xs text-zinc-500 md:flex">
        {conversation.assignedAIAgentId ? (
          <>
            <Bot className="h-3.5 w-3.5 text-emerald-400" />
            <span>IA</span>
          </>
        ) : conversation.assignedAgentId ? (
          <>
            <User className="h-3.5 w-3.5" />
            <span>Agente</span>
          </>
        ) : (
          <span className="text-zinc-600">Não atribuído</span>
        )}
      </div>

      {/* Priority badge */}
      <Badge 
        variant="outline" 
        className={cn(
          "hidden border text-xs capitalize md:inline-flex",
          priorityColors[conversation.priority]
        )}
      >
        {conversation.priority}
      </Badge>

      {/* Status */}
      <span className={cn(
        "hidden rounded-full px-2 py-1 text-xs lg:inline-flex",
        conversation.status === 'open' && "bg-emerald-500/20 text-emerald-400",
        conversation.status === 'pending' && "bg-yellow-500/20 text-yellow-400",
        conversation.status === 'resolved' && "bg-zinc-500/20 text-zinc-400",
        conversation.status === 'escalated' && "bg-red-500/20 text-red-400"
      )}>
        {statusLabels[conversation.status]}
      </span>

      {/* Time */}
      <div className="flex items-center gap-1 text-xs text-zinc-600">
        <Clock className="h-3 w-3" />
        <span>{timeAgo(conversation.updatedAt)}</span>
      </div>

      {/* Actions */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}

function AtendimentoContent() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const result = await getConversations()
        setConversations(result)
      } catch (error) {
        console.error('Failed to load conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-40 rounded bg-zinc-800 animate-pulse" />
            <div className="mt-2 h-4 w-56 rounded bg-zinc-800/60 animate-pulse" />
          </div>
        </div>
        <TableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Atendimento</h1>
          <p className="text-sm text-zinc-500">
            {conversations.length} conversas • {conversations.filter(c => c.status === 'open').length} abertas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input 
              placeholder="Buscar conversas..." 
              className="w-64 border-zinc-800 bg-zinc-900 pl-9 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700"
            />
          </div>
          <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversations list */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationRow key={conversation.id} conversation={conversation} />
          ))
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <MessageSquare className="mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">Nenhuma conversa encontrada</p>
          </div>
        )}
      </div>

      {/* Placeholder for chat panel */}
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
        <p className="text-sm font-medium text-zinc-500">Módulo em Construção</p>
        <p className="text-xs text-zinc-600">Painel de chat em tempo real com WebSocket</p>
      </div>
    </div>
  )
}

export function AtendimentoView() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AtendimentoContent />
    </Suspense>
  )
}
