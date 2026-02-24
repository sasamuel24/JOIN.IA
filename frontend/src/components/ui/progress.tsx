'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function Progress({ value, max = 100, label, showValue, className, size = 'md' }: ProgressProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && <span className="text-xs text-text-secondary shrink-0">{label}</span>}
      <div
        className={cn(
          'flex-1 rounded-full bg-surface-2 overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-accent"
        />
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-accent-text shrink-0">
          {value} / {max}
        </span>
      )}
    </div>
  );
}
