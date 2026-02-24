'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Chip({ label, selected, onToggle, icon, disabled }: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
        'border transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-accent bg-accent-light text-accent-text'
          : 'border-border bg-surface-0 text-text-secondary hover:border-border-hover hover:bg-surface-1'
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </motion.button>
  );
}
