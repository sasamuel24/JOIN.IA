'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileHeader } from '@/components/admin/AdminMobileHeader';
import { AdminSidebarProvider } from '@/components/admin/AdminSidebarContext';
import AdminGuard from '@/components/admin/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminSidebarProvider>
        <div className="flex min-h-screen" style={{ background: 'var(--bg-neutral)' }}>
          <AdminSidebar />
          <div className="flex-1 flex flex-col lg:ml-[230px] transition-[margin] duration-300">
            <AdminMobileHeader />
            <main
              className="flex-1 min-h-screen"
              style={{ background: 'var(--bg-white)', overflowY: 'auto' }}
            >
              {children}
            </main>
          </div>
        </div>
      </AdminSidebarProvider>
    </AdminGuard>
  );
}
