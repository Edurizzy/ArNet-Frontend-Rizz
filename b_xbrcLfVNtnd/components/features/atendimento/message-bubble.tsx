'use client'

import { memo } from 'react'
import { AlertCircle, Bot, Check, CheckCheck, Loader2, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AIConfidenceBadge } from './ai-confidence-badge'
import type { Message } from '@/types/atendimento'

interface MessageBubbleProps {
  message: Message
  onRetry?: (messageId: string) => void
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

function MessageBubbleComponent({ message, onRetry }: MessageBubbleProps) {
  const isCustomer = message.type === 'customer'
  const isAI = message.type === 'ai'
  const isAgent = message.type === 'agent'
  const deliveryStatus = message.metadata?.deliveryStatus ?? message.metadata?.delivery_status
  const isSending = deliveryStatus === 'sending'
  const isFailed = deliveryStatus === 'failed'
  const showOutboundTicks =
    isAgent &&
    !message.isInternal &&
    (deliveryStatus === 'sending' ||
      deliveryStatus === 'sent' ||
      deliveryStatus === 'delivered' ||
      deliveryStatus === 'read')

  const deliveryLabel =
    deliveryStatus === 'sending'
      ? 'Enviando'
      : deliveryStatus === 'sent'
        ? 'Enviada'
        : deliveryStatus === 'delivered'
          ? 'Entregue'
          : deliveryStatus === 'read'
            ? 'Lida'
            : deliveryStatus === 'failed'
              ? 'Falhou ao enviar'
              : undefined

  return (
    <div
      className={cn(
        "flex gap-3",
        !isCustomer && "flex-row-reverse",
        isSending && "opacity-[0.92]"
      )}
    >
      <div className="shrink-0">
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

      <div
        className={cn(
          "max-w-[70%] space-y-1",
          !isCustomer && "items-end"
        )}
      >
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

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isCustomer && "rounded-tl-md bg-zinc-800/60 text-zinc-200",
            isAI && "rounded-tr-md border border-emerald-500/20 bg-zinc-900/80 text-zinc-200",
            isAgent && "rounded-tr-md bg-zinc-700/60 text-zinc-100",
            message.isInternal && "border-2 border-dashed border-amber-500/30 bg-amber-500/5",
            isFailed && "border border-red-500/40 bg-red-500/10"
          )}
        >
          {message.isInternal && (
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-amber-400">
              Nota Interna
            </span>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-2 text-[10px] text-zinc-600",
            !isCustomer && "justify-end text-right"
          )}
        >
          <span>{formatTime(message.timestamp)}</span>

          {showOutboundTicks && deliveryLabel && (
            <span
              className="inline-flex items-center gap-1 text-zinc-500"
              aria-label={deliveryLabel}
              title={deliveryLabel}
            >
              {deliveryStatus === 'sending' && (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-amber-400/90" aria-hidden />
              )}
              {deliveryStatus === 'sent' && (
                <Check className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden strokeWidth={2.5} />
              )}
              {(deliveryStatus === 'delivered' || deliveryStatus === 'read') && (
                <CheckCheck
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    deliveryStatus === 'read' ? 'text-sky-400' : 'text-zinc-400'
                  )}
                  aria-hidden
                  strokeWidth={2.5}
                />
              )}
            </span>
          )}

          {isSending && !showOutboundTicks && (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              <span>enviando</span>
            </span>
          )}

          {isFailed && (
            <span className="inline-flex items-center gap-1 text-red-400">
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
              <span>falhou</span>
              {onRetry && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRetry(message.id)}
                  className="h-5 px-1.5 text-[10px] text-red-300 hover:bg-red-500/10 hover:text-red-200"
                >
                  <RefreshCcw className="mr-1 h-3 w-3" aria-hidden />
                  tentar
                </Button>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleComponent)
