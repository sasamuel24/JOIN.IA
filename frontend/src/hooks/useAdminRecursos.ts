'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminResourceItem, AdminResourcesStats } from '@/types/admin';

// ─── Mock data (fallback si el backend no responde) ──────────────────────────

const MOCK_STATS: AdminResourcesStats = {
  total: 5,
  featured: 2,
  published: 4,
  por_tipo: [
    { tipo: 'guide', count: 2 },
    { tipo: 'video', count: 2 },
    { tipo: 'template', count: 1 },
  ],
};

const MOCK_RECURSOS: AdminResourceItem[] = [
  { id: '1', title: 'Guía de prompts para psicólogos', description: 'Cómo escribir prompts efectivos para trabajo clínico.', resource_type: 'guide', category: 'Productividad', resource_url: 'https://example.com', thumbnail_url: null, author_name: 'JOIN.IA', is_featured: true, is_published: true, published_at: null, created_at: '2026-03-20T10:00:00Z' },
  { id: '2', title: 'Plantilla SOAP con IA', description: 'Plantilla para notas SOAP asistidas por IA.', resource_type: 'template', category: 'Clínico', resource_url: null, thumbnail_url: null, author_name: 'JOIN.IA', is_featured: true, is_published: true, published_at: null, created_at: '2026-03-18T09:00:00Z' },
  { id: '3', title: 'Video: ChatGPT para psicólogos', description: 'Tutorial práctico de uso de ChatGPT en consulta.', resource_type: 'video', category: 'Formación', resource_url: 'https://youtube.com', thumbnail_url: null, author_name: 'JOIN.IA', is_featured: false, is_published: true, published_at: null, created_at: '2026-03-15T11:00:00Z' },
];

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminRecursos() {
  const [stats, setStats] = useState<AdminResourcesStats | null>(null);
  const [recursos, setRecursos] = useState<AdminResourceItem[]>([]);
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
      const [statsRes, recursosRes] = await Promise.all([
        fetch(`${API}/api/v1/admin/resources/stats`, { headers: getHeaders() }),
        fetch(`${API}/api/v1/admin/resources`, { headers: getHeaders() }),
      ]);
      if (!statsRes.ok || !recursosRes.ok) throw new Error('Error al cargar recursos');
      const [statsData, recursosData] = await Promise.all([
        statsRes.json() as Promise<AdminResourcesStats>,
        recursosRes.json() as Promise<{ items: AdminResourceItem[]; total: number }>,
      ]);
      setStats(statsData);
      setRecursos(recursosData.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStats(MOCK_STATS);
      setRecursos(MOCK_RECURSOS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createRecurso = async (data: {
    title: string; description: string; resource_type: string;
    category?: string; resource_url?: string; thumbnail_url?: string;
    author_name?: string; is_featured: boolean; is_published: boolean;
    published_at?: string | null;
  }): Promise<AdminResourceItem> => {
    const res = await fetch(`${API}/api/v1/admin/resources`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear recurso');
    const created = await res.json() as AdminResourceItem;
    setRecursos(prev => [created, ...prev]);
    setStats(prev => prev ? { ...prev, total: prev.total + 1 } : prev);
    return created;
  };

  const updateRecurso = async (
    id: string,
    data: Partial<{
      title: string; description: string; resource_type: string;
      category: string; resource_url: string; thumbnail_url: string;
      author_name: string; is_featured: boolean; is_published: boolean;
      published_at: string | null;
    }>
  ): Promise<AdminResourceItem> => {
    const res = await fetch(`${API}/api/v1/admin/resources/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar recurso');
    const updated = await res.json() as AdminResourceItem;
    setRecursos(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const deleteRecurso = async (id: string): Promise<void> => {
    const res = await fetch(`${API}/api/v1/admin/resources/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar recurso');
    setRecursos(prev => prev.filter(r => r.id !== id));
    setStats(prev => prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev);
  };

  const toggleFeatured = async (id: string): Promise<void> => {
    const res = await fetch(`${API}/api/v1/admin/resources/${id}/featured`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al actualizar recurso');
    const updated = await res.json() as AdminResourceItem;
    setRecursos(prev => prev.map(r => r.id === id ? updated : r));
  };

  return { stats, recursos, loading, error, refetch: fetchData, createRecurso, updateRecurso, deleteRecurso, toggleFeatured };
}
