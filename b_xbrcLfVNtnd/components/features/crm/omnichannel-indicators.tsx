'use client'

import { 
  MessageCircle as WhatsApp, 
  Mail, 
  Instagram, 
  Send as Telegram, 
  Globe,
  Smartphone
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { OmnichannelIdentity, ChannelType } from '@/types/crm'

interface OmnichannelIndicatorsProps {
  identities: OmnichannelIdentity[]
  maxVisible?: number
}

const channelConfig: Record<ChannelType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  whatsapp: { icon: WhatsApp, label: 'WhatsApp', color: 'text-green-400' },
  email: { icon: Mail, label: 'Email', color: 'text-blue-400' },
  instagram: { icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
  telegram: { icon: Telegram, label: 'Telegram', color: 'text-sky-400' },
  web: { icon: Globe, label: 'Portal Web', color: 'text-zinc-400' },
  sms: { icon: Smartphone, label: 'SMS', color: 'text-amber-400' },
}

export function OmnichannelIndicators({ identities, maxVisible = 4 }: OmnichannelIndicatorsProps) {
  const visibleIdentities = identities.slice(0, maxVisible)
  const hiddenCount = identities.length - maxVisible

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {visibleIdentities.map((identity, index) => {
          const config = channelConfig[identity.channel]
          const Icon = config.icon

          return (
            <Tooltip key={`${identity.channel}-${index}`}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded bg-zinc-800/50 transition-colors hover:bg-zinc-800",
                    identity.isVerified ? config.color : 'text-zinc-600'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="bg-zinc-800 border-zinc-700 text-zinc-200"
              >
                <div className="text-xs">
                  <p className="font-medium">{config.label}</p>
                  <p className="text-zinc-400">{identity.identifier}</p>
                  {!identity.isVerified && (
                    <p className="text-amber-400 mt-0.5">Não verificado</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {hiddenCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-800/50 text-zinc-500 text-xs font-medium">
                +{hiddenCount}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              className="bg-zinc-800 border-zinc-700 text-zinc-200"
            >
              <p className="text-xs">
                {hiddenCount} mais {hiddenCount === 1 ? 'canal' : 'canais'}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
