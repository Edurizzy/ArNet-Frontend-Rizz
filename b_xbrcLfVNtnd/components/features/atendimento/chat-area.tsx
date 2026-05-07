'use client'

import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ConversationHeader } from './conversation-header'
import { MessageBubble } from './message-bubble'
import { HandoffEvent } from './handoff-event'
import { MessageComposer } from './message-composer'
import { useActiveConversationStore } from '@/stores/atendimento-store'
import {
  getConversationMessages,
  getCustomerProfile,
  getSLAInfo,
  mockAtendimentoConversations,
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [slaInfo, setSlaInfo] = useState<SLAInfo | null>(null)
  
  const {
    selectedConversationId,
    conversation,
    messages,
    isLoadingMessages,
    setConversation,
    setMessages,
    setCustomerProfile,
    setLoadingMessages,
    setLoadingProfile,
  } = useActiveConversationStore()

  // Load conversation data when selection changes
  useEffect(() => {
    if (!selectedConversationId) return

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
        setMessages(messagesData)

        // Load customer profile
        if (conv?.customerId) {
          const profile = await getCustomerProfile(conv.customerId)
          setCustomerProfile(profile)
        }

        // Load SLA
        const sla = await getSLAInfo(selectedConversationId)
        setSlaInfo(sla)
      } catch (error) {
        console.error('Failed to load conversation data:', error)
      } finally {
        setLoadingMessages(false)
        setLoadingProfile(false)
      }
    }

    loadConversationData()
  }, [selectedConversationId, setConversation, setMessages, setCustomerProfile, setLoadingMessages, setLoadingProfile])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!selectedConversationId) {
    return <EmptyState />
  }

  if (isLoadingMessages && messages.length === 0) {
    return <ChatAreaSkeleton />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Conversation Header */}
      {conversation && (
        <ConversationHeader conversation={conversation} slaInfo={slaInfo} />
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map((message) => {
            if (message.type === 'system') {
              return <HandoffEvent key={message.id} message={message} />
            }
            return <MessageBubble key={message.id} message={message} />
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Composer */}
      <MessageComposer conversationId={selectedConversationId} />
    </div>
  )
}
