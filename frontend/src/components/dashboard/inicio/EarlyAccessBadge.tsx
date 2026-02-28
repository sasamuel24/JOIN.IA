'use client';

import { cn } from '@/lib/utils';

export function EarlyAccessBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-[0.8rem] text-text-secondary w-fit',
      className
    )}>
      <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
      Early Access
    </div>
  );
}
