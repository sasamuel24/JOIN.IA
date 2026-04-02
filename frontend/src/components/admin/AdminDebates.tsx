'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Trash2, Pencil, X, MessageSquare } from 'lucide-react';
import { AITextarea } from '@/components/ui/AITextarea';
import { AIInput } from '@/components/ui/AIInput';
import { useAdminDebates } from '@/hooks/useAdminDebates';
import type { AdminDebateItem } from '@/types/admin';

// ─── Categorías disponibles ───────────────────────────────────────────────────

const CATEGORIAS = ['Clínico', 'Psicología', 'IA', 'Recursos', 'Tecnología', 'Formación', 'Otro'];

// ─── Modal crear / editar ─────────────────────────────────────────────────────

interface DebateModalProps {
  debate?: AdminDebateItem;
  onClose: () => void;
  onSave: (data: { title: string; content: string; category: string; is_featured: boolean }) => Promise<void>;
}

function DebateModal({ debate, onClose, onSave }: DebateModalProps) {
  const [title, setTitle] = useState(debate?.title ?? '');
  const [content, setContent] = useState(debate?.content ?? '');
  const [category, setCategory] = useState(debate?.category ?? 'Clínico');
  const [isFeatured, setIsFeatured] = useState(debate?.is_featured ?? false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErr('Título y contenido son obligatorios');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await onSave({ title: title.trim(), content: content.trim(), category, is_featured: isFeatured });
      onClose();
    } catch {
      setErr('Error al guardar el debate');
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 7, boxSizing: 'border-box',
    border: '1px solid var(--border-color)', background: 'var(--bg-neutral)',
    fontFamily: 'var(--font-main)', fontSize: '0.9rem', color: 'var(--text-main)', outline: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'relative', background: 'var(--bg-white)', borderRadius: 12,
          padding: '2rem', width: '100%', maxWidth: 540,
          border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
            {debate ? 'Editar debate' : 'Nuevo debate'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Título *
            </label>
            <AIInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              onAIResult={text => setTitle(text)}
              placeholder="Escribe el título del debate..."
              style={fieldStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Contenido *
            </label>
            <AITextarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onAIResult={text => setContent(text)}
              placeholder="Desarrolla la pregunta o tema del debate..."
              rows={4}
              style={{ ...fieldStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Categoría
            </label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={fieldStyle}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Destacar este debate (aparece primero en la comunidad)
            </span>
          </label>

          {err && <p style={{ fontSize: '0.82rem', color: '#EF4444', margin: 0 }}>{err}</p>}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{
              padding: '0.6rem 1.2rem', borderRadius: 7, border: '1px solid var(--border-color)',
              background: 'transparent', fontFamily: 'var(--font-main)', fontSize: '0.88rem',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{
              padding: '0.6rem 1.4rem', borderRadius: 7, border: 'none',
              background: saving ? 'var(--text-muted)' : 'var(--accent)',
              fontFamily: 'var(--font-main)', fontSize: '0.88rem', fontWeight: 700,
              color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Guardando...' : debate ? 'Guardar cambios' : 'Crear debate'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function AdminDebates() {
  const { stats, debates, loading, createDebate, updateDebate, deleteDebate, toggleFeatured } = useAdminDebates();
  const [modal, setModal] = useState<'create' | AdminDebateItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSave = async (data: { title: string; content: string; category: string; is_featured: boolean }) => {
    if (modal === 'create') {
      await createDebate(data);
    } else if (modal && typeof modal === 'object') {
      await updateDebate(modal.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDebate(id);
    setConfirmDelete(null);
  };

  const statCards = [
    { label: 'Total debates', value: stats?.total ?? 0, color: 'var(--accent)' },
    { label: 'Destacados', value: stats?.featured ?? 0, color: '#B87700' },
    { label: 'Con respuestas', value: stats?.con_respuestas ?? 0, color: 'var(--text-secondary)' },
  ];

  return (
    <div className="p-4 md:p-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>
            Debates
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
            Gestiona los debates de la comunidad
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.2rem', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Nuevo debate
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}
      >
        {statCards.map(card => (
          <div key={card.label} style={{
            background: 'var(--bg-white)', borderRadius: 10, padding: '1.1rem 1.2rem',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color, fontFamily: 'var(--font-main)' }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        style={{ background: 'var(--bg-white)', borderRadius: 10, border: '1px solid var(--border-color)', overflow: 'hidden' }}
      >
        {/* Cabecera */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 110px 90px 80px 90px',
          padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-neutral)',
        }}>
          {['Título / Categoría', 'Respuestas', 'Destacado', 'Fecha', 'Acciones'].map(h => (
            <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Cargando debates...
          </div>
        ) : debates.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No hay debates aún. Crea el primero con el botón de arriba.
          </div>
        ) : (
          debates.map((debate, i) => (
            <motion.div
              key={debate.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 90px 80px 90px',
                padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-color)',
                alignItems: 'center',
              }}
            >
              {/* Título + categoría */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {debate.is_featured && <Star size={13} fill="var(--accent)" color="var(--accent)" />}
                  <span style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-main)' }}>
                    {debate.title.length > 55 ? debate.title.slice(0, 55) + '…' : debate.title}
                  </span>
                </div>
                <span style={{
                  display: 'inline-block', marginTop: '0.2rem', fontSize: '0.72rem', padding: '0.15rem 0.5rem',
                  borderRadius: 4, background: 'var(--bg-neutral)', color: 'var(--text-muted)',
                }}>
                  {debate.category}
                </span>
              </div>

              {/* Respuestas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <MessageSquare size={13} />
                {debate.replies_count}
              </div>

              {/* Toggle destacado */}
              <div>
                <button
                  onClick={() => toggleFeatured(debate.id)}
                  title={debate.is_featured ? 'Quitar destacado' : 'Destacar'}
                  style={{
                    border: 'none', borderRadius: 5, cursor: 'pointer', padding: '0.3rem 0.6rem',
                    background: debate.is_featured ? 'var(--accent-light)' : 'var(--bg-neutral)',
                    color: debate.is_featured ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '0.75rem', fontFamily: 'var(--font-main)', fontWeight: 600,
                  }}
                >
                  {debate.is_featured ? 'Sí' : 'No'}
                </button>
              </div>

              {/* Fecha */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {new Date(debate.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setModal(debate)}
                  title="Editar"
                  style={{
                    border: '1px solid var(--border-color)', borderRadius: 6, background: 'transparent',
                    cursor: 'pointer', padding: '0.3rem 0.5rem', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(debate.id)}
                  title="Eliminar"
                  style={{
                    border: '1px solid #FCA5A5', borderRadius: 6, background: 'transparent',
                    cursor: 'pointer', padding: '0.3rem 0.5rem', color: '#EF4444',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Modales */}
      <AnimatePresence>
        {modal !== null && (
          <DebateModal
            debate={modal === 'create' ? undefined : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
        {confirmDelete && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'relative', background: 'var(--bg-white)', borderRadius: 12, padding: '1.75rem',
                maxWidth: 380, width: '100%', border: '1px solid var(--border-color)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                ¿Eliminar debate?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
                Esta acción eliminará el debate y todas sus respuestas. No se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmDelete(null)} style={{
                  padding: '0.55rem 1.1rem', borderRadius: 7, border: '1px solid var(--border-color)',
                  background: 'transparent', fontFamily: 'var(--font-main)', fontSize: '0.85rem',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                <button onClick={() => handleDelete(confirmDelete)} style={{
                  padding: '0.55rem 1.1rem', borderRadius: 7, border: 'none',
                  background: '#EF4444', fontFamily: 'var(--font-main)', fontSize: '0.85rem',
                  fontWeight: 700, color: '#fff', cursor: 'pointer',
                }}>
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
