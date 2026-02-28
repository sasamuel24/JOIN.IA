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
        Consigue {meta} personas que quieran trabajar diferente.
      </p>
      <p className="text-[0.82rem] text-text-secondary leading-relaxed mb-4">
        Estamos en Early Access. Cada invitación que completes nos ayuda a validar que el problema
        es real — y le da a alguien más la oportunidad de ser parte del cambio.
      </p>

      <Progress value={current} max={meta} showValue />
      <span className="text-[0.72rem] text-text-secondary mt-1 block text-right">Invitados</span>
    </Card>
  );
}
