'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { CurrentUser } from '@/types/dashboard';
import { Avatar } from '@/components/ui/avatar';

interface SidebarUserBlockProps {
  user: CurrentUser | null;
}

export function SidebarUserBlock({ user }: SidebarUserBlockProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.replace('/login');
  };

  const displayName = user?.name ?? 'Usuario';
  const displayEmail = user?.email ?? '';

  return (
    <div className="border-t border-border pt-3 mt-auto flex flex-col gap-2">
      {/* Avatar + Info */}
      <Link
        href="/dashboard/perfil"
        className="flex items-center gap-2.5 no-underline p-2 rounded-lg transition-colors duration-150 hover:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Avatar src={user?.avatar_url} name={displayName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="text-[0.85rem] font-semibold text-text-main leading-tight">
            {displayName}
          </div>
          {displayEmail && (
            <div className="text-[0.72rem] text-text-secondary truncate">
              {displayEmail}
            </div>
          )}
        </div>
      </Link>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-2 py-1.5 border-none rounded-md bg-transparent text-text-secondary text-[0.8rem] font-medium cursor-pointer transition-colors duration-150 hover:bg-error-light hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
      >
        <LogOut size={15} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
}
