'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminInvitacion, AdminInvitacionesStats } from '@/types/admin';

// ─── Mock data (fallback while backend is not available) ───────────────────────

const MOCK_STATS: AdminInvitacionesStats = {
  total_enviadas: 312,
  pendientes: 147,
  unidas: 107,
  expiradas: 58,
  conversion_rate: 34.3,
  top_inviters: [
    { name: 'Javier Pérez', email: 'javier@startup.co', count: 8, converted: 5 },
    { name: 'María Camila', email: 'mcamila@empresa.com', count: 6, converted: 4 },
    { name: 'Diego Soto', email: 'dsoto@edu.co', count: 5, converted: 3 },
    { name: 'Laura Méndez', email: 'laura@consult.co', count: 5, converted: 2 },
    { name: 'Carlos Ruiz', email: 'cruiz@corp.com', count: 4, converted: 4 },
    { name: 'Ana Torres', email: 'atorres@medialab.io', count: 3, converted: 1 },
    { name: 'Valentina Cruz', email: 'vcruz@design.io', count: 3, converted: 2 },
    { name: 'Roberto Mora', email: 'rmora@tech.io', count: 2, converted: 1 },
  ],
};

const MOCK_INVITACIONES: AdminInvitacion[] = [
  { id: '1', inviter_id: 'u2', inviter_name: 'Javier Pérez', inviter_email: 'javier@startup.co', invited_email: 'pedro@empresa.com', invited_name: 'Pedro García', status: 'unido', invited_at: '2026-02-22', joined_at: '2026-02-23' },
  { id: '2', inviter_id: 'u1', inviter_name: 'María Camila', inviter_email: 'mcamila@empresa.com', invited_email: 'sofia@startup.co', status: 'pendiente', invited_at: '2026-02-22' },
  { id: '3', inviter_id: 'u2', inviter_name: 'Javier Pérez', inviter_email: 'javier@startup.co', invited_email: 'luis@freelance.io', status: 'pendiente', invited_at: '2026-02-21' },
  { id: '4', inviter_id: 'u6', inviter_name: 'Diego Soto', inviter_email: 'dsoto@edu.co', invited_email: 'ana@universidad.edu', invited_name: 'Ana Ramos', status: 'unido', invited_at: '2026-02-20', joined_at: '2026-02-21' },
  { id: '5', inviter_id: 'u1', inviter_name: 'María Camila', inviter_email: 'mcamila@empresa.com', invited_email: 'martin@corp.com', status: 'expirado', invited_at: '2026-02-10' },
  { id: '6', inviter_id: 'u5', inviter_name: 'Laura Méndez', inviter_email: 'laura@consult.co', invited_email: 'carlos@agency.co', status: 'pendiente', invited_at: '2026-02-19' },
  { id: '7', inviter_id: 'u2', inviter_name: 'Javier Pérez', inviter_email: 'javier@startup.co', invited_email: 'andrea@media.io', invited_name: 'Andrea Vargas', status: 'unido', invited_at: '2026-02-18', joined_at: '2026-02-19' },
  { id: '8', inviter_id: 'u6', inviter_name: 'Diego Soto', inviter_email: 'dsoto@edu.co', invited_email: 'prof@universidad.edu', status: 'expirado', invited_at: '2026-02-05' },
  { id: '9', inviter_id: 'u7', inviter_name: 'Valentina Cruz', inviter_email: 'vcruz@design.io', invited_email: 'cliente@empresa.co', status: 'pendiente', invited_at: '2026-02-23' },
  { id: '10', inviter_id: 'u1', inviter_name: 'María Camila', inviter_email: 'mcamila@empresa.com', invited_email: 'director@corp.com', invited_name: 'Roberto Salas', status: 'unido', invited_at: '2026-02-17', joined_at: '2026-02-18' },
];

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAdminInvitaciones() {
  const [stats, setStats] = useState<AdminInvitacionesStats | null>(null);
  const [invitaciones, setInvitaciones] = useState<AdminInvitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('access_token');

  const fetchData = useCallback(async () => {
    const token = getToken();
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const [statsRes, invRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/invitations/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/invitations`, { headers }),
      ]);

      if (!statsRes.ok || !invRes.ok) {
        throw new Error('Error al cargar invitaciones');
      }

      const [statsData, invData] = await Promise.all([
        statsRes.json() as Promise<AdminInvitacionesStats>,
        invRes.json() as Promise<AdminInvitacion[]>,
      ]);

      setStats(statsData);
      setInvitaciones(invData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback silencioso mientras el backend no esté disponible
      setStats(MOCK_STATS);
      setInvitaciones(MOCK_INVITACIONES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, invitaciones, loading, error, refetch: fetchData };
}
