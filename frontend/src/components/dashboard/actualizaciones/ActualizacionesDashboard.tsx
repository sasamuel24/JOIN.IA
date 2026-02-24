'use client';

import { motion } from 'framer-motion';
import { EarlyAccessBadge } from '../inicio/EarlyAccessBadge';
import { DashboardDivider } from '../shared/DashboardDivider';
import { DashboardFooter } from '../shared/DashboardFooter';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type HitoStatus = 'done' | 'active' | 'upcoming';

const HITOS: { texto: string; status: HitoStatus }[] = [
  { texto: 'Infraestructura lista', status: 'done' },
  { texto: 'Comunidad Early Access activa', status: 'done' },
  { texto: 'Integración del motor de IA', status: 'active' },
  { texto: 'Lanzamiento de la primera versión con IA', status: 'upcoming' },
];

const STATUS_CONFIG: Record<HitoStatus, { dotClass: string; lineClass: string; label: string; labelClass: string }> = {
  done: {
    dotClass: 'bg-accent',
    lineClass: 'bg-accent',
    label: 'Completado',
    labelClass: 'text-text-secondary',
  },
  active: {
    dotClass: 'bg-accent ring-4 ring-accent/15 shadow-accent',
    lineClass: 'bg-accent-glow',
    label: 'En progreso',
    labelClass: 'text-accent-text',
  },
  upcoming: {
    dotClass: 'bg-surface-3',
    lineClass: 'bg-transparent',
    label: 'Próximamente',
    labelClass: 'text-text-muted',
  },
};

export function ActualizacionesDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-[640px] mx-auto px-4 sm:px-8 py-10"
    >
      <EarlyAccessBadge className="mb-6" />

      <h1 className="text-2xl font-bold leading-tight mb-2 text-text-main">
        <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">
          Próximamente
        </span>
      </h1>
      <p className="text-[0.95rem] text-text-secondary leading-relaxed max-w-md mb-10">
        Estamos construyendo la primera versión de JOIN.IA con inteligencia artificial integrada.
        Aquí puedes seguir nuestro progreso en tiempo real.
      </p>

      {/* Timeline */}
      <div className="relative pl-8 mb-10">
        {HITOS.map((h, i) => {
          const s = STATUS_CONFIG[h.status];
          const isLast = i === HITOS.length - 1;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.35 }}
              className={cn('relative', !isLast && 'pb-8')}
            >
              {!isLast && (
                <div className={cn('absolute -left-[21px] top-3.5 w-0.5 bottom-0', s.lineClass)} />
              )}
              <div className={cn('absolute -left-[26px] top-1 w-3 h-3 rounded-full', s.dotClass)} />
              <div>
                <p className={cn(
                  'text-[0.95rem] font-semibold mb-0.5',
                  h.status === 'upcoming' ? 'text-text-secondary' : 'text-text-main'
                )}>
                  {h.texto}
                </p>
                <span className={cn('text-[0.72rem] font-medium uppercase tracking-wide', s.labelClass)}>
                  {s.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Card variant="accent" className="mb-6">
        <p className="text-[0.85rem] font-semibold uppercase tracking-wider text-accent-text mb-2">
          Acceso anticipado
        </p>
        <p className="text-[0.95rem] text-text-secondary leading-relaxed">
          Como miembro de la comunidad Early Access, serás de los primeros en probar cada nueva
          funcionalidad. Te notificaremos en cuanto esté disponible.
        </p>
      </Card>

      <DashboardDivider className="my-6" />
      <DashboardFooter />
    </motion.div>
  );
}
