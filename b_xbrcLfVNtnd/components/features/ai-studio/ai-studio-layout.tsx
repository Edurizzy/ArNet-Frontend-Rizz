'use client'

import { cn } from '@/lib/utils'
import { useAiStudioTabStore } from '@/stores/ai-studio-store'
import { Bot, Database, Wrench, Activity } from 'lucide-react'
import type { AiStudioTab } from '@/types/ai-studio'

interface TabConfig {
  id: AiStudioTab
  label: string
  icon: typeof Bot
}

const tabs: TabConfig[] = [
  { id: 'agents', label: 'Agentes Autônomos', icon: Bot },
  { id: 'knowledge-base', label: 'Base de Conhecimento', icon: Database },
  { id: 'tools', label: 'Ferramentas', icon: Wrench },
  { id: 'telemetry', label: 'Telemetria & Custos', icon: Activity },
]

interface AiStudioLayoutProps {
  children: React.ReactNode
}

export function AiStudioLayout({ children }: AiStudioLayoutProps) {
  const { activeTab, setActiveTab } = useAiStudioTabStore()

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-950">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-100">
                AI Studio & Operations
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                Central de operações e orquestração de agentes de IA
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900/50 px-3 py-1.5 font-mono text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-zinc-400">4 agentes ativos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-zinc-900 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  isActive ? "text-emerald-400" : "text-zinc-600"
                )} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
