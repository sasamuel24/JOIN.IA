'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserPlus,
  Terminal,
  LogOut,
} from 'lucide-react';
import type { NavItem } from '@/types/dashboard';
import { JoinIALogo } from '@/components/dashboard/shared/JoinIALogo';

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Invitaciones', href: '/admin/invitaciones', icon: UserPlus },
  { label: 'Logs', href: '/admin/logs', icon: Terminal },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.replace('/login');
  };

  return (
    <aside
      style={{
        width: 230,
        minWidth: 230,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#0F0F0F',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--bg-white)' }}>
          Admin Panel
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '1.5rem',
        }}
      >
        <JoinIALogo size="sm" textColor="rgba(255,255,255,0.4)" />
        <span>· Gestión interna</span>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {ADMIN_NAV.map(item => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <motion.div key={item.href} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 6,
                  background: active ? 'rgba(0, 212, 170, 0.15)' : 'transparent',
                  color: active ? 'var(--accent)' : 'rgba(255,255,255,0.55)',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                  }
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Back to dashboard */}
      <Link
        href="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.5rem',
          borderRadius: 6,
          background: 'transparent',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.8rem',
          textDecoration: 'none',
          marginBottom: '0.35rem',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        }}
      >
        &larr; Volver al dashboard
      </Link>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.45rem 0.5rem',
          border: 'none',
          borderRadius: 6,
          background: 'transparent',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-main)',
          cursor: 'pointer',
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
          e.currentTarget.style.color = '#EF4444';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        }}
      >
        <LogOut size={15} />
        <span>Cerrar sesión</span>
      </button>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '0.75rem',
          marginTop: '0.75rem',
        }}
      >
        <JoinIALogo size="sm" textColor="rgba(255,255,255,0.3)" />
        <span
          style={{
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.2)',
            display: 'block',
            marginTop: '0.1rem',
          }}
        >
          Reduciendo fricción
        </span>
      </div>
    </aside>
  );
}
