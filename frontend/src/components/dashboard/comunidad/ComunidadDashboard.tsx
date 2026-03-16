'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EarlyAccessBadge } from '../inicio/EarlyAccessBadge';
import { ComunidadHeader } from './ComunidadHeader';
import { ComunidadTabs, type TabId } from './ComunidadTabs';
import { TabFeed } from './tabs/TabFeed';
import { TabMiembros } from './tabs/TabMiembros';
import { TabDebates } from './tabs/TabDebates';
import { TabRecursos } from './tabs/TabRecursos';
import { DashboardDivider } from '../shared/DashboardDivider';
import { DashboardFooter } from '../shared/DashboardFooter';
import { useCommunityStats } from '@/hooks/useCommunity';
import { useNextEvent } from '@/hooks/useNextEvent';

const TAB_COMPONENTS: Record<TabId, React.FC> = {
  feed: TabFeed,
  miembros: TabMiembros,
  debates: TabDebates,
  recursos: TabRecursos,
};

export function ComunidadDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const { stats, loading: statsLoading, error: statsError } = useCommunityStats();
  const { event, loading: eventLoading } = useNextEvent();
  const ActiveTabContent = TAB_COMPONENTS[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-8"
    >
      <div className="mb-4">
        <EarlyAccessBadge />
      </div>

      {/* Hero */}
      <div className="bg-surface-1 rounded-xl p-8 mb-6">
        <h1 className="text-[2rem] font-bold leading-tight mb-2">
          Personas que quieren trabajar diferente.
        </h1>
        <p className="text-[0.95rem] text-secondary leading-relaxed max-w-[500px] mb-5">
          Este es tu espacio. Comparte lo que te cuesta, aprende de quienes viven lo mismo y se
          parte del producto que estamos construyendo juntos.
        </p>
        {statsLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">Cargando estadísticas...</span>
          </div>
        ) : statsError ? (
          <div className="text-sm text-error">
            Error: {statsError}
          </div>
        ) : stats ? (
          <ComunidadHeader 
            miembros={stats.miembros} 
            posts={stats.posts} 
            activosAhora={stats.activosAhora} 
          />
        ) : (
          <ComunidadHeader miembros={0} posts={0} activosAhora={0} />
        )}
      </div>

      {/* Tabs + Content */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <ComunidadTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-5">
            <ActiveTabContent />
          </div>
        </div>

        {/* Sidebar -- upcoming event */}
        <div className="hidden lg:block w-[260px] shrink-0 bg-surface-1 rounded-xl p-5 sticky top-8">
          <h3 className="text-[0.95rem] font-bold text-main mb-3">
            Próximo evento
          </h3>

          {eventLoading ? (
            <div className="space-y-2">
              <div className="h-3 bg-surface-0 rounded animate-pulse w-1/3" />
              <div className="h-4 bg-surface-0 rounded animate-pulse" />
              <div className="h-3 bg-surface-0 rounded animate-pulse w-2/3" />
            </div>
          ) : event ? (
            <div className="bg-surface-0 border border-border rounded-lg p-4">
              <p className="text-[0.72rem] font-semibold text-accent-text uppercase tracking-wide mb-1">
                {event.type}
              </p>
              <p className="text-[0.9rem] font-semibold text-main leading-snug mb-1">
                {event.title}
              </p>
              <p className="text-[0.78rem] text-secondary">
                {new Date(event.event_date).toLocaleDateString('es-CO', {
                  weekday: 'long', day: 'numeric', month: 'short',
                })}{' '}
                · {new Date(event.event_date).toLocaleTimeString('es-CO', {
                  hour: '2-digit', minute: '2-digit',
                })} {event.timezone_label}
              </p>
              {event.registration_url && (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-[0.75rem] font-semibold text-accent-text border border-accent-text rounded-md py-1.5 hover:bg-accent-text hover:text-white transition-colors"
                >
                  Registrarme
                </a>
              )}
            </div>
          ) : (
            <div className="bg-surface-0 border border-border rounded-lg p-4 text-center">
              <p className="text-[0.85rem] font-semibold text-main mb-1">Próximamente</p>
              <p className="text-[0.75rem] text-secondary">
                Estamos preparando el próximo evento. ¡Mantente atento!
              </p>
            </div>
          )}
        </div>
      </div>

      <DashboardDivider className="my-7" />
      <DashboardFooter />
    </motion.div>
  );
}
