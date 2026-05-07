'use client';

import { useEffect } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Shield,
  ShieldAlert,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWebhooksStore } from '@/stores/automations-store';
import { fetchWebhookById } from '@/services/automations-api';
import { JsonPayloadViewer } from './json-payload-viewer';
import { ExecutionStateBadge } from './execution-state-badge';
import { cn } from '@/lib/utils';
import type { WebhookRequest, WebhookProvider } from '@/types/automations';

function WebhookListItem({ webhook, isSelected, onSelect }: {
  webhook: WebhookRequest;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const httpStatusClass =
    webhook.httpStatus >= 200 && webhook.httpStatus < 300
      ? 'text-emerald-400 bg-emerald-500/10'
      : webhook.httpStatus >= 400 && webhook.httpStatus < 500
      ? 'text-amber-400 bg-amber-500/10'
      : 'text-red-400 bg-red-500/10';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full border-b border-zinc-800/50 px-3 py-2.5 text-left transition-colors hover:bg-zinc-900/50',
        isSelected && 'bg-zinc-900 border-l-2 border-l-emerald-500'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            variant="outline"
            className={cn(
              'h-5 border-0 px-1.5 font-mono text-[10px]',
              httpStatusClass
            )}
          >
            {webhook.httpStatus}
          </Badge>
          <span className="truncate text-xs font-medium text-zinc-300">
            {webhook.providerLabel}
          </span>
        </div>
        <span className="flex-shrink-0 font-mono text-[10px] text-zinc-500">
          {formatTime(webhook.receivedAt)}
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <span className="truncate text-[11px] text-zinc-500">{webhook.endpoint}</span>
        <span className="flex-shrink-0 font-mono text-[10px] text-zinc-600">
          {webhook.latencyMs}ms
        </span>
        {webhook.retryAttempts > 0 && (
          <Badge variant="outline" className="h-4 border-amber-700/50 bg-amber-500/10 px-1 text-[9px] text-amber-400">
            R{webhook.retryAttempts}
          </Badge>
        )}
      </div>
    </button>
  );
}

function WebhookDetailPanel({ webhook }: { webhook: WebhookRequest | null }) {
  if (!webhook) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Selecione um webhook para ver detalhes
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'h-6 px-2 font-mono text-xs',
                webhook.httpStatus < 300
                  ? 'border-emerald-700 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-700 bg-red-500/10 text-red-400'
              )}
            >
              {webhook.httpStatus}
            </Badge>
            <span className="text-sm font-medium text-zinc-200">{webhook.providerLabel}</span>
            <ExecutionStateBadge state={webhook.processingState} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 border-zinc-700 bg-zinc-900 text-xs">
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Reprocessar
            </Button>
          </div>
        </div>

        {/* Signature Validation */}
        <div className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2',
          webhook.signatureValid ? 'bg-emerald-500/10' : 'bg-red-500/10'
        )}>
          {webhook.signatureValid ? (
            <>
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-emerald-400">Assinatura válida</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-400">Assinatura inválida</span>
            </>
          )}
        </div>

        {/* Request Info */}
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Informações da Requisição
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Método</span>
              <span className="font-mono text-zinc-300">{webhook.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Endpoint</span>
              <span className="font-mono text-zinc-300">{webhook.endpoint}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Latência</span>
              <span className="font-mono text-zinc-300">{webhook.latencyMs}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Recebido em</span>
              <span className="font-mono text-zinc-300">
                {new Date(webhook.receivedAt).toLocaleString('pt-BR')}
              </span>
            </div>
            {webhook.linkedWorkflowId && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Workflow Vinculado</span>
                <span className="font-mono text-zinc-300">{webhook.linkedWorkflowId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Headers */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Headers
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-zinc-500"
              onClick={() => copyToClipboard(JSON.stringify(webhook.headers, null, 2))}
            >
              <Copy className="mr-1 h-3 w-3" />
              Copiar
            </Button>
          </div>
          <div className="mt-2">
            <JsonPayloadViewer data={webhook.headers} maxHeight="120px" />
          </div>
        </div>

        {/* Request Body */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Request Body
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-zinc-500"
              onClick={() => copyToClipboard(JSON.stringify(webhook.body, null, 2))}
            >
              <Copy className="mr-1 h-3 w-3" />
              Copiar
            </Button>
          </div>
          <div className="mt-2">
            <JsonPayloadViewer data={webhook.body} maxHeight="200px" />
          </div>
        </div>

        {/* Response */}
        {webhook.responseBody && (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Response Body
            </div>
            <div className="mt-2">
              <JsonPayloadViewer data={webhook.responseBody} maxHeight="100px" />
            </div>
          </div>
        )}

        {/* Processing Diagnostics */}
        {webhook.processingDiagnostics && webhook.processingDiagnostics.length > 0 && (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Diagnóstico de Processamento
            </div>
            <div className="mt-2 space-y-1">
              {webhook.processingDiagnostics.map((diag, i) => (
                <div key={i} className="flex items-center gap-2 rounded bg-amber-500/10 px-2 py-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs text-amber-400">{diag}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export function WebhookInspector() {
  const {
    webhooks,
    isLoading,
    filters,
    selectedWebhookId,
    setFilters,
    setSelectedWebhook,
  } = useWebhooksStore();

  const selectedWebhook = webhooks.find((w) => w.id === selectedWebhookId) || null;

  const filteredWebhooks = webhooks.filter((w) => {
    if (filters.search && !w.providerLabel.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.provider !== 'all' && w.provider !== filters.provider) {
      return false;
    }
    if (filters.httpStatus !== 'all') {
      const code = w.httpStatus;
      if (filters.httpStatus === '2xx' && (code < 200 || code >= 300)) return false;
      if (filters.httpStatus === '4xx' && (code < 400 || code >= 500)) return false;
      if (filters.httpStatus === '5xx' && code < 500) return false;
    }
    if (filters.processingState !== 'all' && w.processingState !== filters.processingState) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r border-zinc-800 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Webhook List */}
      <div className="w-80 flex-shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="border-b border-zinc-800 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Buscar webhooks..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="h-8 bg-zinc-900 pl-8 text-xs border-zinc-800 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Select
              value={filters.provider}
              onValueChange={(v) => setFilters({ provider: v as WebhookProvider | 'all' })}
            >
              <SelectTrigger className="h-7 flex-1 bg-zinc-900 border-zinc-800 text-[11px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="mercadopago">MercadoPago</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.httpStatus}
              onValueChange={(v) => setFilters({ httpStatus: v as typeof filters.httpStatus })}
            >
              <SelectTrigger className="h-7 w-20 bg-zinc-900 border-zinc-800 text-[11px]">
                <SelectValue placeholder="HTTP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="2xx">2xx</SelectItem>
                <SelectItem value="4xx">4xx</SelectItem>
                <SelectItem value="5xx">5xx</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2 text-[10px] text-zinc-500">
            {filteredWebhooks.length} webhooks
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredWebhooks.map((webhook) => (
            <WebhookListItem
              key={webhook.id}
              webhook={webhook}
              isSelected={selectedWebhookId === webhook.id}
              onSelect={() => setSelectedWebhook(webhook.id)}
            />
          ))}
        </ScrollArea>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 bg-zinc-950">
        <WebhookDetailPanel webhook={selectedWebhook} />
      </div>
    </div>
  );
}
