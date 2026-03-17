'use client';

import { DashboardSidebar } from '@/components/dashboard/layout/DashboardSidebar';
import { MobileHeader } from '@/components/dashboard/layout/MobileHeader';
import { SidebarProvider } from '@/components/dashboard/layout/SidebarContext';
import { ToastProvider } from '@/components/ui/toast';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <ToastProvider>
          <div className="flex min-h-screen bg-surface-0">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col lg:ml-[230px] transition-[margin] duration-300">
              <MobileHeader />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </SidebarProvider>
    </AuthGuard>
  );
}
