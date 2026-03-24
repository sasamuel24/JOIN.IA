'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Trash2, Pencil, X, ExternalLink, BookOpen, Layout, Video, FileText, Wrench } from 'lucide-react';
import { useAdminRecursos } from '@/hooks/useAdminRecursos';
import type { AdminResourceItem } from '@/types/admin';

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS = [
  { value: 'guide', label: 'Guía', Icon: BookOpen },
  { value: 'template', label: 'Plantilla', Icon: Layout },
  { value: 'video', label: 'Video', Icon: Video },
  { value: 'article', label: 'Artículo', Icon: FileText },
  { value: 'tool', label: 'Herramienta', Icon: Wrench },
];

const CATEGORIAS = ['Productividad', 'Clínico', 'Formación', 'IA', 'Recursos', 'Tecnología', 'Otro'];

function getTipoLabel(tipo: string) {
  return TIPOS.find(t => t.value === tipo)?.label ?? tipo;
}

// ─── Modal crear / editar ─────────────────────────────────────────────────────

interface RecursoModalProps {
  recurso?: AdminResourceItem;
  onClose: () => void;
  onSave: (data: {
    title: string; description: string; resource_type: string;
    category: string; resource_url: string; thumbnail_url: string;
    author_name: string; is_featured: boolean; is_published: boolean;
  }) => Promise<void>;
}

function RecursoModal({ recurso, onClose, onSave }: RecursoModalProps) {
  const [title, setTitle] = useState(recurso?.title ?? '');
  const [description, setDescription] = useState(recurso?.description ?? '');
  const [resourceType, setResourceType] = useState(recurso?.resource_type ?? 'guide');
  const [category, setCategory] = useState(recurso?.category ?? 'Productividad');
  const [resourceUrl, setResourceUrl] = useState(recurso?.resource_url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(recurso?.thumbnail_url ?? '');
  const [authorName, setAuthorName] = useState(recurso?.author_name ?? 'JOIN.IA');
  const [isFeatured, setIsFeatured] = useState(recurso?.is_featured ?? false);
  const [isPublished, setIsPublished] = useState(recurso?.is_published ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErr('Título y descripción son obligatorios');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await onSave({
        title: title.trim(), description: description.trim(), resource_type: resourceType,
        category, resource_url: resourceUrl.trim(), thumbnail_url: thumbnailUrl.trim(),
        author_name: authorName.trim(), is_featured: isFeatured, is_published: isPublished,
      });
      onClose();
    } catch {
      setErr('Error al guardar el recurso');
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: 7, boxSizing: 'border-box',
    border: '1px solid var(--border-color)', background: 'var(--bg-neutral)',
    fontFamily: 'var(--font-main)', fontSize: '0.88rem', color: 'var(--text-main)', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
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
          padding: '2rem', width: '100%', maxWidth: 560,
          border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          margin: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
            {recurso ? 'Editar recurso' : 'Nuevo recurso'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del recurso..." style={fieldStyle} />
          </div>

          <div>
            <label style={labelStyle}>Descripción *</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe brevemente el recurso..." rows={3}
              style={{ ...fieldStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={resourceType} onChange={e => setResourceType(e.target.value)} style={fieldStyle}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={fieldStyle}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>URL del recurso</label>
            <input value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} placeholder="https://..." style={fieldStyle} />
          </div>

          <div>
            <label style={labelStyle}>URL de imagen (opcional)</label>
            <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://imagen.com/thumbnail.jpg" style={fieldStyle} />
          </div>

          <div>
            <label style={labelStyle}>Autor</label>
            <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="JOIN.IA" style={fieldStyle} />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Destacar</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Publicar (visible en comunidad)</span>
            </label>
          </div>

          {err && <p style={{ fontSize: '0.82rem', color: '#EF4444', margin: 0 }}>{err}</p>}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
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
              {saving ? 'Guardando...' : recurso ? 'Guardar cambios' : 'Crear recurso'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function AdminRecursos() {
  const { stats, recursos, loading, createRecurso, updateRecurso, deleteRecurso, toggleFeatured } = useAdminRecursos();
  const [modal, setModal] = useState<'create' | AdminResourceItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSave = async (data: {
    title: string; description: string; resource_type: string;
    category: string; resource_url: string; thumbnail_url: string;
    author_name: string; is_featured: boolean; is_published: boolean;
  }) => {
    if (modal === 'create') {
      await createRecurso(data);
    } else if (modal && typeof modal === 'object') {
      await updateRecurso(modal.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRecurso(id);
    setConfirmDelete(null);
  };

  const statCards = [
    { label: 'Total recursos', value: stats?.total ?? 0, color: 'var(--accent)' },
    { label: 'Destacados', value: stats?.featured ?? 0, color: '#B87700' },
    { label: 'Publicados', value: stats?.published ?? 0, color: 'var(--text-secondary)' },
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
            Recursos
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
            Gestiona guías, plantillas y materiales de la comunidad
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
          Nuevo recurso
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
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 80px 90px',
          padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-neutral)',
        }}>
          {['Título / Tipo', 'Categoría', 'Publicado', 'Destacado', 'Fecha', 'Acciones'].map(h => (
            <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Cargando recursos...
          </div>
        ) : recursos.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No hay recursos aún. Crea el primero con el botón de arriba.
          </div>
        ) : (
          recursos.map((recurso, i) => (
            <motion.div
              key={recurso.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 80px 90px',
                padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-color)',
                alignItems: 'center',
              }}
            >
              {/* Título + tipo */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {recurso.is_featured && <Star size={13} fill="var(--accent)" color="var(--accent)" />}
                  <span style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-main)' }}>
                    {recurso.title.length > 50 ? recurso.title.slice(0, 50) + '…' : recurso.title}
                  </span>
                  {recurso.resource_url && (
                    <a href={recurso.resource_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', lineHeight: 1 }}>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <span style={{
                  display: 'inline-block', marginTop: '0.2rem', fontSize: '0.72rem', padding: '0.15rem 0.5rem',
                  borderRadius: 4, background: 'var(--bg-neutral)', color: 'var(--text-muted)',
                }}>
                  {getTipoLabel(recurso.resource_type)}
                </span>
              </div>

              {/* Categoría */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {recurso.category ?? '—'}
              </div>

              {/* Publicado */}
              <div>
                <span style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 4, fontWeight: 600,
                  background: recurso.is_published ? 'var(--accent-light)' : 'var(--bg-neutral)',
                  color: recurso.is_published ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {recurso.is_published ? 'Sí' : 'No'}
                </span>
              </div>

              {/* Toggle destacado */}
              <div>
                <button
                  onClick={() => toggleFeatured(recurso.id)}
                  title={recurso.is_featured ? 'Quitar destacado' : 'Destacar'}
                  style={{
                    border: 'none', borderRadius: 5, cursor: 'pointer', padding: '0.3rem 0.5rem',
                    background: recurso.is_featured ? 'var(--accent-light)' : 'var(--bg-neutral)',
                    color: recurso.is_featured ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '0.75rem', fontFamily: 'var(--font-main)', fontWeight: 600,
                  }}
                >
                  {recurso.is_featured ? 'Sí' : 'No'}
                </button>
              </div>

              {/* Fecha */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {new Date(recurso.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setModal(recurso)}
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
                  onClick={() => setConfirmDelete(recurso.id)}
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
          <RecursoModal
            recurso={modal === 'create' ? undefined : modal}
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
                ¿Eliminar recurso?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
                Esta acción eliminará el recurso permanentemente. No se puede deshacer.
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
