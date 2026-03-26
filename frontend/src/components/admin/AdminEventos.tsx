'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Pencil, Trash2, ExternalLink, X, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token') ?? localStorage.getItem('token') ?? ''
      : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface EventItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  event_date: string;
  timezone_label: string;
  registration_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface EventFormData {
  title: string;
  event_date: string;
  timezone_label: string;
  registration_url: string;
  is_active: boolean;
}

const EMPTY_FORM: EventFormData = {
  title: '',
  event_date: '',
  timezone_label: 'GMT-5 · Bogotá',
  registration_url: '',
  is_active: true,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatEventDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// Convert ISO string to datetime-local input value
function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── EventForm modal ────────────────────────────────────────────────────────────

interface EventFormProps {
  initial: EventFormData;
  onSave: (data: EventFormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
  mode: 'create' | 'edit';
}

function EventForm({ initial, onSave, onClose, saving, mode }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>(initial);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof EventFormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('El título es requerido'); return; }
    if (!form.event_date) { setError('La fecha es requerida'); return; }
    setError(null);
    await onSave(form);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    fontSize: '0.88rem',
    color: 'var(--text-main)',
    background: 'var(--bg-white)',
    fontFamily: 'var(--font-main)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'var(--bg-white)',
          borderRadius: 14,
          padding: '1.75rem',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {mode === 'create' ? 'Nuevo webinar' : 'Editar webinar'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
              Los cambios se verán reflejados en el dashboard de usuarios
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Título del webinar *</label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="IA para Contenido de Marca con Juan Uribe"
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Fecha y hora *</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.event_date}
              onChange={e => set('event_date', e.target.value)}
            />
          </div>

          {/* Timezone */}
          <div>
            <label style={labelStyle}>Zona horaria</label>
            <input
              style={inputStyle}
              value={form.timezone_label}
              onChange={e => set('timezone_label', e.target.value)}
              placeholder="GMT-5 · Bogotá"
            />
          </div>

          {/* Registration URL */}
          <div>
            <label style={labelStyle}>Link de registro</label>
            <input
              style={inputStyle}
              value={form.registration_url}
              onChange={e => set('registration_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              style={{
                width: 38, height: 22, borderRadius: 11,
                background: form.is_active ? 'var(--accent)' : 'var(--border-color)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3,
                left: form.is_active ? 19 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              {form.is_active ? 'Activo — visible para usuarios' : 'Inactivo — oculto'}
            </span>
          </div>

          {error && (
            <div style={{
              padding: '0.6rem 0.75rem', borderRadius: 8,
              background: '#FEF2F2', border: '1px solid #FECACA',
              fontSize: '0.82rem', color: '#DC2626',
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.1rem', borderRadius: 8,
                border: '1px solid var(--border-color)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: 'var(--font-main)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.55rem 1.25rem', borderRadius: 8,
                border: 'none', background: 'var(--accent)',
                color: 'white', fontSize: '0.85rem', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-main)',
                opacity: saving ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              <Check size={15} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AdminEventos() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/events`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Error al cargar eventos');
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSave = async (form: EventFormData) => {
    setSaving(true);
    try {
      const body = {
        type: 'webinar',
        title: form.title,
        event_date: new Date(form.event_date).toISOString(),
        timezone_label: form.timezone_label,
        registration_url: form.registration_url || null,
        is_active: form.is_active,
      };

      if (editingEvent) {
        const res = await fetch(`${API_URL}/api/v1/admin/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Error al actualizar');
      } else {
        const res = await fetch(`${API_URL}/api/v1/admin/events`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Error al crear');
      }

      setShowForm(false);
      setEditingEvent(null);
      await fetchEvents();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/api/v1/admin/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      setEvents(prev => prev.filter(e => e.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (ev: EventItem) => {
    setEditingEvent(ev);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const formInitial: EventFormData = editingEvent
    ? {
        title: editingEvent.title,
        event_date: toDatetimeLocal(editingEvent.event_date),
        timezone_label: editingEvent.timezone_label,
        registration_url: editingEvent.registration_url ?? '',
        is_active: editingEvent.is_active,
      }
    : EMPTY_FORM;

  const upcomingCount = events.filter(e => e.is_active && new Date(e.event_date) >= new Date()).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ padding: '2rem', maxWidth: 900 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Webinars
            </h1>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {upcomingCount > 0
                ? `${upcomingCount} próximo${upcomingCount !== 1 ? 's' : ''} — visible${upcomingCount !== 1 ? 's' : ''} en el dashboard de comunidad`
                : 'Sin eventos próximos activos'}
            </p>
          </div>
          <button
            onClick={openCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.1rem', borderRadius: 8,
              background: 'var(--accent)', border: 'none',
              color: 'white', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-main)',
            }}
          >
            <Plus size={16} />
            Nuevo webinar
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 88, borderRadius: 10,
                background: 'var(--bg-neutral)', animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        ) : error ? (
          <div style={{
            padding: '1.25rem', borderRadius: 10,
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: '#DC2626', fontSize: '0.88rem',
          }}>
            {error}
          </div>
        ) : events.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            border: '1px dashed var(--border-color)', borderRadius: 12,
          }}>
            <Calendar size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              No hay webinars registrados
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>
              Crea el primero para que aparezca en el dashboard de comunidad
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {events.map((ev, i) => {
              const isPast = new Date(ev.event_date) < new Date();
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-white)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    opacity: (!ev.is_active || isPast) ? 0.6 : 1,
                  }}
                >
                  {/* Badge */}
                  <div style={{
                    padding: '0.2rem 0.6rem', borderRadius: 6,
                    background: 'var(--accent-light)',
                    color: 'var(--accent)', fontSize: '0.7rem',
                    fontWeight: 700, letterSpacing: '0.04em',
                    textTransform: 'uppercase', flexShrink: 0,
                  }}>
                    WEBINAR
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.92rem', fontWeight: 600,
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {formatEventDate(ev.event_date)} · {ev.timezone_label}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{
                    padding: '0.2rem 0.6rem', borderRadius: 20,
                    fontSize: '0.72rem', fontWeight: 600, flexShrink: 0,
                    ...(isPast
                      ? { background: 'var(--bg-neutral)', color: 'var(--text-muted)' }
                      : ev.is_active
                        ? { background: 'rgba(0,212,170,0.1)', color: 'var(--accent)' }
                        : { background: '#FFF7E0', color: '#B87700' }),
                  }}>
                    {isPast ? 'Pasado' : ev.is_active ? 'Activo' : 'Inactivo'}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    {ev.registration_url && (
                      <a
                        href={ev.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver link de registro"
                        style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => openEdit(ev)}
                      title="Editar"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 4,
                        display: 'flex', borderRadius: 6,
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={deletingId === ev.id}
                      title="Eliminar"
                      style={{
                        background: 'none', border: 'none',
                        cursor: deletingId === ev.id ? 'not-allowed' : 'pointer',
                        color: deletingId === ev.id ? 'var(--text-muted)' : '#EF4444',
                        padding: 4, display: 'flex', borderRadius: 6,
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <EventForm
            key={editingEvent?.id ?? 'new'}
            initial={formInitial}
            onSave={handleSave}
            onClose={closeForm}
            saving={saving}
            mode={editingEvent ? 'edit' : 'create'}
          />
        )}
      </AnimatePresence>
    </>
  );
}
