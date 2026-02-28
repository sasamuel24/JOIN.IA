'use client';

import { RefreshCw, Users, FileText, AlertCircle, MessageSquare, Zap } from 'lucide-react';
import type { FeedbackData } from '@/types/dashboard';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';

const DESGASTES = [
  { label: 'Tareas repetitivas', icon: <RefreshCw size={14} /> },
  { label: 'Coordinación de equipo', icon: <Users size={14} /> },
  { label: 'Encontrar información', icon: <AlertCircle size={14} /> },
  { label: 'Reportes y seguimiento', icon: <FileText size={14} /> },
  { label: 'Carga de comunicación', icon: <MessageSquare size={14} /> },
  { label: 'Tomar decisiones', icon: <Zap size={14} /> },
];

interface StepDesgasteProps {
  data: Partial<FeedbackData>;
  onUpdate: (partial: Partial<FeedbackData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepDesgaste({ data, onUpdate, onNext, onPrev }: StepDesgasteProps) {
  const selected = data.desgastes ?? [];

  const toggle = (label: string) => {
    const next = selected.includes(label) ? selected.filter(s => s !== label) : [...selected, label];
    onUpdate({ desgastes: next });
  };

  return (
    <div>
      <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">Pregunta 1 de 4</p>
      <h2 className="text-2xl font-bold mb-1">
        ¿Qué es lo que más{' '}
        <span className="italic">
          te <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">desgasta</span> hoy?
        </span>
      </h2>
      <p className="text-sm text-text-secondary mb-5">Selecciona todas las que resuenen contigo.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        {DESGASTES.map(d => (
          <Chip key={d.label} label={d.label} icon={d.icon} selected={selected.includes(d.label)} onToggle={() => toggle(d.label)} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className={cn(
            'px-6 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            selected.length > 0 ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-2 text-text-muted cursor-not-allowed'
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
