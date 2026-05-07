'use client';

import { useEffect } from 'react';
import { X, Edit2, Save, RotateCcw, Play, GitBranch, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflowSelectionStore, useWorkflowBuilderStore, useSimulationStore } from '@/stores/automations-store';
import { fetchWorkflowById } from '@/services/automations-api';
import { LogicNode } from './logic-node';
import { WorkflowExecutionTimeline } from './workflow-execution-timeline';
import { WorkflowHealthIndicator } from './workflow-health-indicator';
import { cn } from '@/lib/utils';

export function WorkflowBuilder() {
  const { selectedWorkflowId, closeBuilder, builderMode } = useWorkflowSelectionStore();
  const { currentWorkflow, draftNodes, setCurrentWorkflow, hasUnsavedChanges } = useWorkflowBuilderStore();
  const { isSimulating, simulationSteps, simulationLogs } = useSimulationStore();

  useEffect(() => {
    if (!selectedWorkflowId) return;

    const loadWorkflow = async () => {
      const workflow = await fetchWorkflowById(selectedWorkflowId);
      setCurrentWorkflow(workflow);
    };

    loadWorkflow();
  }, [selectedWorkflowId, setCurrentWorkflow]);

  if (!currentWorkflow) {
    return (
      <div className="flex h-full flex-col bg-zinc-950">
        <div className="border-b border-zinc-800 p-4">
          <Skeleton className="h-6 w-48 bg-zinc-800" />
          <Skeleton className="mt-2 h-4 w-64 bg-zinc-800" />
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Builder Header */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WorkflowHealthIndicator health={currentWorkflow.healthState} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-100">{currentWorkflow.name}</h2>
                <Badge
                  variant="outline"
                  className="h-5 border-zinc-700 bg-zinc-900 px-1.5 text-[10px] font-mono text-zinc-400"
                >
                  {currentWorkflow.versionLabel}
                </Badge>
                {hasUnsavedChanges && (
                  <span className="text-[10px] text-amber-500">Alterações não salvas</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">{currentWorkflow.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {builderMode === 'edit' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-300"
                >
                  <RotateCcw className="mr-1.5 h-3 w-3" />
                  Reverter
                </Button>
                <Button
                  size="sm"
                  className="h-7 bg-emerald-600 text-xs hover:bg-emerald-700"
                >
                  <Save className="mr-1.5 h-3 w-3" />
                  Salvar
                </Button>
              </>
            )}

            {builderMode === 'view' && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-300"
              >
                <Edit2 className="mr-1.5 h-3 w-3" />
                Editar
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100"
              onClick={closeBuilder}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Workflow Stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-zinc-600" />
            <span>Trigger: {currentWorkflow.triggerLabel}</span>
          </div>
          <span className="text-zinc-700">·</span>
          <div className="flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-zinc-600" />
            <span>{currentWorkflow.nodes.length} nós</span>
          </div>
          <span className="text-zinc-700">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-600" />
            <span>~{currentWorkflow.avgExecutionTimeMs}ms médio</span>
          </div>
          <span className="text-zinc-700">·</span>
          <span className="text-emerald-500">{currentWorkflow.successRate}% sucesso</span>
        </div>
      </div>

      {/* Simulation Timeline (when active) */}
      {isSimulating && (
        <div className="border-b border-zinc-800 bg-zinc-900/30 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-amber-500">
            <Play className="h-3.5 w-3.5 animate-pulse" />
            <span className="font-medium">Simulação em andamento</span>
          </div>
          <WorkflowExecutionTimeline nodes={draftNodes} simulationSteps={simulationSteps} />
        </div>
      )}

      {/* Node Flow */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="mx-auto max-w-2xl space-y-1">
            {draftNodes.map((node, index) => (
              <div key={node.id} className="relative">
                <LogicNode
                  node={node}
                  simulationState={simulationSteps.get(node.id)}
                  isLast={index === draftNodes.length - 1}
                />

                {/* Connector Line */}
                {index < draftNodes.length - 1 && (
                  <div className="absolute left-1/2 -bottom-1 h-6 w-px -translate-x-1/2 bg-zinc-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Simulation Logs */}
      {isSimulating && simulationLogs.length > 0 && (
        <div className="border-t border-zinc-800 bg-black/50 p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 mb-2">
            Logs de Simulação
          </div>
          <ScrollArea className="h-24">
            <div className="space-y-0.5 font-mono text-[11px]">
              {simulationLogs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    'text-zinc-400',
                    log.includes('Sucesso') && 'text-emerald-400',
                    log.includes('Falha') && 'text-red-400',
                    log.includes('Iniciando') && 'text-blue-400'
                  )}
                >
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
