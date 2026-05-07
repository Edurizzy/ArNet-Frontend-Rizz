'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Pause,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExecutionLogsStore, useExecutionTracePanelStore } from '@/stores/automations-store';
import { ExecutionStateBadge } from './execution-state-badge';
import { CorrelationIdBadge } from './correlation-id-badge';
import { JsonPayloadViewer } from './json-payload-viewer';
import { cn } from '@/lib/utils';
import type { EventLog, EventSeverity, ExecutionState } from '@/types/automations';

function EventLogRow({ log }: { log: EventLog }) {
  const { expandedLogIds, toggleExpandedLog } = useExecutionLogsStore();
  const { openPanel } = useExecutionTracePanelStore();
  const isExpanded = expandedLogIds.has(log.id);

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const severityClass: Record<EventSeverity, string> = {
    info: 'text-zinc-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
  };

  return (
    <div
      className={cn(
        'border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/30',
        isExpanded && 'bg-zinc-900/50'
      )}
    >
      <button
        onClick={() => toggleExpandedLog(log.id)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        )}

        <span className="w-20 flex-shrink-0 font-mono text-[11px] text-zinc-500">
          {formatTimestamp(log.timestamp)}
        </span>

        <ExecutionStateBadge state={log.state} size="sm" />

        <span className={cn('w-16 flex-shrink-0 text-[10px] uppercase', severityClass[log.severity])}>
          {log.severity}
        </span>

        <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">
          {log.workflowName}
        </span>

        <span className="max-w-[200px] truncate text-xs text-zinc-500">
          {log.actionTaken}
        </span>

        <span className="w-16 flex-shrink-0 text-right font-mono text-[11px] text-zinc-500">
          {log.durationMs}ms
        </span>

        <CorrelationIdBadge correlationId={log.correlationId} />
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-800/30 bg-black/30 px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Detalhes da Execução
                </div>
                <div className="mt-1.5 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Workflow ID</span>
                    <span className="font-mono text-zinc-400">{log.workflowId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Execution ID</span>
                    <span className="font-mono text-zinc-400">{log.executionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Trigger Event</span>
                    <span className="text-zinc-400">{log.triggerEvent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Source Service</span>
                    <span className="text-zinc-400">{log.sourceService}</span>
                  </div>
                </div>
              </div>

              {log.metadata && (
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Runtime Metadata
                  </div>
                  <div className="mt-1.5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Worker</span>
                      <span className="font-mono text-zinc-400">{log.metadata.workerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Queue</span>
                      <span className="font-mono text-zinc-400">{log.metadata.queueName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Processing Time</span>
                      <span className="font-mono text-zinc-400">{log.metadata.processingTimeMs}ms</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-7 border-zinc-700 bg-zinc-900 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  openPanel(log.executionId);
                }}
              >
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Ver Trace Completo
              </Button>
            </div>

            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Payload
              </div>
              <div className="mt-1.5">
                {log.payload ? (
                  <JsonPayloadViewer data={log.payload} maxHeight="160px" />
                ) : (
                  <div className="rounded bg-black/40 p-2 text-xs text-zinc-600">
                    Nenhum payload disponível
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EventLogViewer() {
  const {
    logs,
    isLoading,
    isLiveStreamPaused,
    filters,
    setFilters,
    toggleLiveStream,
  } = useExecutionLogsStore();

  const filteredLogs = logs.filter((log) => {
    if (filters.search && !log.workflowName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.workflowId !== 'all' && log.workflowId !== filters.workflowId) {
      return false;
    }
    if (filters.state !== 'all' && log.state !== filters.state) {
      return false;
    }
    if (filters.severity !== 'all' && log.severity !== filters.severity) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Filters */}
      <div className="border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Buscar logs..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="h-8 bg-zinc-900 pl-8 text-xs border-zinc-800 placeholder:text-zinc-600"
            />
          </div>

          <Select
            value={filters.state}
            onValueChange={(v) => setFilters({ state: v as ExecutionState | 'all' })}
          >
            <SelectTrigger className="h-8 w-32 bg-zinc-900 border-zinc-800 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="failed">Falha</SelectItem>
              <SelectItem value="retrying">Retry</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.severity}
            onValueChange={(v) => setFilters({ severity: v as EventSeverity | 'all' })}
          >
            <SelectTrigger className="h-8 w-28 bg-zinc-900 border-zinc-800 text-xs">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(v) => setFilters({ dateRange: v as typeof filters.dateRange })}
          >
            <SelectTrigger className="h-8 w-32 bg-zinc-900 border-zinc-800 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_hour">Última hora</SelectItem>
              <SelectItem value="last_24h">Últimas 24h</SelectItem>
              <SelectItem value="last_7d">Últimos 7d</SelectItem>
              <SelectItem value="last_30d">Últimos 30d</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 border-zinc-700 bg-zinc-900 text-xs',
              !isLiveStreamPaused && 'border-emerald-700 text-emerald-400'
            )}
            onClick={toggleLiveStream}
          >
            {isLiveStreamPaused ? (
              <>
                <Play className="mr-1.5 h-3 w-3" />
                Retomar
              </>
            ) : (
              <>
                <Pause className="mr-1.5 h-3 w-3" />
                Pausar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-zinc-700 bg-zinc-900"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
          <span>{filteredLogs.length} eventos</span>
          {!isLiveStreamPaused && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Stream ativo
              </span>
            </>
          )}
        </div>
      </div>

      {/* Log List */}
      <ScrollArea className="flex-1">
        {filteredLogs.map((log) => (
          <EventLogRow key={log.id} log={log} />
        ))}

        {filteredLogs.length === 0 && (
          <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
            Nenhum log encontrado
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
