'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type TabId = 'feed' | 'miembros' | 'debates' | 'recursos';

interface ComunidadTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'miembros', label: 'Miembros' },
  { id: 'debates', label: 'Debates Abiertos' },
  { id: 'recursos', label: 'Recursos' },
];

export function ComunidadTabs({ activeTab, onTabChange }: ComunidadTabsProps) {
  return (
    <div className="flex gap-1 border-b border-border" role="tablist" aria-label="Secciones de comunidad">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative px-4 py-2.5 bg-transparent border-none text-[0.85rem] font-[family-name:var(--font-main)] cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              isActive
                ? 'font-semibold text-accent-text'
                : 'font-normal text-secondary hover:text-main'
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="comunidad-tab-indicator"
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-accent rounded-t-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
