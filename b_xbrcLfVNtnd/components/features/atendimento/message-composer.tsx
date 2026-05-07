'use client'

import { useCallback } from 'react'
import { Paperclip, EyeOff, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useComposerStore, useActiveConversationStore } from '@/stores/atendimento-store'
import { sendMessage } from '@/services/atendimento-api'

interface MessageComposerProps {
  conversationId: string
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const { content, isInternalNote, setContent, setInternalNote, reset } = useComposerStore()
  const { addMessage, setSendingMessage, isSendingMessage } = useActiveConversationStore()

  const handleSend = useCallback(async () => {
    if (!content.trim() || isSendingMessage) return

    setSendingMessage(true)
    try {
      const newMessage = await sendMessage(conversationId, content, isInternalNote)
      addMessage(newMessage)
      reset()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
    }
  }, [content, isInternalNote, conversationId, isSendingMessage, setSendingMessage, addMessage, reset])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="border-t border-zinc-800/30 bg-zinc-900/30 p-4">
      {/* Internal note indicator */}
      {isInternalNote && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-400">
          <EyeOff className="h-3 w-3" />
          <span>Escrevendo nota interna (não visível para o cliente)</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Left actions */}
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

        {/* Input */}
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

        {/* Send button */}
        <Button
          onClick={handleSend}
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
