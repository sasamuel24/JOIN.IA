'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EarlyAccessBadge } from './EarlyAccessBadge';
import { VideoPlaceholder } from './VideoPlaceholder';
import { StatusCard } from './StatusCard';
import { DashboardDivider } from '../shared/DashboardDivider';
import { DashboardFooter } from '../shared/DashboardFooter';

export function InicioDashboard() {
  const { user } = useCurrentUser();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[680px] mx-auto px-4 sm:px-8 py-8"
    >
      <EarlyAccessBadge />

      <div className="mt-6">
        <VideoPlaceholder />
      </div>

      <DashboardDivider className="my-7" />

      <h1 className="text-[1.65rem] font-bold leading-tight mb-2">
        Tu trabajo no debería{' '}
        <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">
          sentirse así.
        </span>
      </h1>
      <p className="text-[0.95rem] text-text-secondary mb-1">
        Pasas el día coordinando, recordando, persiguiendo pendientes.
      </p>
      <p className="text-[0.95rem] text-text-secondary mb-6">
        Estamos construyendo algo diferente.
      </p>

      <p className="text-2xl font-bold leading-snug mb-4">
        Estás{' '}
        <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">
          dentro
        </span>{' '}
        antes del lanzamiento oficial.
      </p>

      <p className="text-[0.95rem] text-text-secondary mb-5 leading-relaxed">
        JOIN.IA está en Early Access. Estamos validando con personas que viven esta fricción todos
        los días.
      </p>

      <StatusCard
        status={user?.access_tier ?? 'Early Access'}
        group={user?.group ?? 'Validación inicial'}
      />

      <h2 className="text-[1.75rem] font-bold mt-7 mb-6 leading-tight">
        Lo estamos construyendo{' '}
        <span className="bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">
          contigo.
        </span>
      </h2>

      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Compartir mi caso', href: '/dashboard/feedback' },
          { label: 'Ver actualizaciones', href: '/dashboard/actualizaciones' },
          { label: 'Unirme a la comunidad', href: '/dashboard/comunidad' },
        ].map(cta => (
          <button
            key={cta.href}
            onClick={() => router.push(cta.href)}
            className="px-5 py-2.5 rounded-md border border-border text-sm font-medium text-text-main bg-transparent cursor-pointer transition-all duration-150 hover:border-accent hover:text-accent-text hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            {cta.label}
          </button>
        ))}
      </div>

      <DashboardDivider className="mt-8 mb-6" />

      <DashboardFooter />
    </motion.div>
  );
}
