'use client'

import { MessageSquare, Mail, Phone, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Conversation } from '@/types/domain'

interface TicketCardProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

const channelIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare className="h-3 w-3 text-green-400" />,
  chat: <MessageSquare className="h-3 w-3 text-blue-400" />,
  email: <Mail className="h-3 w-3 text-amber-400" />,
  phone: <Phone className="h-3 w-3 text-purple-400" />,
  social: <Globe className="h-3 w-3 text-pink-400" />,
}

const statusColors: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400',
  pending: 'bg-amber-500/20 text-amber-400',
  resolved: 'bg-zinc-500/20 text-zinc-400',
  escalated: 'bg-red-500/20 text-red-400',
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  pending: 'Aguardando',
  resolved: 'Resolvido',
  escalated: 'Escalado',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function TicketCard({ conversation, isSelected, onClick }: TicketCardProps) {
  const initials = getInitials(conversation.customerName)
  const timeAgo = getTimeAgo(conversation.updatedAt)

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-lg p-3 text-left transition-colors",
        isSelected
          ? "bg-zinc-800/60"
          : "hover:bg-zinc-800/30"
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r bg-emerald-500" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-9 w-9 border border-zinc-700/50">
            <AvatarFallback className="bg-zinc-800 text-xs font-medium text-zinc-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Channel icon overlay */}
          <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-900 bg-zinc-800">
            {channelIcons[conversation.channel] || channelIcons.chat}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-zinc-200">
              {conversation.customerName}
            </span>
            <span className="flex-shrink-0 text-[10px] text-zinc-600">
              {timeAgo}
            </span>
          </div>

          {/* Last message */}
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {conversation.lastMessage}
          </p>

          {/* Footer row */}
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "h-5 rounded px-1.5 text-[10px] font-normal",
                statusColors[conversation.status]
              )}
            >
              {statusLabels[conversation.status]}
            </Badge>

            {/* Unread badge */}
            {conversation.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-medium text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
