'use client'

import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AIConfidenceBadge } from './ai-confidence-badge'
import type { Message } from '@/types/atendimento'

interface MessageBubbleProps {
  message: Message
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isCustomer = message.type === 'customer'
  const isAI = message.type === 'ai'
  const isAgent = message.type === 'agent'

  return (
    <div
      className={cn(
        "flex gap-3",
        !isCustomer && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isCustomer && (
          <Avatar className="h-8 w-8 border border-zinc-700/50">
            <AvatarFallback className="bg-zinc-800 text-xs font-medium text-zinc-300">
              {message.senderName ? getInitials(message.senderName) : 'CL'}
            </AvatarFallback>
          </Avatar>
        )}
        {isAI && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <Bot className="h-4 w-4 text-emerald-400" />
          </div>
        )}
        {isAgent && (
          <Avatar className="h-8 w-8 border border-zinc-700/50">
            <AvatarFallback className="bg-zinc-700 text-xs font-medium text-zinc-200">
              {message.senderName ? getInitials(message.senderName) : 'AG'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[70%] space-y-1",
          !isCustomer && "items-end"
        )}
      >
        {/* Sender name and AI indicator */}
        <div
          className={cn(
            "flex items-center gap-2 text-[10px]",
            !isCustomer && "flex-row-reverse"
          )}
        >
          <span className="font-medium text-zinc-500">
            {message.senderName || (isCustomer ? 'Cliente' : isAI ? 'IA' : 'Agente')}
          </span>
          {isAI && message.metadata?.aiConfidence && (
            <AIConfidenceBadge
              confidence={message.metadata.aiConfidence}
              source={message.metadata.automationSource}
            />
          )}
        </div>

        {/* Message content */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isCustomer && "rounded-tl-md bg-zinc-800/60 text-zinc-200",
            isAI && "rounded-tr-md border border-emerald-500/20 bg-zinc-900/80 text-zinc-200",
            isAgent && "rounded-tr-md bg-zinc-700/60 text-zinc-100",
            message.isInternal && "border-2 border-dashed border-amber-500/30 bg-amber-500/5"
          )}
        >
          {message.isInternal && (
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-amber-400">
              Nota Interna
            </span>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "block text-[10px] text-zinc-600",
            !isCustomer && "text-right"
          )}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
