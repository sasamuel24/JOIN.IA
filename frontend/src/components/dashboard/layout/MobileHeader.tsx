'use client';

import { Menu } from 'lucide-react';
import { JoinIALogo } from '../shared/JoinIALogo';
import { useSidebar } from './SidebarContext';

export function MobileHeader() {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-surface-0 border-b border-border lg:hidden">
      <button
        onClick={toggle}
        className="p-1.5 rounded-md hover:bg-surface-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="Abrir menú"
      >
        <Menu size={20} className="text-text-main" />
      </button>
      <JoinIALogo size="md" />
    </header>
  );
}
