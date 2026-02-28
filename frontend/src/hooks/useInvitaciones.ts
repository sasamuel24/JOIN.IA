'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invitado, InvitacionesStats } from '@/types/dashboard';

export function useInvitaciones() {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [stats, setStats] = useState<InvitacionesStats>({
    invitados: 0,
    unidos: 0,
    disponibles: 5,
    meta: 5,
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('access_token');

  const fetchInvitados = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al cargar invitaciones');

      const data = await res.json();
      setInvitados(data.invitados ?? []);
      setStats(
        data.stats ?? {
          invitados: data.invitados?.length ?? 0,
          unidos: data.invitados?.filter((i: Invitado) => i.status === 'unido').length ?? 0,
          disponibles: 5 - (data.invitados?.length ?? 0),
          meta: 5,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitados();
  }, [fetchInvitados]);

  const sendInvitation = async (email: string) => {
    const token = getToken();
    if (!token) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invitations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? 'Error al enviar invitación');
      }

      await fetchInvitados();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSending(false);
    }
  };

  return { invitados, stats, loading, sending, error, sendInvitation, refetch: fetchInvitados };
}
