'use client';

import { motion } from 'framer-motion';
import { useInvitaciones } from '@/hooks/useInvitaciones';
import { EarlyAccessBadge } from '../inicio/EarlyAccessBadge';
import { MisionCard } from './MisionCard';
import { StatsGrid } from './StatsGrid';
import { InviteForm } from './InviteForm';
import { InvitadosList } from './InvitadosList';
import { DashboardDivider } from '../shared/DashboardDivider';
import { DashboardFooter } from '../shared/DashboardFooter';
import { Skeleton } from '@/components/ui/skeleton';

export function InvitacionesDashboard() {
  const { invitados, stats, loading, sending, error, sendInvitation } = useInvitaciones();

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto px-4 sm:px-8 py-8 space-y-6">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-[720px] mx-auto px-4 sm:px-8 py-8"
    >
      <EarlyAccessBadge />

      <h1 className="text-2xl font-bold leading-tight mt-5 mb-2">
        Ayúdanos a llegar<br />
        a quien{' '}
        <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">
          lo necesita.
        </span>
      </h1>

      <p className="text-[0.95rem] text-text-secondary leading-relaxed mb-6 max-w-xl">
        Cada persona que invitas es alguien que podría transformar la forma en que trabaja. Tu
        círculo tiene más impacto del que crees.
      </p>

      <MisionCard current={stats.invitados} meta={stats.meta} />

      <div className="mt-6">
        <StatsGrid stats={stats} />
      </div>

      <div className="mt-7">
        <InviteForm
          onSubmit={sendInvitation}
          sending={sending}
          disabled={stats.disponibles <= 0}
        />
      </div>

      {error && (
        <p className="text-[0.82rem] text-error mt-3 px-3 py-2 bg-error-light rounded-md">
          {error}
        </p>
      )}

      <div className="mt-8">
        <InvitadosList invitados={invitados} disponibles={stats.disponibles} />
      </div>

      <DashboardDivider className="mt-8 mb-6" />
      <DashboardFooter />
    </motion.div>
  );
}
