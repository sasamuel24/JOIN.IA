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

const TAB_COMPONENTS: Record<TabId, React.FC> = {
  feed: TabFeed,
  miembros: TabMiembros,
  debates: TabDebates,
  recursos: TabRecursos,
};

export function ComunidadDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
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
        <ComunidadHeader miembros={147} posts={38} activosAhora={12} />
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
            Proximo evento
          </h3>
          <div className="bg-surface-0 border border-border rounded-lg p-4">
            <p className="text-[0.72rem] font-semibold text-accent-text uppercase tracking-wide mb-1">
              Webinar
            </p>
            <p className="text-[0.9rem] font-semibold text-main leading-snug mb-1">
              Como la IA puede reducir tu carga operativa
            </p>
            <p className="text-[0.78rem] text-secondary">
              Jueves 27 Feb · 6:00 PM COT
            </p>
          </div>
        </div>
      </div>

      <DashboardDivider className="my-7" />
      <DashboardFooter />
    </motion.div>
  );
}
