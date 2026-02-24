'use client';

import { usePathname } from 'next/navigation';
import { Home, UserPlus, Send, Users, Sparkles } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { NavItem } from '@/types/dashboard';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUserBlock } from './SidebarUserBlock';
import { SidebarFooter } from './SidebarFooter';
import { JoinIALogo } from '../shared/JoinIALogo';
import { useSidebar } from './SidebarContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/dashboard', icon: Home },
  { label: 'Mi invitación', href: '/dashboard/invitaciones', icon: UserPlus },
  { label: 'Compartir feedback', href: '/dashboard/feedback', icon: Send },
  { label: 'Comunidad', href: '/dashboard/comunidad', icon: Users },
  { label: '¿Qué hay de nuevo?', href: '/dashboard/actualizaciones', icon: Sparkles },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { isOpen, close } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="mb-3 text-text-main">
        <JoinIALogo size="lg" />
      </div>

      {/* Early Access notice */}
      <p className="text-xs text-text-secondary leading-snug mb-5">
        Early Access — Estamos construyendo el núcleo operativo con IA...
      </p>

      {/* Navigation */}
      <nav className="flex flex-col gap-1" aria-label="Dashboard navigation">
        {NAV_ITEMS.map(item => (
          <SidebarNavItem key={item.href} item={item} isActive={isActive(item.href)} onNavigate={close} />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User block */}
      <SidebarUserBlock user={user} />

      {/* Footer */}
      <SidebarFooter />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[230px] min-w-[230px] bg-surface-0 border-r border-border flex-col px-4 py-6 z-50 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={close}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          {/* Sidebar */}
          <aside
            className="absolute top-0 left-0 h-full w-[270px] bg-surface-0 border-r border-border flex flex-col px-4 py-6 overflow-y-auto shadow-xl animate-in slide-in-from-left duration-200"
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
