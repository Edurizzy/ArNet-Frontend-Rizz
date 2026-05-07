'use client'

import { MessageSquare, Mail, Phone, Globe, Clock, CheckCircle, ArrowRightLeft, PanelRightClose, PanelRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SLATimer } from './sla-timer'
import { useCustomerContextUIStore } from '@/stores/atendimento-store'
import type { Conversation } from '@/types/domain'
import type { SLAInfo } from '@/types/atendimento'

interface ConversationHeaderProps {
  conversation: Conversation
  slaInfo: SLAInfo | null
}

const channelLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare className="h-3.5 w-3.5 text-green-400" /> },
  chat: { label: 'Chat', icon: <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> },
  email: { label: 'Email', icon: <Mail className="h-3.5 w-3.5 text-amber-400" /> },
  phone: { label: 'Telefone', icon: <Phone className="h-3.5 w-3.5 text-purple-400" /> },
  social: { label: 'Social', icon: <Globe className="h-3.5 w-3.5 text-pink-400" /> },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ConversationHeader({ conversation, slaInfo }: ConversationHeaderProps) {
  const { isCollapsed, toggleCollapsed } = useCustomerContextUIStore()
  const channel = channelLabels[conversation.channel] || channelLabels.chat
  const initials = getInitials(conversation.customerName)

  return (
    <div className="flex items-center justify-between border-b border-zinc-800/30 bg-zinc-900/30 px-4 py-3">
      {/* Left: Customer info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border border-zinc-700/50">
          <AvatarFallback className="bg-zinc-800 text-xs font-medium text-zinc-300">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-200">
              {conversation.customerName}
            </span>
            <Badge
              variant="outline"
              className="h-5 gap-1 border-zinc-700/50 bg-zinc-800/50 px-1.5 text-[10px] font-normal text-zinc-400"
            >
              {channel.icon}
              <span>{channel.label}</span>
            </Badge>
          </div>
          {conversation.subject && (
            <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
              {conversation.subject}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions and SLA */}
      <div className="flex items-center gap-2">
        {/* SLA Timer */}
        {slaInfo && <SLATimer slaInfo={slaInfo} />}

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-zinc-700/50 bg-zinc-800/50 text-xs text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Marcar como Resolvido</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-zinc-700/50 bg-zinc-800/50 text-xs text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Transferir</span>
        </Button>

        {/* Toggle context panel */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          {isCollapsed ? (
            <PanelRight className="h-4 w-4" />
          ) : (
            <PanelRightClose className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
