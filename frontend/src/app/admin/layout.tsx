'use client';

import AdminGuard from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-neutral)' }}>
        <AdminSidebar />
        <main
          style={{
            marginLeft: 230,
            flex: 1,
            minHeight: '100vh',
            background: 'var(--bg-white)',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
