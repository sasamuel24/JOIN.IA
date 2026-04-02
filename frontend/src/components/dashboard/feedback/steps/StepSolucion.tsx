'use client';

import type { FeedbackData } from '@/types/dashboard';
import { Chip } from '@/components/ui/chip';
import { AITextarea } from '@/components/ui/AITextarea';
import { cn } from '@/lib/utils';

const HERRAMIENTAS = [
  'Excel / Sheets', 'WhatsApp', 'Email', 'Slack / Teams',
  'Notion / Docs', 'Trello / Asana', 'CRM propio', 'Nada aún',
];

interface StepSolucionProps {
  data: Partial<FeedbackData>;
  onUpdate: (partial: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrev: () => void;
  questionNumber?: number;
  totalQuestions?: number;
  isSaving?: boolean;
}

export function StepSolucion({
  data,
  onUpdate,
  onNext,
  onPrev,
  questionNumber = 3,
  totalQuestions = 4,
  isSaving,
}: StepSolucionProps) {
  const text = data.solucion_actual ?? '';
  const herramientas = data.herramientas ?? [];

  const toggleHerramienta = (h: string) => {
    const next = herramientas.includes(h) ? herramientas.filter(x => x !== h) : [...herramientas, h];
    onUpdate({ herramientas: next });
  };

  const canContinue = text.trim().length > 0 || herramientas.length > 0;

  return (
    <div>
      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">Pregunta {questionNumber} de {totalQuestions}</p>
      <h2 className="text-2xl font-bold mb-1">
        ¿Cómo lo estás{' '}
        <span className="italic bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">resolviendo</span> hoy?
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        Cuéntanos qué herramientas, procesos o hacks usas ahora mismo.
      </p>

      <AITextarea
        placeholder="Ejemplo: uso Excel + WhatsApp para coordinar el equipo, pero todo se pierde..."
        value={text}
        onChange={e => onUpdate({ solucion_actual: e.target.value })}
        onAIResult={newText => onUpdate({ solucion_actual: newText })}
        wrapperStyle={{ marginBottom: '1rem' }}
        className="flex w-full min-h-[90px] rounded-md border border-border bg-surface-0 px-3.5 py-2.5 text-sm text-text-main font-[family-name:var(--font-main)] placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
      />

      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">
        ¿Qué herramientas usas actualmente?
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {HERRAMIENTAS.map(h => (
          <Chip key={h} label={h} selected={herramientas.includes(h)} onToggle={() => toggleHerramienta(h)} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNext}
          disabled={!canContinue || isSaving}
          className={cn(
            'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            canContinue && !isSaving ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
          )}
        >
          {isSaving ? 'Guardando…' : 'Continuar \u2192'}
        </button>
        <button onClick={onPrev} className="bg-transparent border-none text-text-secondary text-[0.85rem] cursor-pointer hover:text-text-main transition-colors">
          &larr; Atrás
        </button>
      </div>
    </div>
  );
}
