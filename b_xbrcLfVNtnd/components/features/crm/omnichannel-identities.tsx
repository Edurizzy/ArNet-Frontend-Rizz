'use client'

import { 
  MessageCircle as WhatsApp, 
  Mail, 
  Instagram, 
  Send as Telegram, 
  Globe,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OmnichannelIdentity, ChannelType } from '@/types/crm'

interface OmnichannelIdentitiesProps {
  identities: OmnichannelIdentity[]
}

const channelConfig: Record<ChannelType, { 
  icon: React.ComponentType<{ className?: string }>
  label: string
  bgColor: string
  iconColor: string
}> = {
  whatsapp: { 
    icon: WhatsApp, 
    label: 'WhatsApp', 
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-400'
  },
  email: { 
    icon: Mail, 
    label: 'Email', 
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-400'
  },
  instagram: { 
    icon: Instagram, 
    label: 'Instagram', 
    bgColor: 'bg-pink-500/10',
    iconColor: 'text-pink-400'
  },
  telegram: { 
    icon: Telegram, 
    label: 'Telegram', 
    bgColor: 'bg-sky-500/10',
    iconColor: 'text-sky-400'
  },
  web: { 
    icon: Globe, 
    label: 'Portal Web', 
    bgColor: 'bg-zinc-500/10',
    iconColor: 'text-zinc-400'
  },
  sms: { 
    icon: Smartphone, 
    label: 'SMS', 
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400'
  },
}

export function OmnichannelIdentities({ identities }: OmnichannelIdentitiesProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(date))
  }

  if (identities.length === 0) {
    return (
      <p className="text-sm text-zinc-500">Nenhum canal vinculado</p>
    )
  }

  return (
    <div className="space-y-2">
      {identities.map((identity, index) => {
        const config = channelConfig[identity.channel]
        const Icon = config.icon

        return (
          <div
            key={`${identity.channel}-${index}`}
            className={cn(
              "flex items-center gap-3 rounded-lg p-2.5",
              config.bgColor
            )}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900/50",
              config.iconColor
            )}>
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {identity.identifier}
                </p>
                {identity.isVerified ? (
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                )}
              </div>
              <p className="text-xs text-zinc-500">
                {config.label}
                {identity.lastUsedAt && ` • Último uso: ${formatDate(identity.lastUsedAt)}`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
