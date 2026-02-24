'use client';

import type { FeedbackData } from '@/types/dashboard';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/textarea';
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
}

export function StepSolucion({ data, onUpdate, onNext, onPrev }: StepSolucionProps) {
  const text = data.solucion_actual ?? '';
  const herramientas = data.herramientas ?? [];

  const toggleHerramienta = (h: string) => {
    const next = herramientas.includes(h) ? herramientas.filter(x => x !== h) : [...herramientas, h];
    onUpdate({ herramientas: next });
  };

  const canContinue = text.trim().length > 0 || herramientas.length > 0;

  return (
    <div>
      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">Pregunta 3 de 4</p>
      <h2 className="text-2xl font-bold mb-1">
        ¿Cómo lo estás{' '}
        <span className="italic bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">resolviendo</span> hoy?
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        Cuéntanos qué herramientas, procesos o hacks usas ahora mismo.
      </p>

      <Textarea
        placeholder="Ejemplo: uso Excel + WhatsApp para coordinar el equipo, pero todo se pierde..."
        value={text}
        onChange={e => onUpdate({ solucion_actual: e.target.value })}
        className="mb-4"
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
          disabled={!canContinue}
          className={cn(
            'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            canContinue ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
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
