'use client'

import { Suspense } from 'react'
import { useAiStudioTabStore } from '@/stores/ai-studio-store'
import { 
  AiStudioLayout, 
  AgentManager, 
  PromptEditor,
  KnowledgeBaseManager,
  ToolCallingConfig,
  AiTelemetryDashboard,
} from '@/components/features/ai-studio'
import { PageSkeleton } from '@/components/shared/loading-states'

function AgentsTab() {
  return (
    <div className="flex h-full">
      {/* Left: Agent Manager */}
      <div className="w-[420px] flex-shrink-0 border-r border-zinc-800/50">
        <AgentManager />
      </div>
      
      {/* Right: Prompt Editor */}
      <div className="flex-1 overflow-hidden">
        <PromptEditor />
      </div>
    </div>
  )
}

function KnowledgeBaseTab() {
  return (
    <div className="h-full">
      <KnowledgeBaseManager />
    </div>
  )
}

function ToolsTab() {
  return (
    <div className="h-full">
      <ToolCallingConfig />
    </div>
  )
}

function TelemetryTab() {
  return (
    <div className="h-full">
      <AiTelemetryDashboard />
    </div>
  )
}

function AIStudioContent() {
  const { activeTab } = useAiStudioTabStore()

  return (
    <AiStudioLayout>
      {activeTab === 'agents' && <AgentsTab />}
      {activeTab === 'knowledge-base' && <KnowledgeBaseTab />}
      {activeTab === 'tools' && <ToolsTab />}
      {activeTab === 'telemetry' && <TelemetryTab />}
    </AiStudioLayout>
  )
}

export function AIStudioView() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AIStudioContent />
    </Suspense>
  )
}
