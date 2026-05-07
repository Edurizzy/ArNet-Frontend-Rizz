'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonPayloadViewerProps {
  data: Record<string, unknown> | unknown[] | null | undefined;
  maxHeight?: string;
  initialExpanded?: boolean;
}

function JsonValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  if (value === null) {
    return <span className="text-zinc-500">null</span>;
  }

  if (value === undefined) {
    return <span className="text-zinc-500">undefined</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="text-amber-400">{value ? 'true' : 'false'}</span>;
  }

  if (typeof value === 'number') {
    return <span className="text-blue-400">{value}</span>;
  }

  if (typeof value === 'string') {
    return <span className="text-emerald-400">&quot;{value}&quot;</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-zinc-500">[]</span>;
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-0.5 text-zinc-500 hover:text-zinc-300"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span>[</span>
          {!isExpanded && <span className="text-zinc-600">...{value.length} items</span>}
          {!isExpanded && <span>]</span>}
        </button>
        {isExpanded && (
          <>
            <div className="ml-4 border-l border-zinc-800 pl-2">
              {value.map((item, index) => (
                <div key={index} className="flex">
                  <span className="mr-2 text-zinc-600">{index}:</span>
                  <JsonValue value={item} depth={depth + 1} />
                  {index < value.length - 1 && <span className="text-zinc-600">,</span>}
                </div>
              ))}
            </div>
            <span className="text-zinc-500">]</span>
          </>
        )}
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      return <span className="text-zinc-500">{'{}'}</span>;
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-0.5 text-zinc-500 hover:text-zinc-300"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span>{'{'}</span>
          {!isExpanded && <span className="text-zinc-600">...{entries.length} keys</span>}
          {!isExpanded && <span>{'}'}</span>}
        </button>
        {isExpanded && (
          <>
            <div className="ml-4 border-l border-zinc-800 pl-2">
              {entries.map(([key, val], index) => (
                <div key={key} className="flex flex-wrap">
                  <span className="mr-1 text-purple-400">&quot;{key}&quot;</span>
                  <span className="mr-1 text-zinc-500">:</span>
                  <JsonValue value={val} depth={depth + 1} />
                  {index < entries.length - 1 && <span className="text-zinc-600">,</span>}
                </div>
              ))}
            </div>
            <span className="text-zinc-500">{'}'}</span>
          </>
        )}
      </div>
    );
  }

  return <span className="text-zinc-400">{String(value)}</span>;
}

export function JsonPayloadViewer({
  data,
  maxHeight = '300px',
  initialExpanded = true,
}: JsonPayloadViewerProps) {
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <div className="rounded bg-black/40 p-3 font-mono text-[11px] text-zinc-600">
        {'{}'}
      </div>
    );
  }

  return (
    <ScrollArea
      className="rounded bg-black/40"
      style={{ maxHeight }}
    >
      <div className="p-3 font-mono text-[11px] leading-relaxed">
        <JsonValue value={data} />
      </div>
    </ScrollArea>
  );
}
