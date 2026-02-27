'use client';

import { createContext, useCallback, useContext, useState } from 'react';

interface AdminSidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextValue>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AdminSidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}
