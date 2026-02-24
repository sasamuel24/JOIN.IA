'use client';

import { useState, useEffect } from 'react';
import type { CurrentUser } from '@/types/dashboard';

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => (res.ok ? res.json() : Promise.reject('unauthorized')))
      .then((data: CurrentUser) => setUser(data))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
