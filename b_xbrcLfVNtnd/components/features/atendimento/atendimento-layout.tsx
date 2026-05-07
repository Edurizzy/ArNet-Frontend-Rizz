'use client'

import { cn } from '@/lib/utils'
import { TicketQueue } from './ticket-queue'
import { ChatArea } from './chat-area'
import { CustomerContext } from './customer-context'
import { useCustomerContextUIStore } from '@/stores/atendimento-store'

export function AtendimentoLayout() {
  const { isCollapsed } = useCustomerContextUIStore()

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left Column - Ticket Queue */}
      <div className="w-80 flex-shrink-0 border-r border-zinc-800/50 bg-zinc-950">
        <TicketQueue />
      </div>

      {/* Center Column - Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
        <ChatArea />
      </div>

      {/* Right Column - Customer Context */}
      <div
        className={cn(
          "flex-shrink-0 border-l border-zinc-800/50 bg-zinc-950 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-0 overflow-hidden" : "w-80"
        )}
      >
        <CustomerContext />
      </div>
    </div>
  )
}
