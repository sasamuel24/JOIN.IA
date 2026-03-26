'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminFeedPost, AdminFeedStats } from '@/types/admin';

const MOCK_STATS: AdminFeedStats = { total: 0, published: 0, pinned: 0 };
const MOCK_POSTS: AdminFeedPost[] = [];

const API = process.env.NEXT_PUBLIC_API_URL;

export function useAdminFeed() {
  const [stats, setStats] = useState<AdminFeedStats | null>(null);
  const [posts, setPosts] = useState<AdminFeedPost[]>([]);
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
      const [statsRes, postsRes] = await Promise.all([
        fetch(`${API}/api/v1/admin/feed/stats`, { headers: getHeaders() }),
        fetch(`${API}/api/v1/admin/feed`, { headers: getHeaders() }),
      ]);
      if (!statsRes.ok || !postsRes.ok) throw new Error('Error al cargar posts del feed');
      const [statsData, postsData] = await Promise.all([
        statsRes.json() as Promise<AdminFeedStats>,
        postsRes.json() as Promise<{ items: AdminFeedPost[]; total: number }>,
      ]);
      setStats(statsData);
      setPosts(postsData.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStats(MOCK_STATS);
      setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deletePost = async (id: string): Promise<void> => {
    const res = await fetch(`${API}/api/v1/admin/feed/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar el post');
    setPosts(prev => prev.filter(p => p.id !== id));
    setStats(prev => prev ? { ...prev, total: Math.max(0, prev.total - 1), published: Math.max(0, prev.published - 1) } : prev);
  };

  return { stats, posts, loading, error, refetch: fetchData, deletePost };
}
