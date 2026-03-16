'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AdminDashboardMetrics {
  total_usuarios: number;
  feedbacks_completados: number;
  invitaciones_enviadas: number;
  conversion_rate: number;
}

export interface AdminRecentUser {
  name: string;
  email: string;
  date: string;
  status: string;
}

// ─── Mock data (fallback while backend is not available) ───────────────────────

const MOCK_METRICS: AdminDashboardMetrics = {
  total_usuarios: 147,
  feedbacks_completados: 89,
  invitaciones_enviadas: 312,
  conversion_rate: 34,
};

const MOCK_RECENT_USERS: AdminRecentUser[] = [
  { name: 'María Camila', email: 'mcamila@empresa.com', date: '22 Feb 2026', status: 'Activo' },
  { name: 'Javier P.', email: 'javier@startup.co', date: '21 Feb 2026', status: 'Activo' },
  { name: 'Ana Torres', email: 'atorres@medialab.io', date: '20 Feb 2026', status: 'Activo' },
  { name: 'Carlos Ruiz', email: 'cruiz@corp.com', date: '19 Feb 2026', status: 'Pendiente' },
  { name: 'Laura Méndez', email: 'laura@consult.co', date: '18 Feb 2026', status: 'Activo' },
];

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminRecentUser[]>([]);
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

      const [usersStatsRes, invStatsRes, recentRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/invitations/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/recent`, { headers }),
      ]);

      if (!usersStatsRes.ok || !invStatsRes.ok || !recentRes.ok) {
        throw new Error('Error al cargar métricas del dashboard');
      }

      const [usersStats, invStats, recentData] = await Promise.all([
        usersStatsRes.json(),
        invStatsRes.json(),
        recentRes.json() as Promise<{ items: { name: string; email: string; created_at: string; status: string }[] }>,
      ]);

      setMetrics({
        total_usuarios: usersStats.total,
        feedbacks_completados: usersStats.con_feedback,
        invitaciones_enviadas: invStats.total_enviadas,
        conversion_rate: Math.round(invStats.conversion_rate),
      });
      setRecentUsers(
        (recentData.items ?? []).map((u) => ({
          name: u.name,
          email: u.email,
          date: new Date(u.created_at).toLocaleDateString('es-CO', {
            day: '2-digit', month: 'short', year: 'numeric',
          }),
          status: u.status === 'activo' ? 'Activo' : 'Inactivo',
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback silencioso mientras el backend no esté disponible
      setMetrics(MOCK_METRICS);
      setRecentUsers(MOCK_RECENT_USERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { metrics, recentUsers, loading, error, refetch: fetchData };
}
