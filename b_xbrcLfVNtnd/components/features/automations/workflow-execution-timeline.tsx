'use client';

import { CheckCircle2, XCircle, Loader2, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogicNodeDefinition, ExecutionState, ExecutionTimeline } from '@/types/automations';

interface WorkflowExecutionTimelineProps {
  nodes: LogicNodeDefinition[];
  simulationSteps?: Map<string, 'pending' | 'running' | 'success' | 'failed'>;
  timeline?: ExecutionTimeline;
}

const stateConfig: Record<ExecutionState | 'pending' | 'running', { icon: React.ElementType; className: string; bgClass: string }> = {
  pending: { icon: Clock, className: 'text-zinc-500', bgClass: 'bg-zinc-800' },
  running: { icon: Loader2, className: 'text-blue-400 animate-spin', bgClass: 'bg-blue-500/20' },
  success: { icon: CheckCircle2, className: 'text-emerald-500', bgClass: 'bg-emerald-500/20' },
  failed: { icon: XCircle, className: 'text-red-500', bgClass: 'bg-red-500/20' },
  retrying: { icon: RotateCcw, className: 'text-amber-500 animate-spin', bgClass: 'bg-amber-500/20' },
  skipped: { icon: Clock, className: 'text-zinc-600', bgClass: 'bg-zinc-800' },
  cancelled: { icon: XCircle, className: 'text-zinc-500', bgClass: 'bg-zinc-800' },
};

export function WorkflowExecutionTimeline({
  nodes,
  simulationSteps,
  timeline,
}: WorkflowExecutionTimelineProps) {
  return (
    <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
      {nodes.map((node, index) => {
        const stepState = simulationSteps?.get(node.id) || 
          timeline?.steps.find(s => s.nodeId === node.id)?.state || 
          'pending';
        const config = stateConfig[stepState as keyof typeof stateConfig] || stateConfig.pending;
        const Icon = config.icon;
        const timelineStep = timeline?.steps.find(s => s.nodeId === node.id);

        return (
          <div key={node.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2 py-1 transition-all',
                config.bgClass
              )}
            >
              <Icon className={cn('h-3 w-3 flex-shrink-0', config.className)} />
              <span className="max-w-[100px] truncate text-[10px] font-medium text-zinc-300">
                {node.label}
              </span>
              {timelineStep?.durationMs && (
                <span className="text-[9px] font-mono text-zinc-500">
                  {timelineStep.durationMs}ms
                </span>
              )}
              {timelineStep && timelineStep.retryCount > 0 && (
                <span className="text-[9px] text-amber-500">
                  R{timelineStep.retryCount}
                </span>
              )}
            </div>

            {index < nodes.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-px w-4 transition-colors',
                  stepState === 'success' ? 'bg-emerald-500/50' : 'bg-zinc-700'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
