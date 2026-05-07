'use client';

import { Link2, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CorrelationIdBadgeProps {
  correlationId: string;
  className?: string;
}

export function CorrelationIdBadge({ correlationId, className }: CorrelationIdBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(correlationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'group h-5 cursor-pointer gap-1 border-zinc-700 bg-zinc-900/50 px-1.5 font-mono text-[10px] text-zinc-500 hover:border-zinc-600 hover:text-zinc-400',
        className
      )}
      onClick={handleCopy}
    >
      <Link2 className="h-3 w-3" />
      {correlationId}
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </Badge>
  );
}
