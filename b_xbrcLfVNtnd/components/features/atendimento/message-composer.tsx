'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Paperclip, EyeOff, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useComposerStore, useActiveConversationStore } from '@/stores/atendimento-store'
import { useMessageStore } from '@/stores/useMessageStore'
import { sendMessage } from '@/services/atendimento-api'

interface MessageComposerProps {
  conversationId: string
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const { content, isInternalNote, setContent, setInternalNote, reset } = useComposerStore()
  const setSendingMessage = useActiveConversationStore((state) => state.setSendingMessage)
  const isSendingMessage = useActiveConversationStore((state) => state.isSendingMessage)
  const addOptimisticMessage = useMessageStore((state) => state.addOptimisticMessage)
  const replaceOptimisticMessage = useMessageStore((state) => state.replaceOptimisticMessage)
  const markMessageFailed = useMessageStore((state) => state.markMessageFailed)

  const sendLatchRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleSend = useCallback(async () => {
    if (!content.trim() || isSendingMessage || sendLatchRef.current) return

    const messageContent = content.trim()
    const correlationId = crypto.randomUUID()

    sendLatchRef.current = true
    abortRef.current?.abort()
    const abortController = new AbortController()
    abortRef.current = abortController

    addOptimisticMessage(conversationId, {
      content: messageContent,
      correlationId,
      isInternal: isInternalNote,
      senderName: 'Joana',
      senderId: 'user-001',
    })
    reset()
    setSendingMessage(true)

    try {
      const newMessage = await sendMessage(conversationId, messageContent, correlationId, {
        isInternal: isInternalNote,
        signal: abortController.signal,
      })
      replaceOptimisticMessage(correlationId, newMessage)
    } catch (error) {
      if (abortController.signal.aborted) return
      console.error('Failed to send message:', error)
      markMessageFailed(correlationId, error instanceof Error ? error.message : 'Falha ao enviar')
    } finally {
      sendLatchRef.current = false
      if (abortRef.current === abortController) {
        abortRef.current = null
      }
      setSendingMessage(false)
    }
  }, [
    content,
    isInternalNote,
    conversationId,
    isSendingMessage,
    setSendingMessage,
    addOptimisticMessage,
    replaceOptimisticMessage,
    markMessageFailed,
    reset,
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="border-t border-zinc-800/30 bg-zinc-900/30 p-4">
      {isInternalNote && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-400">
          <EyeOff className="h-3 w-3" />
          <span>Escrevendo nota interna (não visível para o cliente)</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Anexar arquivo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={isInternalNote}
                  onPressedChange={setInternalNote}
                  className={cn(
                    "h-9 w-9 data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-400",
                    "hover:bg-zinc-800 hover:text-zinc-300"
                  )}
                >
                  <EyeOff className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Nota interna</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isInternalNote ? "Escreva uma nota interna..." : "Escreva uma mensagem..."}
          className={cn(
            "min-h-[44px] max-h-32 flex-1 resize-none border-zinc-800/50 bg-zinc-800/30 text-sm text-zinc-200 placeholder:text-zinc-600",
            "focus:border-zinc-700 focus:ring-0",
            isInternalNote && "border-amber-500/30 bg-amber-500/5"
          )}
          rows={1}
        />

        <Button
          onClick={() => void handleSend()}
          disabled={!content.trim() || isSendingMessage}
          size="icon"
          className={cn(
            "h-9 w-9 bg-emerald-600 text-white hover:bg-emerald-500",
            "disabled:bg-zinc-800 disabled:text-zinc-600"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
