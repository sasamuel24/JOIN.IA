'use client';

import { Menu } from 'lucide-react';
import { JoinIALogo } from '@/components/dashboard/shared/JoinIALogo';
import { useAdminSidebar } from './AdminSidebarContext';

export function AdminMobileHeader() {
  const { toggle } = useAdminSidebar();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-[#0F0F0F] border-b border-white/10 lg:hidden">
      <button
        onClick={toggle}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="Abrir menú"
      >
        <Menu size={20} className="text-white" />
      </button>
      <JoinIALogo size="md" textColor="#ffffff" />
    </header>
  );
}
