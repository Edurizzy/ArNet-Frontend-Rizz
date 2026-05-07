'use client';

import { CheckCircle2, XCircle, Loader2, Clock, RotateCcw, MinusCircle, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ExecutionState } from '@/types/automations';

interface ExecutionStateBadgeProps {
  state: ExecutionState;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const stateConfig: Record<ExecutionState, {
  icon: React.ElementType;
  label: string;
  className: string;
  iconClassName: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Pendente',
    className: 'border-zinc-700 bg-zinc-800/50 text-zinc-400',
    iconClassName: 'text-zinc-500',
  },
  running: {
    icon: Loader2,
    label: 'Executando',
    className: 'border-blue-700/50 bg-blue-500/10 text-blue-400',
    iconClassName: 'text-blue-400 animate-spin',
  },
  success: {
    icon: CheckCircle2,
    label: 'Sucesso',
    className: 'border-emerald-700/50 bg-emerald-500/10 text-emerald-400',
    iconClassName: 'text-emerald-500',
  },
  failed: {
    icon: XCircle,
    label: 'Falha',
    className: 'border-red-700/50 bg-red-500/10 text-red-400',
    iconClassName: 'text-red-500',
  },
  retrying: {
    icon: RotateCcw,
    label: 'Retentando',
    className: 'border-amber-700/50 bg-amber-500/10 text-amber-400',
    iconClassName: 'text-amber-500 animate-spin',
  },
  skipped: {
    icon: MinusCircle,
    label: 'Ignorado',
    className: 'border-zinc-700 bg-zinc-800/50 text-zinc-500',
    iconClassName: 'text-zinc-500',
  },
  cancelled: {
    icon: Ban,
    label: 'Cancelado',
    className: 'border-zinc-700 bg-zinc-800/50 text-zinc-500',
    iconClassName: 'text-zinc-500',
  },
};

export function ExecutionStateBadge({
  state,
  size = 'sm',
  showLabel = true,
}: ExecutionStateBadgeProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-normal',
        size === 'sm' && 'h-5 px-1.5 text-[10px]',
        size === 'md' && 'h-6 px-2 text-xs',
        config.className
      )}
    >
      <Icon
        className={cn(
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-3.5 w-3.5',
          config.iconClassName
        )}
      />
      {showLabel && config.label}
    </Badge>
  );
}
