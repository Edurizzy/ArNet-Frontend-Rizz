'use client'

import { cn } from '@/lib/utils'
import { useAgentSelectionStore } from '@/stores/ai-studio-store'
import { AVAILABLE_MODELS } from '@/types/ai-studio'
import { 
  Code2, 
  Save, 
  RotateCcw, 
  Settings2, 
  Thermometer, 
  Hash,
  Shield,
  Wrench,
  AlertCircle,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PromptEditor() {
  const {
    selectedAgent,
    draftSystemPrompt,
    draftTemperature,
    draftMaxTokens,
    draftModel,
    hasUnsavedChanges,
    setDraftSystemPrompt,
    setDraftTemperature,
    setDraftMaxTokens,
    setDraftModel,
    discardChanges,
  } = useAgentSelectionStore()

  if (!selectedAgent) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-zinc-950 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900/50 text-zinc-700">
          <Code2 className="h-8 w-8" />
        </div>
        <p className="mt-4 text-center text-sm text-zinc-600">
          Selecione um agente para<br />editar a configuração
        </p>
      </div>
    )
  }

  const selectedModelConfig = AVAILABLE_MODELS.find(m => m.id === draftModel)

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100">{selectedAgent.name}</h2>
              <p className="text-xs text-zinc-500">Configuração de Prompt</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                <AlertCircle className="h-3 w-3" />
                Alterações não salvas
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 h-8"
              onClick={discardChanges}
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Descartar
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700 h-8"
              disabled={!hasUnsavedChanges}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* System Prompt Editor */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5" />
              System Prompt
            </Label>
            <div className="relative">
              <textarea
                value={draftSystemPrompt}
                onChange={(e) => setDraftSystemPrompt(e.target.value)}
                className={cn(
                  "w-full min-h-[280px] rounded-lg border bg-black p-4",
                  "font-mono text-sm text-zinc-300 leading-relaxed",
                  "placeholder:text-zinc-700 resize-y",
                  "focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                  "border-zinc-800/50"
                )}
                placeholder="Digite o system prompt do agente..."
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-zinc-600">
                <span className="font-mono">{draftSystemPrompt.length} chars</span>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5" />
              Modelo
            </Label>
            <Select value={draftModel} onValueChange={setDraftModel}>
              <SelectTrigger className="h-10 bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      <span className="ml-2 text-xs text-zinc-500">{model.provider}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModelConfig && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-400 font-mono">
                  {selectedModelConfig.contextWindow.toLocaleString()} tokens
                </span>
                {selectedModelConfig.supportsTools && (
                  <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Tools
                  </span>
                )}
                {selectedModelConfig.supportsVision && (
                  <span className="rounded bg-blue-500/10 px-2 py-1 text-blue-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Vision
                  </span>
                )}
                <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-400 font-mono">
                  ${selectedModelConfig.costPer1kTokens}/1K tokens
                </span>
              </div>
            )}
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                <Thermometer className="h-3.5 w-3.5" />
                Temperature
              </Label>
              <span className="font-mono text-sm text-zinc-300">{draftTemperature.toFixed(2)}</span>
            </div>
            <Slider
              value={[draftTemperature]}
              onValueChange={([value]) => setDraftTemperature(value)}
              min={0}
              max={2}
              step={0.05}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Determinístico</span>
              <span>Criativo</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                <Hash className="h-3.5 w-3.5" />
                Max Tokens
              </Label>
              <span className="font-mono text-sm text-zinc-300">{draftMaxTokens.toLocaleString()}</span>
            </div>
            <Slider
              value={[draftMaxTokens]}
              onValueChange={([value]) => setDraftMaxTokens(value)}
              min={256}
              max={selectedModelConfig?.contextWindow || 8192}
              step={256}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>256</span>
              <span>{(selectedModelConfig?.contextWindow || 8192).toLocaleString()}</span>
            </div>
          </div>

          {/* Tool Assignments */}
          <div className="space-y-3">
            <Label className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5" />
              Ferramentas Atribuídas
            </Label>
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
              {selectedAgent.toolAssignments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.toolAssignments.map((toolId) => (
                    <span
                      key={toolId}
                      className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                    >
                      <Wrench className="h-3 w-3 text-zinc-500" />
                      {toolId}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600">Nenhuma ferramenta atribuída</p>
              )}
            </div>
          </div>

          {/* Guardrails */}
          <div className="space-y-3">
            <Label className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Guardrails & Segurança
            </Label>
            <div className="space-y-3 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm text-zinc-300">Filtro de Conteúdo</Label>
                  <p className="text-xs text-zinc-600">Bloqueia conteúdo inapropriado</p>
                </div>
                <Switch checked={selectedAgent.guardrails.contentFiltering} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm text-zinc-300">Detecção de PII</Label>
                  <p className="text-xs text-zinc-600">Identifica dados sensíveis</p>
                </div>
                <Switch checked={selectedAgent.guardrails.piiDetection} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm text-zinc-300">Confirmação Obrigatória</Label>
                  <p className="text-xs text-zinc-600">Requer aprovação para ações</p>
                </div>
                <Switch checked={selectedAgent.guardrails.requireConfirmation} disabled />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
