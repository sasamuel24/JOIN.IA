'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CurrentUser } from '@/types/dashboard';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem('access_token');
          router.replace('/login');
          return;
        }

        const user: CurrentUser = await res.json();

        if (user.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }

        setChecking(false);
      } catch {
        localStorage.removeItem('access_token');
        router.replace('/login');
      }
    };

    checkAdmin();
  }, [router]);

  if (checking) return null;

  return <>{children}</>;
}
