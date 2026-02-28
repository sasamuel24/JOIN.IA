'use client';

import type { FeedbackData } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface StepImpactoProps {
  data: Partial<FeedbackData>;
  onUpdate: (partial: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

function getImpactLabel(n: number): string {
  if (n <= 3) return 'Molestia menor';
  if (n <= 6) return 'Me frena bastante';
  return 'Crítico para el negocio';
}

export function StepImpacto({ data, onUpdate, onNext, onPrev }: StepImpactoProps) {
  const selected = data.impacto ?? 0;

  return (
    <div>
      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">Pregunta 2 de 4</p>
      <h2 className="text-2xl font-bold mb-1">
        ¿Cuánto te{' '}
        <span className="italic bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">afecta</span>{' '}
        en tu día a día?
      </h2>
      <p className="text-sm text-text-secondary mb-5">Del 1 al 10, ¿qué tan crítico es el problema para ti o tu equipo?</p>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onUpdate({ impacto: n })}
            className={cn(
              'w-full aspect-square max-w-[52px] rounded-lg border-[1.5px] text-lg font-bold cursor-pointer transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
              selected === n
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-transparent text-text-main hover:border-accent/50'
            )}
          >
            {n}
          </button>
        ))}
      </div>

      {selected > 0 && (
        <div className="flex justify-between mb-5">
          <span className="text-xs text-text-secondary">Molestia menor</span>
          <span className="text-[0.8rem] font-semibold text-accent-text">{getImpactLabel(selected)}</span>
          <span className="text-xs text-text-secondary">Crítico para el negocio</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={onNext}
          disabled={selected === 0}
          className={cn(
            'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            selected > 0 ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
          )}
        >
          Continuar &rarr;
        </button>
        <button onClick={onPrev} className="bg-transparent border-none text-text-secondary text-[0.85rem] cursor-pointer hover:text-text-main transition-colors">
          &larr; Atrás
        </button>
      </div>
    </div>
  );
}
