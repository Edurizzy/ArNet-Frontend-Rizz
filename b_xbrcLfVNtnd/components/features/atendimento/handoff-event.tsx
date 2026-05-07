'use client'

import { ArrowRight } from 'lucide-react'
import type { Message } from '@/types/atendimento'

interface HandoffEventProps {
  message: Message
}

export function HandoffEvent({ message }: HandoffEventProps) {
  const { handoffFrom, handoffTo, handoffReason } = message.metadata || {}

  return (
    <div className="relative py-4">
      {/* Line */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-800" />

      {/* Event content */}
      <div className="relative mx-auto w-fit rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">Handoff</span>
          {handoffFrom && (
            <>
              <span className="text-zinc-600">de</span>
              <span className="text-zinc-300">{handoffFrom}</span>
            </>
          )}
          {handoffTo && (
            <>
              <ArrowRight className="h-3 w-3 text-zinc-600" />
              <span className="text-zinc-300">{handoffTo}</span>
            </>
          )}
        </div>
        {handoffReason && (
          <p className="mt-1 text-center text-[10px] text-zinc-600">
            {handoffReason}
          </p>
        )}
      </div>
    </div>
  )
}
