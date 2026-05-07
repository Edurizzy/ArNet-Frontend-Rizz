'use client';

import { Search, Filter, ChevronRight, Activity, Clock, AlertTriangle, CheckCircle2, Pause, FileEdit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflowsDataStore, useWorkflowSelectionStore } from '@/stores/automations-store';
import { WorkflowHealthIndicator } from './workflow-health-indicator';
import { cn } from '@/lib/utils';
import type { WorkflowDefinition } from '@/types/automations';

function WorkflowRow({ workflow }: { workflow: WorkflowDefinition }) {
  const { selectedWorkflowId, openBuilder } = useWorkflowSelectionStore();
  const isSelected = selectedWorkflowId === workflow.id;

  const statusConfig = {
    active: { icon: CheckCircle2, label: 'Ativo', className: 'text-emerald-500' },
    paused: { icon: Pause, label: 'Pausado', className: 'text-amber-500' },
    draft: { icon: FileEdit, label: 'Rascunho', className: 'text-zinc-500' },
    archived: { icon: Clock, label: 'Arquivado', className: 'text-zinc-600' },
  };

  const { icon: StatusIcon, label: statusLabel, className: statusClass } = statusConfig[workflow.status];

  const formatLastExecution = (dateStr?: string) => {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return `${Math.floor(diffMinutes / 1440)}d atrás`;
  };

  return (
    <button
      onClick={() => openBuilder(workflow.id, 'view')}
      className={cn(
        'group w-full border-b border-zinc-800/50 px-4 py-3 text-left transition-colors hover:bg-zinc-900/50',
        isSelected && 'bg-zinc-900 border-l-2 border-l-emerald-500'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <WorkflowHealthIndicator health={workflow.healthState} size="sm" />
            <span className="truncate text-sm font-medium text-zinc-200">{workflow.name}</span>
          </div>

          <p className="mt-1 truncate text-xs text-zinc-500">{workflow.description}</p>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <StatusIcon className={cn('h-3 w-3', statusClass)} />
              <span className="text-[10px] text-zinc-500">{statusLabel}</span>
            </div>

            <span className="text-[10px] text-zinc-600">·</span>

            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-zinc-600" />
              <span className="text-[10px] text-zinc-500">
                {workflow.executionCount.toLocaleString()} exec
              </span>
            </div>

            <span className="text-[10px] text-zinc-600">·</span>

            <span className="text-[10px] text-zinc-500">
              {formatLastExecution(workflow.lastExecutedAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className="h-5 border-zinc-700 bg-zinc-900 px-1.5 text-[10px] font-mono text-zinc-400"
          >
            {workflow.versionLabel}
          </Badge>

          {workflow.failureRate > 5 && (
            <div className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-[10px]">{workflow.failureRate.toFixed(1)}% falhas</span>
            </div>
          )}

          <ChevronRight className="h-4 w-4 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </button>
  );
}

export function WorkflowList() {
  const { workflows, isLoading, filters, setFilters } = useWorkflowsDataStore();
  const { isBuilderOpen } = useWorkflowSelectionStore();

  const filteredWorkflows = workflows.filter((w) => {
    if (filters.search && !w.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && w.status !== filters.status) {
      return false;
    }
    if (filters.healthState !== 'all' && w.healthState !== filters.healthState) {
      return false;
    }
    if (filters.triggerType !== 'all' && w.triggerType !== filters.triggerType) {
      return false;
    }
    return true;
  });

  const groupedWorkflows = {
    active: filteredWorkflows.filter((w) => w.status === 'active'),
    paused: filteredWorkflows.filter((w) => w.status === 'paused'),
    draft: filteredWorkflows.filter((w) => w.status === 'draft'),
    archived: filteredWorkflows.filter((w) => w.status === 'archived'),
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-3/4 bg-zinc-800" />
            <Skeleton className="h-3 w-1/2 bg-zinc-800" />
            <Skeleton className="h-3 w-1/3 bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className={cn('border-b border-zinc-800 p-3', !isBuilderOpen && 'px-6')}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Buscar workflows..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="h-8 bg-zinc-900 pl-8 text-xs border-zinc-800 placeholder:text-zinc-600"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-zinc-700 bg-zinc-900"
          >
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
          <span>{filteredWorkflows.length} workflows</span>
          <span>·</span>
          <span className="text-emerald-500">{groupedWorkflows.active.length} ativos</span>
          {groupedWorkflows.paused.length > 0 && (
            <>
              <span>·</span>
              <span className="text-amber-500">{groupedWorkflows.paused.length} pausados</span>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {groupedWorkflows.active.length > 0 && (
          <div>
            <div className="sticky top-0 bg-zinc-950 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Ativos ({groupedWorkflows.active.length})
            </div>
            {groupedWorkflows.active.map((workflow) => (
              <WorkflowRow key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}

        {groupedWorkflows.paused.length > 0 && (
          <div>
            <div className="sticky top-0 bg-zinc-950 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Pausados ({groupedWorkflows.paused.length})
            </div>
            {groupedWorkflows.paused.map((workflow) => (
              <WorkflowRow key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}

        {groupedWorkflows.draft.length > 0 && (
          <div>
            <div className="sticky top-0 bg-zinc-950 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Rascunhos ({groupedWorkflows.draft.length})
            </div>
            {groupedWorkflows.draft.map((workflow) => (
              <WorkflowRow key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
