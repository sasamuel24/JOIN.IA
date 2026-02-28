'use client';

import Link from 'next/link';
import type { NavItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({ item, isActive, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-r-md border-l-2 text-sm transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        isActive
          ? 'border-accent bg-accent-light text-accent-text font-semibold'
          : 'border-transparent text-text-secondary hover:bg-surface-1 hover:text-text-main'
      )}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </Link>
  );
}
