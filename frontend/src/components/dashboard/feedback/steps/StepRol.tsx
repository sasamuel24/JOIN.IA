'use client';

import type { FeedbackData } from '@/types/dashboard';
import type { FeedbackOption } from '@/services/feedbackService';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FALLBACK_ROLES: FeedbackOption[] = [
  { id: '0', label: 'CEO / Fundador', value: 'CEO / Fundador', sort_order: 0, is_other_option: false },
  { id: '1', label: 'Gerente / Director', value: 'Gerente / Director', sort_order: 1, is_other_option: false },
  { id: '2', label: 'Operaciones', value: 'Operaciones', sort_order: 2, is_other_option: false },
  { id: '3', label: 'Ventas / Comercial', value: 'Ventas / Comercial', sort_order: 3, is_other_option: false },
  { id: '4', label: 'Recursos Humanos', value: 'Recursos Humanos', sort_order: 4, is_other_option: false },
  { id: '5', label: 'Finanzas / Contabilidad', value: 'Finanzas / Contabilidad', sort_order: 5, is_other_option: false },
  { id: '6', label: 'Marketing', value: 'Marketing', sort_order: 6, is_other_option: false },
  { id: '7', label: 'Tecnología / TI', value: 'Tecnología / TI', sort_order: 7, is_other_option: false },
  { id: '8', label: 'Otro', value: 'other', sort_order: 99, is_other_option: true },
];

interface StepRolProps {
  data: Partial<FeedbackData>;
  onUpdate: (partial: Partial<FeedbackData>) => void;
  onNext: () => void;
  options?: FeedbackOption[];
  isSaving?: boolean;
}

export function StepRol({ data, onUpdate, onNext, options, isSaving }: StepRolProps) {
  const roles = options ?? FALLBACK_ROLES;
  const selected = data.rol ?? '';
  const otherText = data.rolOtherText ?? '';
  const isOtherSelected = selected === 'other';

  const handleSelect = (value: string) => {
    // When switching away from "other", clear the text; preserve it when staying on "other"
    onUpdate({ rol: value, rolOtherText: value === 'other' ? otherText : '' });
  };

  const canContinue = Boolean(selected) && !isSaving;

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

      <div className="flex flex-wrap gap-2 mb-4">
        {roles.map(rol => (
          <Chip
            key={rol.value}
            label={rol.label}
            selected={selected === rol.value}
            onToggle={() => handleSelect(rol.value)}
          />
        ))}
      </div>

      {isOtherSelected && (
        <div className="mb-5">
          <Input
            placeholder="Cuéntanos tu rol…"
            value={otherText}
            onChange={e => onUpdate({ rolOtherText: e.target.value })}
            autoFocus
          />
        </div>
      )}

      {!isOtherSelected && <div className="mb-2" />}

      <button
        onClick={onNext}
        disabled={!canContinue}
        className={cn(
          'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
          canContinue ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
        )}
      >
        {isSaving ? 'Guardando…' : 'Continuar →'}
      </button>
    </div>
  );
}
