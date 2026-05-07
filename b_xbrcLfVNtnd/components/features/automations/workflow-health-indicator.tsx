'use client';

import { cn } from '@/lib/utils';
import type { WorkflowHealthState } from '@/types/automations';

interface WorkflowHealthIndicatorProps {
  health: WorkflowHealthState;
  size?: 'sm' | 'md' | 'lg';
}

const healthConfig: Record<WorkflowHealthState, { className: string; pulseClassName: string; label: string }> = {
  healthy: {
    className: 'bg-emerald-500',
    pulseClassName: 'bg-emerald-500/50',
    label: 'Saudável',
  },
  degraded: {
    className: 'bg-amber-500',
    pulseClassName: 'bg-amber-500/50',
    label: 'Degradado',
  },
  failing: {
    className: 'bg-red-500',
    pulseClassName: 'bg-red-500/50',
    label: 'Falhando',
  },
  disabled: {
    className: 'bg-zinc-600',
    pulseClassName: '',
    label: 'Desabilitado',
  },
};

const sizeConfig = {
  sm: { dot: 'h-2 w-2', pulse: 'h-2 w-2' },
  md: { dot: 'h-2.5 w-2.5', pulse: 'h-2.5 w-2.5' },
  lg: { dot: 'h-3 w-3', pulse: 'h-3 w-3' },
};

export function WorkflowHealthIndicator({ health, size = 'sm' }: WorkflowHealthIndicatorProps) {
  const config = healthConfig[health];
  const sizes = sizeConfig[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse animation for non-disabled states */}
      {health !== 'disabled' && (
        <span
          className={cn(
            'absolute animate-ping rounded-full opacity-75',
            sizes.pulse,
            config.pulseClassName
          )}
        />
      )}
      <span
        className={cn(
          'relative rounded-full',
          sizes.dot,
          config.className
        )}
        title={config.label}
      />
    </div>
  );
}
