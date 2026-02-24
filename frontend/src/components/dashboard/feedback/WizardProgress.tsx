'use client';

import { motion } from 'framer-motion';

interface WizardProgressProps {
  current: number;
  total: number;
}

export function WizardProgress({ current, total }: WizardProgressProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        {current < total ? `Pregunta ${current} de ${total - 1}` : 'Completado'}
      </p>
      <div className="flex gap-1" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total - 1}>
        {Array.from({ length: total - 1 }).map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: i < current ? '100%' : '0%' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-full bg-accent rounded-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
