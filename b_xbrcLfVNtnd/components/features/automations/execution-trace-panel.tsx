'use client';

import { useEffect } from 'react';
import { X, Clock, RotateCcw, FileJson, Server, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useExecutionTracePanelStore } from '@/stores/automations-store';
import { fetchExecutionDetails, fetchExecutionTimeline } from '@/services/automations-api';
import { ExecutionStateBadge } from './execution-state-badge';
import { CorrelationIdBadge } from './correlation-id-badge';
import { JsonPayloadViewer } from './json-payload-viewer';
import { WorkflowExecutionTimeline } from './workflow-execution-timeline';
import { cn } from '@/lib/utils';

export function ExecutionTracePanel() {
  const {
    isOpen,
    executionId,
    execution,
    isLoading,
    activeTraceTab,
    closePanel,
    setExecution,
    setActiveTraceTab,
  } = useExecutionTracePanelStore();

  useEffect(() => {
    if (!executionId) return;

    const loadExecution = async () => {
      const exec = await fetchExecutionDetails(executionId);
      setExecution(exec);
    };

    loadExecution();
  }, [executionId, setExecution]);

  if (!isOpen) return null;

  if (isLoading || !execution) {
    return (
      <div className="flex h-full flex-col bg-zinc-950">
        <div className="border-b border-zinc-800 p-4">
          <Skeleton className="h-6 w-48 bg-zinc-800" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-20 w-full bg-zinc-800" />
          <Skeleton className="h-40 w-full bg-zinc-800" />
        </div>
      </div>
    );
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-200">Trace de Execução</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100"
            onClick={closePanel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-200">{execution.workflowName}</span>
            <ExecutionStateBadge state={execution.state} size="sm" />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(execution.durationMs)}
            </div>
            <CorrelationIdBadge correlationId={execution.correlationId} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTraceTab} onValueChange={(v) => setActiveTraceTab(v as typeof activeTraceTab)} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 h-8 bg-zinc-900/50 p-1">
          <TabsTrigger value="timeline" className="h-6 gap-1 px-2 text-[10px]">
            <Layers className="h-3 w-3" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="payload" className="h-6 gap-1 px-2 text-[10px]">
            <FileJson className="h-3 w-3" />
            Payload
          </TabsTrigger>
          <TabsTrigger value="metadata" className="h-6 gap-1 px-2 text-[10px]">
            <Server className="h-3 w-3" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="retries" className="h-6 gap-1 px-2 text-[10px]">
            <RotateCcw className="h-3 w-3" />
            Retries
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="timeline" className="mt-0 p-4">
            <div className="space-y-3">
              {execution.steps.map((step, index) => (
                <div
                  key={step.nodeId}
                  className={cn(
                    'rounded-md border p-3',
                    step.state === 'success' && 'border-emerald-800/30 bg-emerald-950/20',
                    step.state === 'failed' && 'border-red-800/30 bg-red-950/20',
                    step.state === 'running' && 'border-blue-800/30 bg-blue-950/20',
                    step.state === 'pending' && 'border-zinc-800 bg-zinc-900/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
                        {index + 1}
                      </span>
                      <span className="text-xs font-medium text-zinc-200">{step.nodeLabel}</span>
                    </div>
                    <ExecutionStateBadge state={step.state} size="sm" />
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-[11px] text-zinc-500">
                    <span>Tipo: {step.nodeType}</span>
                    {step.durationMs && <span>Duração: {step.durationMs}ms</span>}
                    {step.retryAttempts.length > 0 && (
                      <span className="text-amber-500">
                        {step.retryAttempts.length} retries
                      </span>
                    )}
                  </div>

                  {step.error && (
                    <div className="mt-2 rounded bg-red-950/30 px-2 py-1.5 text-[11px] text-red-400">
                      {step.error.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payload" className="mt-0 p-4 space-y-4">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Input Payload
              </div>
              <div className="mt-2">
                <JsonPayloadViewer data={execution.inputPayload || {}} maxHeight="200px" />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Output Payload
              </div>
              <div className="mt-2">
                <JsonPayloadViewer data={execution.outputPayload || {}} maxHeight="200px" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="mt-0 p-4">
            <div className="space-y-3">
              <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Runtime Metadata
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between rounded bg-zinc-900/50 px-3 py-2">
                  <span className="text-zinc-500">Execution ID</span>
                  <span className="font-mono text-zinc-300">{execution.id}</span>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 px-3 py-2">
                  <span className="text-zinc-500">Workflow Version</span>
                  <span className="font-mono text-zinc-300">v{execution.workflowVersion}</span>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 px-3 py-2">
                  <span className="text-zinc-500">Service ID</span>
                  <span className="font-mono text-zinc-300">{execution.metadata.serviceId}</span>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 px-3 py-2">
                  <span className="text-zinc-500">Worker ID</span>
                  <span className="font-mono text-zinc-300">{execution.metadata.workerId}</span>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 px-3 py-2">
                  <span className="text-zinc-500">Queue Name</span>
                  <span className="font-mono text-zinc-300">{execution.metadata.queueName}</span>
                </div>
                <div className="flex justify-between rounded bg-zinc-900/50 px-3 py-2">
                  <span className="text-zinc-500">Started At</span>
                  <span className="font-mono text-zinc-300">
                    {new Date(execution.startedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                {execution.completedAt && (
                  <div className="flex justify-between rounded bg-zinc-900/50 px-3 py-2">
                    <span className="text-zinc-500">Completed At</span>
                    <span className="font-mono text-zinc-300">
                      {new Date(execution.completedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retries" className="mt-0 p-4">
            {execution.steps.some((s) => s.retryAttempts.length > 0) ? (
              <div className="space-y-3">
                {execution.steps
                  .filter((s) => s.retryAttempts.length > 0)
                  .map((step) => (
                    <div key={step.nodeId} className="space-y-2">
                      <div className="text-xs font-medium text-zinc-300">{step.nodeLabel}</div>
                      {step.retryAttempts.map((retry) => (
                        <div
                          key={retry.attemptNumber}
                          className="rounded bg-amber-950/20 border border-amber-800/30 px-3 py-2"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-amber-400">
                              Tentativa #{retry.attemptNumber}
                            </span>
                            <ExecutionStateBadge state={retry.state} size="sm" />
                          </div>
                          <div className="mt-1 text-[11px] text-zinc-500">
                            {new Date(retry.startedAt).toLocaleString('pt-BR')}
                          </div>
                          {retry.error && (
                            <div className="mt-1 text-[11px] text-red-400">
                              {retry.error.message}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
                Nenhum retry registrado
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
