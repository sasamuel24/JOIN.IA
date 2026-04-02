'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useCommunityResources } from '@/hooks/useCommunity';
import type { CommunityResourceUI } from '@/services/communityService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatDate(iso: string | null): { weekday: string; date: string; time: string } | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return {
      weekday: WEEKDAYS[d.getDay()],
      date: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      time: `${h12}:${minutes} ${ampm}`,
    };
  } catch {
    return null;
  }
}

function parseTags(category: string | null): string[] {
  if (!category) return [];
  return category
    .split(/[,·•|\/]/)
    .map(t => t.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------

interface RecursoCardProps {
  recurso: CommunityResourceUI;
  sessionNumber: number;
}

function RecursoCard({ recurso, sessionNumber }: RecursoCardProps) {
  const dateInfo = formatDate(recurso.published_at);
  const tags = parseTags(recurso.category);
  const hasLink = Boolean(recurso.resource_url);

  function handleClick() {
    if (recurso.resource_url) {
      window.open(recurso.resource_url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: hasLink ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
      }}
      whileHover={hasLink ? { y: -4 } : {}}
      onMouseEnter={e => {
        if (!hasLink) return;
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,212,170,0.15)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* ── Thumbnail area ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
        {recurso.thumbnail_url ? (
          <img
            src={recurso.thumbnail_url}
            alt={recurso.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-main)' }}>
              #{sessionNumber}
            </span>
          </div>
        )}


        {/* Play button — only for video type */}
        {recurso.type === 'video' && hasLink && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={22} fill="#fff" color="#fff" style={{ marginLeft: '3px' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Date & tools bar ── */}
      {(dateInfo || tags.length > 0) && (
        <div
          style={{
            borderBottom: '1px solid var(--border-color)',
            padding: '10px 16px',
            background: 'var(--bg-white)',
          }}
        >
          {dateInfo && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: tags.length > 0 ? '6px' : '0' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Día:</span>{' '}
              {dateInfo.weekday}, {dateInfo.date}
              {'  '}
              <span style={{ color: 'var(--border-color)' }}>|</span>
              {'  '}
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Hora:</span>{' '}
              {dateInfo.time} (COL) 🇨🇴
            </p>
          )}
          {tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Tools que usaremos:
              </span>
              {tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.72rem',
                    background: 'var(--bg-neutral)',
                    color: 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Card body ── */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {/* Number + Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            #{sessionNumber}
          </span>
          {recurso.author_name && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {recurso.author_name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: hasLink ? 'var(--accent)' : 'var(--text-main)',
            lineHeight: '1.35',
            margin: 0,
            fontFamily: 'var(--font-main)',
          }}
        >
          {recurso.title}
        </h3>

        {/* Description */}
        {recurso.description && (
          <p
            style={{
              fontSize: '0.83rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {recurso.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--accent)', margin: '4px 0 0', fontWeight: 500 }}>
            {tags.join(' · ')}
          </p>
        )}
      </div>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--bg-neutral)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '12px', width: '40%', background: 'var(--bg-neutral)', borderRadius: '6px' }} />
        <div style={{ height: '16px', width: '90%', background: 'var(--bg-neutral)', borderRadius: '6px' }} />
        <div style={{ height: '16px', width: '70%', background: 'var(--bg-neutral)', borderRadius: '6px' }} />
        <div style={{ height: '12px', width: '80%', background: 'var(--bg-neutral)', borderRadius: '6px' }} />
        <div style={{ height: '12px', width: '60%', background: 'var(--bg-neutral)', borderRadius: '6px' }} />
        <div style={{ height: '12px', width: '35%', background: 'var(--bg-neutral)', borderRadius: '6px', marginTop: '4px' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TabRecursos() {
  const { resources, loading, error } = useCommunityResources();

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 0',
            gap: '8px',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: '#e57373' }}>No se pudieron cargar los recursos.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div>
        <Header />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 0',
            gap: '8px',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Aún no hay sesiones publicadas.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Vuelve pronto — estamos preparando contenido para ti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={gridStyle}>
        {resources.map((recurso, index) => {
          const sessionNumber = recurso.sort_order ?? resources.length - index;
          return (
            <RecursoCard
              key={recurso.id}
              recurso={recurso}
              sessionNumber={sessionNumber}
            />
          );
        })}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: '0 0 6px',
          fontFamily: 'var(--font-main)',
        }}
      >
        Sesiones anteriores
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
        Todas nuestras clases pasadas. Haz clic en cualquiera para ver la grabación en YouTube.
      </p>
    </div>
  );
}
