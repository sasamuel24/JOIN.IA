'use client';

import type { FeedbackData } from '@/types/dashboard';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const RESULTADOS = [
  'Ahorrar tiempo', 'Reducir errores', 'Tener más control',
  'Delegar mejor', 'Tomar mejores decisiones', 'Crecer sin caos',
];

interface StepVisionProps {
  data: Partial<FeedbackData>;
  onUpdate: (partial: Partial<FeedbackData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  submitting: boolean;
}

export function StepVision({ data, onUpdate, onSubmit, onPrev, submitting }: StepVisionProps) {
  const text = data.vision_ia ?? '';
  const resultados = data.resultados_deseados ?? [];

  const toggleResultado = (r: string) => {
    const next = resultados.includes(r) ? resultados.filter(x => x !== r) : [...resultados, r];
    onUpdate({ resultados_deseados: next });
  };

  const canSubmit = (text.trim().length > 0 || resultados.length > 0) && !submitting;

  return (
    <div>
      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">Pregunta 4 de 4</p>
      <h2 className="text-2xl font-bold mb-1">
        Si la IA lo resolviera por ti,{' '}
        <span className="italic">
          ¿cómo se vería <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">tu día</span>?
        </span>
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        Descríbenos el escenario ideal. Imagina que JOIN.IA ya funciona perfectamente para ti.
      </p>

      <Textarea
        placeholder="Ejemplo: llego a la oficina y ya sé exactamente qué pendientes tiene mi equipo..."
        value={text}
        onChange={e => onUpdate({ vision_ia: e.target.value })}
        className="mb-4"
      />

      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">
        ¿Qué resultado sería el más valioso para ti?
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {RESULTADOS.map(r => (
          <Chip key={r} label={r} selected={resultados.includes(r)} onToggle={() => toggleResultado(r)} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            canSubmit ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
          )}
        >
          {submitting ? 'Enviando...' : 'Enviar mi feedback'}
        </button>
        <button
          onClick={onPrev}
          disabled={submitting}
          className="bg-transparent border-none text-text-secondary text-[0.85rem] cursor-pointer hover:text-text-main transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          &larr; Atrás
        </button>
      </div>
    </div>
  );
}
