'use client';

import {
  Zap,
  GitBranch,
  Play,
  Timer,
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LogicNodeDefinition, NodeType, ExecutionState } from '@/types/automations';
import { useState } from 'react';

interface LogicNodeProps {
  node: LogicNodeDefinition;
  simulationState?: 'pending' | 'running' | 'success' | 'failed';
  isLast?: boolean;
}

const nodeTypeConfig: Record<
  NodeType,
  { icon: React.ElementType; label: string; bgClass: string; borderClass: string }
> = {
  trigger: {
    icon: Zap,
    label: 'Trigger',
    bgClass: 'bg-emerald-950/30',
    borderClass: 'border-emerald-800/50',
  },
  condition: {
    icon: GitBranch,
    label: 'Condição',
    bgClass: 'bg-blue-950/30',
    borderClass: 'border-blue-800/50',
  },
  action: {
    icon: Play,
    label: 'Ação',
    bgClass: 'bg-zinc-900',
    borderClass: 'border-zinc-700/50',
  },
  branch: {
    icon: GitBranch,
    label: 'Branch',
    bgClass: 'bg-amber-950/30',
    borderClass: 'border-amber-800/50',
  },
  delay: {
    icon: Timer,
    label: 'Delay',
    bgClass: 'bg-zinc-900',
    borderClass: 'border-zinc-700/50',
  },
  ai_decision: {
    icon: Bot,
    label: 'Decisão IA',
    bgClass: 'bg-purple-950/30',
    borderClass: 'border-purple-800/50',
  },
};

const simulationStateConfig: Record<
  NonNullable<LogicNodeProps['simulationState']>,
  { icon: React.ElementType; className: string; glowClass: string }
> = {
  pending: { icon: Clock, className: 'text-zinc-500', glowClass: '' },
  running: { icon: Loader2, className: 'text-blue-400 animate-spin', glowClass: 'ring-2 ring-blue-500/30' },
  success: { icon: CheckCircle2, className: 'text-emerald-500', glowClass: 'ring-2 ring-emerald-500/20' },
  failed: { icon: XCircle, className: 'text-red-500', glowClass: 'ring-2 ring-red-500/20' },
};

export function LogicNode({ node, simulationState, isLast }: LogicNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = nodeTypeConfig[node.type];
  const Icon = config.icon;

  const simConfig = simulationState ? simulationStateConfig[simulationState] : null;
  const SimIcon = simConfig?.icon;

  const validationClass =
    node.validationState === 'error'
      ? 'border-red-700/50 bg-red-950/20'
      : node.validationState === 'warning'
      ? 'border-amber-700/50 bg-amber-950/20'
      : '';

  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-all',
        config.bgClass,
        config.borderClass,
        validationClass,
        simConfig?.glowClass,
        'hover:border-zinc-600'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'mt-0.5 flex h-7 w-7 items-center justify-center rounded-md',
                node.type === 'trigger' && 'bg-emerald-500/20',
                node.type === 'condition' && 'bg-blue-500/20',
                node.type === 'action' && 'bg-zinc-700/50',
                node.type === 'ai_decision' && 'bg-purple-500/20',
                node.type === 'delay' && 'bg-zinc-700/50',
                node.type === 'branch' && 'bg-amber-500/20'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  node.type === 'trigger' && 'text-emerald-400',
                  node.type === 'condition' && 'text-blue-400',
                  node.type === 'action' && 'text-zinc-400',
                  node.type === 'ai_decision' && 'text-purple-400',
                  node.type === 'delay' && 'text-zinc-400',
                  node.type === 'branch' && 'text-amber-400'
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-200">{node.label}</span>
                <Badge
                  variant="outline"
                  className="h-4 border-zinc-700 bg-zinc-900/50 px-1.5 text-[9px] uppercase tracking-wider text-zinc-500"
                >
                  {config.label}
                </Badge>
              </div>

              {node.description && (
                <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{node.description}</p>
              )}

              {/* Condition Summary */}
              {node.type === 'condition' && node.conditions && (
                <div className="mt-2 rounded bg-black/30 px-2 py-1.5 font-mono text-[11px] text-zinc-400">
                  <span className="text-blue-400">SE </span>
                  {node.conditions.conditions.map((cond, i) => (
                    <span key={cond.id}>
                      {i > 0 && (
                        <span className="text-amber-400"> {cond.logicalOperator || 'AND'} </span>
                      )}
                      <span className="text-zinc-300">{cond.field}</span>
                      <span className="text-zinc-500"> {cond.operator} </span>
                      <span className="text-emerald-400">{String(cond.value)}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Action Summary */}
              {node.type === 'action' && node.action && (
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className="text-zinc-500">Latência estimada:</span>
                  <span className="font-mono text-zinc-400">
                    ~{node.action.estimatedLatencyMs}ms
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Validation State */}
            {node.validationState === 'warning' && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            {node.validationState === 'error' && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}

            {/* Simulation State */}
            {SimIcon && <SimIcon className={cn('h-4 w-4', simConfig?.className)} />}

            <ChevronDown
              className={cn(
                'h-4 w-4 text-zinc-600 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-zinc-800/50 px-4 py-3">
          <div className="space-y-3">
            {node.trigger && (
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Configuração do Trigger
                </div>
                <div className="mt-1.5 rounded bg-black/40 p-2 font-mono text-[11px] text-zinc-400">
                  <div>Tipo: {node.trigger.type}</div>
                  {node.trigger.sourceChannel && (
                    <div>Canal: {node.trigger.sourceChannel}</div>
                  )}
                  {node.trigger.webhookEndpoint && (
                    <div>Endpoint: {node.trigger.webhookEndpoint}</div>
                  )}
                </div>
              </div>
            )}

            {node.action && (
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Configuração da Ação
                </div>
                <div className="mt-1.5 rounded bg-black/40 p-2 font-mono text-[11px] text-zinc-400">
                  <div>Tipo: {node.action.type}</div>
                  <div>
                    Parâmetros: {JSON.stringify(node.action.parameters, null, 2)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-[11px] text-zinc-500">
              <span>ID: {node.id}</span>
              {node.nextNodeId && <span>Próximo: {node.nextNodeId}</span>}
              {node.branchTrue && <span>Se verdadeiro: {node.branchTrue}</span>}
              {node.branchFalse && <span>Se falso: {node.branchFalse}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
