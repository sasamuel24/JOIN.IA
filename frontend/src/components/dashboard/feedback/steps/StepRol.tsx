'use client';

import type { FeedbackData } from '@/types/dashboard';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';

const ROLES = [
  'CEO / Fundador', 'Gerente / Director', 'Operaciones', 'Ventas / Comercial',
  'Recursos Humanos', 'Finanzas / Contabilidad', 'Marketing', 'Tecnología / TI', 'Otro',
];

interface StepRolProps {
  data: Partial<FeedbackData>;
  onUpdate: (partial: Partial<FeedbackData>) => void;
  onNext: () => void;
}

export function StepRol({ data, onUpdate, onNext }: StepRolProps) {
  const selected = data.rol ?? '';

  return (
    <div>
      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Antes de empezar
      </p>
      <h2 className="text-2xl font-bold mb-1">
        ¿Cuál es tu rol{' '}
        <span className="italic">
          en tu <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">organización</span>?
        </span>
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        Esto nos ayuda a entender el contexto desde donde operas cada día.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {ROLES.map(rol => (
          <Chip key={rol} label={rol} selected={selected === rol} onToggle={() => onUpdate({ rol })} />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className={cn(
          'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
          selected ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
        )}
      >
        Continuar &rarr;
      </button>
    </div>
  );
}
