'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminDebateItem, AdminDebatesStats } from '@/types/admin';

// ─── Mock data (fallback si el backend no responde) ──────────────────────────

const MOCK_STATS: AdminDebatesStats = {
  total: 6,
  featured: 2,
  con_respuestas: 4,
};

const MOCK_DEBATES: AdminDebateItem[] = [
  { id: '1', title: '¿Cómo está cambiando la IA el diagnóstico clínico?', category: 'Clínico', content: 'Exploramos el impacto de los modelos de lenguaje en el proceso diagnóstico.', slug: 'ia-diagnostico-clinico', is_featured: true, replies_count: 12, created_at: '2026-03-20T10:00:00Z', author_name: 'Admin' },
  { id: '2', title: 'El rol del psicólogo en la era de la IA', category: 'Psicología', content: '¿Cómo se redefine nuestra profesión frente a herramientas de IA generativa?', slug: 'rol-psicologo-ia', is_featured: false, replies_count: 4, created_at: '2026-03-18T09:00:00Z', author_name: 'Admin' },
  { id: '3', title: 'Herramientas de IA para notas clínicas', category: 'Recursos', content: 'Comparativa de herramientas para automatizar la documentación clínica.', slug: 'herramientas-notas-clinicas', is_featured: true, replies_count: 7, created_at: '2026-03-15T11:00:00Z', author_name: 'Admin' },
];

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminDebates() {
  const [stats, setStats] = useState<AdminDebatesStats | null>(null);
  const [debates, setDebates] = useState<AdminDebateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, debatesRes] = await Promise.all([
        fetch(`${API}/api/v1/admin/debates/stats`, { headers: getHeaders() }),
        fetch(`${API}/api/v1/admin/debates`, { headers: getHeaders() }),
      ]);
      if (!statsRes.ok || !debatesRes.ok) throw new Error('Error al cargar debates');
      const [statsData, debatesData] = await Promise.all([
        statsRes.json() as Promise<AdminDebatesStats>,
        debatesRes.json() as Promise<{ items: AdminDebateItem[]; total: number }>,
      ]);
      setStats(statsData);
      setDebates(debatesData.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStats(MOCK_STATS);
      setDebates(MOCK_DEBATES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createDebate = async (data: {
    title: string; content: string; category: string; is_featured: boolean;
  }): Promise<AdminDebateItem> => {
    const res = await fetch(`${API}/api/v1/admin/debates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear debate');
    const created = await res.json() as AdminDebateItem;
    setDebates(prev => [created, ...prev]);
    setStats(prev => prev ? { ...prev, total: prev.total + 1 } : prev);
    return created;
  };

  const updateDebate = async (
    id: string,
    data: Partial<{ title: string; content: string; category: string; is_featured: boolean }>
  ): Promise<AdminDebateItem> => {
    const res = await fetch(`${API}/api/v1/admin/debates/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar debate');
    const updated = await res.json() as AdminDebateItem;
    setDebates(prev => prev.map(d => d.id === id ? updated : d));
    return updated;
  };

  const deleteDebate = async (id: string): Promise<void> => {
    const res = await fetch(`${API}/api/v1/admin/debates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar debate');
    setDebates(prev => prev.filter(d => d.id !== id));
    setStats(prev => prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev);
  };

  const toggleFeatured = async (id: string): Promise<void> => {
    const res = await fetch(`${API}/api/v1/admin/debates/${id}/featured`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al actualizar debate');
    const updated = await res.json() as AdminDebateItem;
    setDebates(prev => prev.map(d => d.id === id ? updated : d));
  };

  return { stats, debates, loading, error, refetch: fetchData, createDebate, updateDebate, deleteDebate, toggleFeatured };
}
