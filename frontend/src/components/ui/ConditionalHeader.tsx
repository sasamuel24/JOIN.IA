'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header-1';

export function ConditionalHeader() {
  const pathname = usePathname();
  const hiddenRoutes = ['/dashboard', '/admin'];
  const shouldHide = hiddenRoutes.some(r => pathname.startsWith(r));

  if (shouldHide) return null;
  return <Header />;
}
