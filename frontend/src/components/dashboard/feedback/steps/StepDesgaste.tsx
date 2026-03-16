'use client';

import { RefreshCw, Users, FileText, AlertCircle, MessageSquare, Zap, MoreHorizontal } from 'lucide-react';
import type { FeedbackData } from '@/types/dashboard';
import type { FeedbackOption } from '@/services/feedbackService';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ICON_BY_VALUE: Record<string, React.ReactNode> = {
  meetings: <MessageSquare size={14} />,
  reports: <FileText size={14} />,
  coordination: <Users size={14} />,
  visibility: <AlertCircle size={14} />,
  tracking: <RefreshCw size={14} />,
  onboarding: <Users size={14} />,
  fragmentation: <Zap size={14} />,
  other: <MoreHorizontal size={14} />,
};

const FALLBACK_DESGASTES: FeedbackOption[] = [
  { id: '0', label: 'Tareas repetitivas', value: 'Tareas repetitivas', sort_order: 0, is_other_option: false },
  { id: '1', label: 'Coordinación de equipo', value: 'Coordinación de equipo', sort_order: 1, is_other_option: false },
  { id: '2', label: 'Encontrar información', value: 'Encontrar información', sort_order: 2, is_other_option: false },
  { id: '3', label: 'Reportes y seguimiento', value: 'Reportes y seguimiento', sort_order: 3, is_other_option: false },
  { id: '4', label: 'Carga de comunicación', value: 'Carga de comunicación', sort_order: 4, is_other_option: false },
  { id: '5', label: 'Tomar decisiones', value: 'Tomar decisiones', sort_order: 5, is_other_option: false },
];

interface StepDesgasteProps {
  data: Partial<FeedbackData>;
  onUpdate: (partial: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrev: () => void;
  options?: FeedbackOption[];
  questionNumber?: number;
  totalQuestions?: number;
  isSaving?: boolean;
}

export function StepDesgaste({
  data,
  onUpdate,
  onNext,
  onPrev,
  options,
  questionNumber = 1,
  totalQuestions = 4,
  isSaving,
}: StepDesgasteProps) {
  const desgastes = options ?? FALLBACK_DESGASTES;
  const selected = data.desgastes ?? [];
  const otherText = data.desgastesOtherText ?? '';
  const isOtherSelected = selected.includes('other');

  const toggle = (value: string) => {
    const removing = selected.includes(value);
    const next = removing
      ? selected.filter(s => s !== value)
      : [...selected, value];

    // When removing "other", clear its text field
    if (removing && value === 'other') {
      onUpdate({ desgastes: next, desgastesOtherText: '' });
    } else {
      onUpdate({ desgastes: next });
    }
  };

  const canContinue = selected.length > 0 && !isSaving;

  return (
    <div>
      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Pregunta {questionNumber} de {totalQuestions}
      </p>
      <h2 className="text-2xl font-bold mb-1">
        ¿Qué es lo que más{' '}
        <span className="italic">
          te <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">desgasta</span> hoy?
        </span>
      </h2>
      <p className="text-sm text-text-secondary mb-5">Selecciona todas las que resuenen contigo.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {desgastes.map(d => (
          <Chip
            key={d.value}
            label={d.label}
            icon={ICON_BY_VALUE[d.value]}
            selected={selected.includes(d.value)}
            onToggle={() => toggle(d.value)}
          />
        ))}
      </div>

      {isOtherSelected && (
        <div className="mb-5">
          <Input
            placeholder="¿Qué más te desgasta? Cuéntanos…"
            value={otherText}
            onChange={e => onUpdate({ desgastesOtherText: e.target.value })}
            autoFocus
          />
        </div>
      )}

      {!isOtherSelected && <div className="mb-2" />}

      <div className="flex items-center gap-3">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={cn(
            'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            canContinue ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
          )}
        >
          {isSaving ? 'Guardando…' : 'Continuar →'}
        </button>
        <button onClick={onPrev} className="bg-transparent border-none text-text-secondary text-[0.85rem] cursor-pointer hover:text-text-main transition-colors">
          ← Atrás
        </button>
      </div>
    </div>
  );
}
