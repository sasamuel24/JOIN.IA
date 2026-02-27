'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminUser, AdminUsersStats } from '@/types/admin';

// ─── Mock data (fallback while backend is not available) ───────────────────────

const MOCK_STATS: AdminUsersStats = {
  total: 147,
  activos: 112,
  nuevos_semana: 18,
  con_feedback: 89,
  por_grupo: [
    { grupo: 'Empresa', count: 54 },
    { grupo: 'Startup', count: 43 },
    { grupo: 'Freelance', count: 28 },
    { grupo: 'Educación', count: 14 },
    { grupo: 'Otro', count: 8 },
  ],
  por_tier: [
    { tier: 'Early Access', count: 98 },
    { tier: 'Invitado', count: 35 },
    { tier: 'Waitlist', count: 14 },
  ],
};

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'María Camila', email: 'mcamila@empresa.com', role: 'user', group: 'Empresa', access_tier: 'Early Access', created_at: '2026-02-22', feedback_completed: true, invitations_sent: 3, status: 'activo' },
  { id: '2', name: 'Javier Pérez', email: 'javier@startup.co', role: 'user', group: 'Startup', access_tier: 'Early Access', created_at: '2026-02-21', feedback_completed: true, invitations_sent: 5, status: 'activo' },
  { id: '3', name: 'Ana Torres', email: 'atorres@medialab.io', role: 'user', group: 'Freelance', access_tier: 'Invitado', created_at: '2026-02-20', feedback_completed: false, invitations_sent: 1, status: 'activo' },
  { id: '4', name: 'Carlos Ruiz', email: 'cruiz@corp.com', role: 'user', group: 'Empresa', access_tier: 'Waitlist', created_at: '2026-02-19', feedback_completed: false, invitations_sent: 0, status: 'inactivo' },
  { id: '5', name: 'Laura Méndez', email: 'laura@consult.co', role: 'user', group: 'Startup', access_tier: 'Early Access', created_at: '2026-02-18', feedback_completed: true, invitations_sent: 2, status: 'activo' },
  { id: '6', name: 'Diego Soto', email: 'dsoto@edu.co', role: 'user', group: 'Educación', access_tier: 'Early Access', created_at: '2026-02-17', feedback_completed: true, invitations_sent: 4, status: 'activo' },
  { id: '7', name: 'Valentina Cruz', email: 'vcruz@design.io', role: 'user', group: 'Freelance', access_tier: 'Invitado', created_at: '2026-02-16', feedback_completed: false, invitations_sent: 0, status: 'inactivo' },
];

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAdminUsers() {
  const [stats, setStats] = useState<AdminUsersStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
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

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users`, { headers }),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const [statsData, usersData] = await Promise.all([
        statsRes.json() as Promise<AdminUsersStats>,
        usersRes.json() as Promise<AdminUser[]>,
      ]);

      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback silencioso mientras el backend no esté disponible
      setStats(MOCK_STATS);
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, users, loading, error, refetch: fetchData };
}
