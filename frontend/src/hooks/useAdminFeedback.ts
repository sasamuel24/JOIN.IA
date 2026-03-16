'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminFeedbackEntry, AdminFeedbackStats } from '@/types/admin';

// ─── Mock data (fallback while backend is not available) ───────────────────────

const MOCK_STATS: AdminFeedbackStats = {
  total: 89,
  promedio_impacto: 7.4,
  top_desgastes: [
    { label: 'Tareas repetitivas y manuales', count: 62 },
    { label: 'Falta de tiempo para análisis', count: 54 },
    { label: 'Comunicación interna ineficiente', count: 41 },
    { label: 'Documentación desactualizada', count: 38 },
    { label: 'Reuniones sin estructura', count: 29 },
    { label: 'Seguimiento de proyectos', count: 25 },
    { label: 'Onboarding lento de nuevos empleados', count: 18 },
    { label: 'Reportes manuales', count: 15 },
  ],
  top_herramientas: [
    { label: 'Notion', count: 47 },
    { label: 'Slack', count: 44 },
    { label: 'Google Workspace', count: 41 },
    { label: 'Jira', count: 33 },
    { label: 'Trello', count: 28 },
    { label: 'Asana', count: 21 },
    { label: 'Excel/Sheets', count: 19 },
    { label: 'Figma', count: 16 },
    { label: 'HubSpot', count: 12 },
    { label: 'Zoom', count: 10 },
  ],
  por_rol: [
    { rol: 'CEO / Fundador', count: 24 },
    { rol: 'Product Manager', count: 19 },
    { rol: 'Developer', count: 17 },
    { rol: 'Designer', count: 12 },
    { rol: 'Operations', count: 10 },
    { rol: 'Marketing', count: 7 },
  ],
  top_resultados: [
    { label: 'Automatizar tareas repetitivas', count: 58 },
    { label: 'Mejorar toma de decisiones', count: 51 },
    { label: 'Reducir tiempo en reuniones', count: 43 },
    { label: 'Generar reportes automáticos', count: 38 },
    { label: 'Onboarding más rápido', count: 29 },
  ],
};

const MOCK_ENTRIES: AdminFeedbackEntry[] = [
  { id: 'f1', user_id: 'u1', user_name: 'María Camila', user_email: 'mcamila@empresa.com', rol: 'CEO / Fundador', desgastes: ['Tareas repetitivas y manuales', 'Falta de tiempo para análisis'], impacto: 9, solucion_actual: 'Notion + reuniones semanales', herramientas: ['Notion', 'Slack', 'Google Workspace'], vision_ia: 'Un asistente que tome notas y resuma decisiones en tiempo real.', resultados_deseados: ['Automatizar tareas repetitivas', 'Mejorar toma de decisiones'], created_at: '2026-02-22' },
  { id: 'f2', user_id: 'u2', user_name: 'Javier Pérez', user_email: 'javier@startup.co', rol: 'Product Manager', desgastes: ['Seguimiento de proyectos', 'Reuniones sin estructura'], impacto: 8, solucion_actual: 'Jira + daily standups', herramientas: ['Jira', 'Slack', 'Figma'], vision_ia: 'Que analice el backlog y priorice automáticamente según impacto.', resultados_deseados: ['Reducir tiempo en reuniones', 'Generar reportes automáticos'], created_at: '2026-02-21' },
  { id: 'f3', user_id: 'u3', user_name: 'Ana Torres', user_email: 'atorres@medialab.io', rol: 'Designer', desgastes: ['Documentación desactualizada', 'Comunicación interna ineficiente'], impacto: 7, solucion_actual: 'Notion + Figma comments', herramientas: ['Figma', 'Notion', 'Asana'], vision_ia: 'Un sistema que sincronice comentarios de diseño con tareas de desarrollo.', resultados_deseados: ['Onboarding más rápido', 'Automatizar tareas repetitivas'], created_at: '2026-02-20' },
];

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAdminFeedback() {
  const [stats, setStats] = useState<AdminFeedbackStats | null>(null);
  const [entries, setEntries] = useState<AdminFeedbackEntry[]>([]);
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

      const [statsRes, entriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feedback/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feedback`, { headers }),
      ]);

      if (!statsRes.ok || !entriesRes.ok) {
        throw new Error('Error al cargar feedback');
      }

      const [statsData, entriesData] = await Promise.all([
        statsRes.json() as Promise<AdminFeedbackStats>,
        entriesRes.json() as Promise<{ items: AdminFeedbackEntry[]; total: number }>,
      ]);

      setStats(statsData);
      setEntries(entriesData.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Fallback silencioso mientras el backend no esté disponible
      setStats(MOCK_STATS);
      setEntries(MOCK_ENTRIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, entries, loading, error, refetch: fetchData };
}
