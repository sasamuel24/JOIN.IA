'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MisionCardProps {
  current: number;
  meta: number;
}

export function MisionCard({ current, meta }: MisionCardProps) {
  return (
    <Card variant="default" className="!rounded-xl">
      <h3 className="text-base font-bold text-accent-text mb-1">
        Tu misión
      </h3>
      <p className="text-[0.95rem] font-semibold text-text-main mb-2">
        Logra que {meta} personas se unan al cambio.
      </p>
      <p className="text-[0.82rem] text-text-secondary leading-relaxed mb-4">
        Estamos en Early Access. Cuando {meta} de tus invitados acepten y se registren,
        desbloquearás acceso anticipado. Puedes invitar a todas las personas que quieras.
      </p>

      <Progress value={current} max={meta} showValue />
      <span className="text-[0.72rem] text-text-secondary mt-1 block text-right">Aceptadas</span>
    </Card>
  );
}
