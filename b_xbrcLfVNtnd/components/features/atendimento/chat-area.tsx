'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MessageSquare, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConversationHeader } from './conversation-header'
import { MessageBubble } from './message-bubble'
import { HandoffEvent } from './handoff-event'
import { MessageComposer } from './message-composer'
import { useActiveConversationStore } from '@/stores/atendimento-store'
import { useHelpdeskSocket } from '@/hooks/useHelpdeskSocket'
import { useMessageStore } from '@/stores/useMessageStore'
import {
  getConversationMessages,
  getCustomerProfile,
  getSLAInfo,
  mockAtendimentoConversations,
  sendMessage,
} from '@/services/atendimento-api'
import type { SLAInfo } from '@/types/atendimento'
import { useState } from 'react'

function ChatAreaSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-zinc-800/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full bg-zinc-800" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <Skeleton className="h-3 w-20 bg-zinc-800/60" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded bg-zinc-800" />
          <Skeleton className="h-8 w-20 rounded bg-zinc-800" />
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 space-y-4 p-4">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
          <Skeleton className="h-16 w-64 rounded-lg bg-zinc-800" />
        </div>
        <div className="flex justify-end gap-3">
          <Skeleton className="h-20 w-72 rounded-lg bg-zinc-800" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
          <Skeleton className="h-12 w-48 rounded-lg bg-zinc-800" />
        </div>
      </div>

      {/* Composer skeleton */}
      <div className="border-t border-zinc-800/30 p-4">
        <Skeleton className="h-12 w-full rounded-lg bg-zinc-800" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">
        <MessageSquare className="h-8 w-8 text-zinc-600" />
      </div>
      <h3 className="text-lg font-medium text-zinc-400">
        Selecione uma conversa
      </h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-600">
        Escolha uma conversa na fila à esquerda para iniciar o atendimento
      </p>
    </div>
  )
}

export function ChatArea() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldStickToBottomRef = useRef(true)
  const [slaInfo, setSlaInfo] = useState<SLAInfo | null>(null)
  const { connectionState, isConnected, reconnect } = useHelpdeskSocket()
  
  const selectedConversationId = useActiveConversationStore((state) => state.selectedConversationId)
  const conversation = useActiveConversationStore((state) => state.conversation)
  const isLoadingMessages = useActiveConversationStore((state) => state.isLoadingMessages)
  const setConversation = useActiveConversationStore((state) => state.setConversation)
  const setCustomerProfile = useActiveConversationStore((state) => state.setCustomerProfile)
  const setLoadingMessages = useActiveConversationStore((state) => state.setLoadingMessages)
  const setLoadingProfile = useActiveConversationStore((state) => state.setLoadingProfile)
  const setSendingMessage = useActiveConversationStore((state) => state.setSendingMessage)
  const hydrateMessages = useMessageStore((state) => state.hydrateMessages)
  const addMessage = useMessageStore((state) => state.addMessage)
  const replaceOptimisticMessage = useMessageStore((state) => state.replaceOptimisticMessage)
  const markMessageFailed = useMessageStore((state) => state.markMessageFailed)
  const messages = useMessageStore(
    useShallow((state) => {
      if (!selectedConversationId) return []
      return (state.messagesByTicketId[selectedConversationId] ?? [])
        .map((id) => state.messagesById[id])
        .filter(Boolean)
    })
  )

  // Load conversation data when selection changes
  useEffect(() => {
    if (!selectedConversationId) return
    const abortController = new AbortController()

    const loadConversationData = async () => {
      setLoadingMessages(true)
      setLoadingProfile(true)

      try {
        // Find conversation from mock data
        const conv = mockAtendimentoConversations.find(
          (c) => c.id === selectedConversationId
        )
        if (conv) {
          setConversation(conv)
        }

        // Load messages
        const messagesData = await getConversationMessages(selectedConversationId)
        if (abortController.signal.aborted) return
        hydrateMessages(selectedConversationId, messagesData)

        // Load customer profile
        if (conv?.customerId) {
          const profile = await getCustomerProfile(conv.customerId)
          if (abortController.signal.aborted) return
          setCustomerProfile(profile)
        }

        // Load SLA
        const sla = await getSLAInfo(selectedConversationId)
        if (abortController.signal.aborted) return
        setSlaInfo(sla)
      } catch (error) {
        console.error('Failed to load conversation data:', error)
      } finally {
        if (abortController.signal.aborted) return
        setLoadingMessages(false)
        setLoadingProfile(false)
      }
    }

    loadConversationData()
    return () => abortController.abort()
  }, [selectedConversationId, setConversation, hydrateMessages, setCustomerProfile, setLoadingMessages, setLoadingProfile])

  const connectionTone = useMemo(() => {
    if (isConnected) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    if (connectionState === 'connecting' || connectionState === 'reconnecting') {
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    }
    return 'border-red-500/30 bg-red-500/10 text-red-300'
  }, [connectionState, isConnected])

  const handleScroll = useCallback(() => {
    const element = scrollContainerRef.current
    if (!element) return

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
    shouldStickToBottomRef.current = distanceFromBottom < 96
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const element = scrollContainerRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior })
  }, [])

  // Auto-scroll only when the operator is already near the latest message.
  useEffect(() => {
    if (shouldStickToBottomRef.current) scrollToBottom('smooth')
  }, [messages.length, scrollToBottom])

  const handleRetryMessage = useCallback(async (messageId: string) => {
    const failedMessage = useMessageStore.getState().messagesById[messageId]
    if (!failedMessage) return

    const correlationId = `retry-${crypto.randomUUID()}`
    addMessage({
      ...failedMessage,
      metadata: {
        ...failedMessage.metadata,
        deliveryStatus: 'sending',
        delivery_status: 'sending',
        correlationId,
        correlation_id: correlationId,
      },
    })

    setSendingMessage(true)
    try {
      const confirmedMessage = await sendMessage(
        failedMessage.conversationId,
        failedMessage.content,
        Boolean(failedMessage.isInternal),
        correlationId
      )
      replaceOptimisticMessage(correlationId, confirmedMessage)
    } catch (error) {
      markMessageFailed(messageId, error instanceof Error ? error.message : 'Falha ao reenviar')
    } finally {
      setSendingMessage(false)
    }
  }, [addMessage, markMessageFailed, replaceOptimisticMessage, setSendingMessage])

  if (!selectedConversationId) {
    return <EmptyState />
  }

  if (isLoadingMessages && messages.length === 0) {
    return <ChatAreaSkeleton />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Conversation Header */}
      <div className="border-b border-zinc-800/30">
        <div className="flex items-center justify-between gap-3 pr-4">
          <div className="min-w-0 flex-1">
            {conversation && (
              <ConversationHeader conversation={conversation} slaInfo={slaInfo} />
            )}
          </div>
          <Badge variant="outline" className={cn('gap-1.5 whitespace-nowrap text-[10px]', connectionTone)}>
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connectionState}
          </Badge>
          {!isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              className="h-7 gap-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <RefreshCw className="h-3 w-3" />
              Reconectar
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="space-y-4 p-4">
          {messages.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800/70 bg-zinc-900/20 text-center">
              <MessageSquare className="mb-2 h-6 w-6 text-zinc-600" />
              <p className="text-sm text-zinc-500">Nenhuma mensagem ainda</p>
              <p className="mt-1 text-xs text-zinc-700">Envie a primeira resposta para iniciar o atendimento.</p>
            </div>
          )}
          {messages.map((message) => {
            if (message.type === 'system') {
              return <HandoffEvent key={message.id} message={message} />
            }
            return (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={handleRetryMessage}
              />
            )
          })}
        </div>
      </div>

      {/* Message Composer */}
      <MessageComposer conversationId={selectedConversationId} />
    </div>
  )
}
