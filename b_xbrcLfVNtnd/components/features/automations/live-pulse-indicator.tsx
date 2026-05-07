'use client';

import { useExecutionLogsStore, useWebhooksStore } from '@/stores/automations-store';
import { cn } from '@/lib/utils';

export function LivePulseIndicator() {
  const { isLiveStreamPaused } = useExecutionLogsStore();
  const { isLiveStreamActive } = useWebhooksStore();

  const isActive = !isLiveStreamPaused || isLiveStreamActive;

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
    </div>
  );
}
