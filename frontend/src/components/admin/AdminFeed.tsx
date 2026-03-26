'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Heart, MessageSquare } from 'lucide-react';
import { useAdminFeed } from '@/hooks/useAdminFeed';

export function AdminFeed() {
  const { stats, posts, loading, deletePost } = useAdminFeed();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deletePost(id);
    setConfirmDelete(null);
  };

  const statCards = [
    { label: 'Total posts', value: stats?.total ?? 0, color: 'var(--accent)' },
    { label: 'Publicados', value: stats?.published ?? 0, color: '#16a34a' },
    { label: 'Fijados', value: stats?.pinned ?? 0, color: '#B87700' },
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
            Feed
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
            Modera los posts publicados por los miembros
          </p>
        </div>
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
          display: 'grid', gridTemplateColumns: '1fr 160px 80px 80px 80px',
          padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-neutral)',
        }}>
          {['Contenido / Autor', 'Email', 'Likes', 'Comentarios', 'Acciones'].map(h => (
            <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Cargando posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No hay posts en el feed aún.
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 80px 80px 80px',
                padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-color)',
                alignItems: 'center',
              }}
            >
              {/* Contenido + autor */}
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.87rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  {post.content.length > 80 ? post.content.slice(0, 80) + '…' : post.content}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  {post.author_name} · {new Date(post.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: '2-digit' })}
                </span>
              </div>

              {/* Email */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {post.author_email}
              </div>

              {/* Likes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Heart size={13} />
                {post.likes_count}
              </div>

              {/* Comentarios */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <MessageSquare size={13} />
                {post.comments_count}
              </div>

              {/* Acciones */}
              <div>
                <button
                  onClick={() => setConfirmDelete(post.id)}
                  title="Eliminar post"
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

      {/* Modal confirmación */}
      <AnimatePresence>
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
                ¿Eliminar post?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
                Esta acción eliminará el post y todos sus comentarios. No se puede deshacer.
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
