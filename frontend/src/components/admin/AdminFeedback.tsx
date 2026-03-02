'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import { AdminStatBar } from '@/components/admin/shared/AdminStatBar';
import { AdminEmptyState } from '@/components/admin/shared/AdminEmptyState';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useWindowSize } from '@/hooks/useWindowSize';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function impactoColor(n: number): string {
  if (n >= 8) return 'var(--accent)';
  if (n >= 5) return '#F59E0B';
  return '#EF4444';
}

function impactoLabel(n: number): string {
  if (n >= 8) return 'Alto';
  if (n >= 5) return 'Medio';
  return 'Bajo';
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
  progress?: number;
  delay: number;
}

function KpiCard({ icon, label, value, subLabel, progress, delay }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        padding: '1.25rem',
        background: 'var(--bg-white)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'var(--accent-light)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.25rem',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {progress !== undefined && (
        <div
          style={{
            height: 4,
            borderRadius: 99,
            background: 'var(--bg-neutral)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 99,
            }}
          />
        </div>
      )}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
        {label}
      </div>
      {subLabel && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subLabel}</div>
      )}
    </motion.div>
  );
}

interface ChipProps {
  label: string;
  highlighted?: boolean;
  rightContent?: React.ReactNode;
}

function Chip({ label, highlighted = false, rightContent }: ChipProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.78rem',
        fontWeight: 500,
        padding: '0.25rem 0.65rem',
        borderRadius: 50,
        border: '1px solid var(--border-color)',
        color: 'var(--text-main)',
        background: highlighted ? 'var(--bg-neutral)' : 'var(--bg-white)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {rightContent}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── FeedbackCard (mobile) ─────────────────────────────────────────────────────

interface FeedbackEntry {
  id: string;
  user_name: string;
  user_email: string;
  rol: string;
  impacto: number;
  desgastes: string[];
  herramientas: string[];
  created_at: string;
  solucion_actual: string;
  vision_ia: string;
  resultados_deseados: string[];
}

interface FeedbackCardProps {
  entry: FeedbackEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

function FeedbackCard({ entry, index, isExpanded, onToggle, isLast }: FeedbackCardProps) {
  return (
    <div style={{ borderBottom: isLast && !isExpanded ? 'none' : '1px solid var(--border-color)' }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04 }}
        onClick={onToggle}
        style={{
          padding: '0.9rem 1rem',
          cursor: 'pointer',
          background: isExpanded ? 'var(--bg-neutral)' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}
      >
        {/* Row 1: name + impacto + expand icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.user_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.user_email}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: impactoColor(entry.impacto), lineHeight: 1 }}>{entry.impacto}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: impactoColor(entry.impacto), opacity: 0.8 }}>{impactoLabel(entry.impacto)}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </div>
        {/* Row 2: rol + fecha */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{entry.rol}</span>
          <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{formatDate(entry.created_at)}</span>
        </div>
        {/* Row 3: desgastes chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {entry.desgastes.slice(0, 3).map((d) => (
            <span key={d} style={{ fontSize: '0.68rem', padding: '0.12rem 0.4rem', borderRadius: 50, border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-white)', whiteSpace: 'nowrap' }}>
              {d}
            </span>
          ))}
          {entry.desgastes.length > 3 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>+{entry.desgastes.length - 3} más</span>
          )}
        </div>
        {/* Row 4: herramientas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {entry.herramientas.slice(0, 3).map((h) => (
            <span key={h} style={{ fontSize: '0.68rem', padding: '0.12rem 0.4rem', borderRadius: 50, border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-neutral)', whiteSpace: 'nowrap' }}>
              {h}
            </span>
          ))}
          {entry.herramientas.length > 3 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>+{entry.herramientas.length - 3} más</span>
          )}
        </div>
      </motion.div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key={`card-detail-${entry.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0.9rem 1rem', background: 'var(--bg-neutral)', borderTop: '1px solid var(--border-color)', borderBottom: isLast ? 'none' : '1px solid var(--border-color)' }}>
              {/* Solución + Visión */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.2rem' }}>Solución actual</p>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>{entry.solucion_actual}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.2rem' }}>Visión con IA</p>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>{entry.vision_ia}</p>
                </div>
              </div>
              {/* Resultados deseados */}
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.4rem' }}>Resultados deseados</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {entry.resultados_deseados.map((r) => (
                    <span key={r} style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.22rem 0.6rem', borderRadius: 50, border: '1px solid #8B5CF6', color: '#8B5CF6', background: '#F5F3FF' }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedbackCardSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ height: 13, width: '50%', borderRadius: 4, background: 'var(--bg-neutral)', marginBottom: 5 }} />
              <div style={{ height: 10, width: '65%', borderRadius: 4, background: 'var(--bg-neutral)' }} />
            </div>
            <div style={{ height: 20, width: 44, borderRadius: 4, background: 'var(--bg-neutral)' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[...Array(3)].map((_, j) => (
              <div key={j} style={{ height: 20, width: 60, borderRadius: 50, background: 'var(--bg-neutral)' }} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function AdminFeedback() {
  const { stats, entries, loading } = useAdminFeedback();
  const { isMobile } = useWindowSize();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterImpacto, setFilterImpacto] = useState<'todos' | 'alto' | 'medio' | 'bajo'>('todos');

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalUsers = stats?.total ?? 0;
  const participacionPct = totalUsers > 0 ? Math.round((totalUsers / 147) * 100) : 0;
  const impactoPct = stats ? Math.round((stats.promedio_impacto / 10) * 100) : 0;

  const rolesDisponibles = Array.from(new Set(entries.map((e) => e.rol))).sort();

  const filteredEntries = entries.filter((e) => {
    const matchRol = filterRol === 'todos' || e.rol === filterRol;
    const matchImpacto =
      filterImpacto === 'todos' ||
      (filterImpacto === 'alto' && e.impacto >= 8) ||
      (filterImpacto === 'medio' && e.impacto >= 5 && e.impacto <= 7) ||
      (filterImpacto === 'bajo' && e.impacto <= 4);
    return matchRol && matchImpacto;
  });

  const topRol = stats?.por_rol[0]?.rol ?? '—';
  const topDesgaste = stats?.top_desgastes[0]?.label ?? '—';
  const topHerramienta = stats?.top_herramientas[0]?.label ?? '—';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-4 md:p-8"
    >
      {/* Outer layout: main column + sticky sidebar */}
      <div
        className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-start"
      >
        {/* ── Left main column ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '0.25rem',
                  margin: 0,
                }}
              >
                Feedback
              </h1>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  margin: '0.25rem 0 0',
                }}
              >
                Análisis cualitativo y cuantitativo de respuestas
              </p>
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'var(--accent-light)',
                padding: '0.3rem 0.75rem',
                borderRadius: 50,
                flexShrink: 0,
              }}
            >
              {stats?.total ?? 0} respuestas
            </span>
          </div>

          {/* KPI Cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6"
          >
            <KpiCard
              icon={<MessageSquare size={18} />}
              label="Total feedbacks"
              value={String(stats?.total ?? 0)}
              delay={0}
            />
            <KpiCard
              icon={<BarChart3 size={18} />}
              label="Impacto promedio"
              value={`${stats?.promedio_impacto ?? 0}/10`}
              progress={impactoPct}
              delay={0.05}
            />
            <KpiCard
              icon={<Users size={18} />}
              label="Participación"
              value={`${participacionPct}%`}
              subLabel={`${stats?.total ?? 0} de 147 usuarios`}
              delay={0.1}
            />
          </div>

          {/* Top desgastes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '1.25rem',
              marginBottom: '1.5rem',
              background: 'var(--bg-white)',
            }}
          >
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: '0 0 1rem',
              }}
            >
              ¿Qué les desgasta más?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(stats?.top_desgastes ?? []).map((item, i) => (
                <AdminStatBar
                  key={item.label}
                  label={item.label}
                  count={item.count}
                  total={stats?.total ?? 0}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </motion.div>

          {/* Grid: Por rol + Top herramientas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          >
            {/* Por rol */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '1.25rem',
                background: 'var(--bg-white)',
              }}
            >
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: '0 0 1rem',
                }}
              >
                Por rol
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(stats?.por_rol ?? []).map((item) => (
                  <Chip
                    key={item.rol}
                    label={item.rol}
                    rightContent={
                      <strong style={{ color: 'var(--accent)', marginLeft: '0.15rem' }}>
                        {item.count}
                      </strong>
                    }
                  />
                ))}
              </div>
            </div>

            {/* Top herramientas */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '1.25rem',
                background: 'var(--bg-white)',
              }}
            >
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: '0 0 1rem',
                }}
              >
                Herramientas más usadas
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(stats?.top_herramientas ?? []).map((item, i) => (
                  <Chip
                    key={item.label}
                    label={item.label}
                    highlighted={i < 3}
                    rightContent={
                      <strong style={{ color: 'var(--text-muted)', marginLeft: '0.15rem' }}>
                        {item.count}
                      </strong>
                    }
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Resultados deseados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '1.25rem',
              marginBottom: '1.5rem',
              background: 'var(--bg-white)',
            }}
          >
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: '0 0 1rem',
              }}
            >
              Resultados que esperan obtener
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(stats?.top_resultados ?? []).map((item, i) => (
                <AdminStatBar
                  key={item.label}
                  label={item.label}
                  count={item.count}
                  total={stats?.total ?? 0}
                  color="#8B5CF6"
                  delay={i * 0.05}
                />
              ))}
            </div>
          </motion.div>

          {/* Tabla de respuestas individuales */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--bg-white)',
            }}
          >
            {/* Table header + filters */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                }}
              >
                Respuestas individuales
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: 400,
                    color: 'var(--text-muted)',
                  }}
                >
                  ({filteredEntries.length})
                </span>
              </h2>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* Role select */}
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    background: 'var(--bg-white)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="todos">Todos los roles</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>

                {/* Impacto range buttons */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {(
                    [
                      { key: 'todos', label: 'Todos' },
                      { key: 'alto', label: 'Alto 8-10' },
                      { key: 'medio', label: 'Medio 5-7' },
                      { key: 'bajo', label: 'Bajo 1-4' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilterImpacto(key)}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        padding: '0.28rem 0.6rem',
                        borderRadius: 50,
                        border:
                          filterImpacto === key
                            ? '1px solid var(--accent)'
                            : '1px solid var(--border-color)',
                        color: filterImpacto === key ? 'var(--accent)' : 'var(--text-secondary)',
                        background:
                          filterImpacto === key ? 'var(--accent-light)' : 'var(--bg-white)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table / Card — dual mode */}
            {isMobile ? (
              /* ── CARD VIEW (< 768px) ── */
              loading ? (
                <FeedbackCardSkeleton />
              ) : filteredEntries.length === 0 ? (
                <AdminEmptyState icon={MessageSquare} title="Sin resultados" description="No hay respuestas que coincidan con los filtros seleccionados." />
              ) : (
                filteredEntries.map((entry, i) => (
                  <FeedbackCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    isExpanded={expandedId === entry.id}
                    onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    isLast={i === filteredEntries.length - 1}
                  />
                ))
              )
            ) : (
              /* ── TABLE VIEW (≥ 768px) ── */
              <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 0.55fr 1.6fr 1.4fr 0.75fr 0.3fr',
                padding: '0.55rem 1.25rem',
                background: 'var(--bg-neutral)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: 820,
              }}
            >
              <span>Usuario</span>
              <span>Rol</span>
              <span>Impacto</span>
              <span>Desgastes</span>
              <span>Herramientas</span>
              <span>Fecha</span>
              <span />
            </div>

            {/* Rows */}
            {filteredEntries.length === 0 ? (
              <AdminEmptyState
                icon={MessageSquare}
                title="Sin resultados"
                description="No hay respuestas que coincidan con los filtros seleccionados."
              />
            ) : (
              filteredEntries.map((entry, i) => {
                const isExpanded = expandedId === entry.id;
                const isLast = i === filteredEntries.length - 1;

                return (
                  <div key={entry.id}>
                    {/* Main row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 1fr 0.55fr 1.6fr 1.4fr 0.75fr 0.3fr',
                        padding: '0.75rem 1.25rem',
                        borderBottom:
                          !isExpanded && !isLast ? '1px solid var(--border-color)' : isExpanded ? '1px solid var(--border-color)' : 'none',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        background: isExpanded ? 'var(--bg-neutral)' : 'transparent',
                        minWidth: 820,
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded)
                          (e.currentTarget as HTMLDivElement).style.background =
                            'var(--bg-neutral)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded)
                          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      }}
                    >
                      {/* Usuario */}
                      <div>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                          }}
                        >
                          {entry.user_name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.1rem',
                          }}
                        >
                          {entry.user_email}
                        </div>
                      </div>

                      {/* Rol */}
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {entry.rol}
                      </span>

                      {/* Impacto */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: impactoColor(entry.impacto),
                            lineHeight: 1,
                          }}
                        >
                          {entry.impacto}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: impactoColor(entry.impacto),
                            opacity: 0.75,
                          }}
                        >
                          {impactoLabel(entry.impacto)}
                        </span>
                      </div>

                      {/* Desgastes */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.3rem',
                          alignItems: 'center',
                        }}
                      >
                        {entry.desgastes.slice(0, 2).map((d) => (
                          <span
                            key={d}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 50,
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-secondary)',
                              background: 'var(--bg-white)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {d}
                          </span>
                        ))}
                        {entry.desgastes.length > 2 && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              fontWeight: 500,
                            }}
                          >
                            +{entry.desgastes.length - 2} más
                          </span>
                        )}
                      </div>

                      {/* Herramientas */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.3rem',
                          alignItems: 'center',
                        }}
                      >
                        {entry.herramientas.slice(0, 2).map((h) => (
                          <span
                            key={h}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 50,
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-secondary)',
                              background: 'var(--bg-neutral)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </span>
                        ))}
                        {entry.herramientas.length > 2 && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              fontWeight: 500,
                            }}
                          >
                            +{entry.herramientas.length - 2} más
                          </span>
                        )}
                      </div>

                      {/* Fecha */}
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {formatDate(entry.created_at)}
                      </span>

                      {/* Expand icon */}
                      <span
                        style={{
                          color: 'var(--text-muted)',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </span>
                    </div>

                    {/* Expanded detail row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key={`detail-${entry.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              padding: '1rem 1.25rem',
                              background: 'var(--bg-neutral)',
                              borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '0.75rem',
                              }}
                              className="!grid-cols-1 md:!grid-cols-2"
                            >
                              {/* Solución actual */}
                              <div>
                                <p
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    margin: '0 0 0.25rem',
                                  }}
                                >
                                  Solución actual
                                </p>
                                <p
                                  style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-main)',
                                    margin: 0,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {entry.solucion_actual}
                                </p>
                              </div>

                              {/* Visión con IA */}
                              <div>
                                <p
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    margin: '0 0 0.25rem',
                                  }}
                                >
                                  Visión con IA
                                </p>
                                <p
                                  style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-main)',
                                    margin: 0,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {entry.vision_ia}
                                </p>
                              </div>
                            </div>

                            {/* Resultados deseados completos */}
                            <div>
                              <p
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: 'var(--text-muted)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  margin: '0 0 0.5rem',
                                }}
                              >
                                Resultados deseados
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {entry.resultados_deseados.map((r) => (
                                  <span
                                    key={r}
                                    style={{
                                      fontSize: '0.78rem',
                                      fontWeight: 500,
                                      padding: '0.25rem 0.65rem',
                                      borderRadius: 50,
                                      border: '1px solid #8B5CF6',
                                      color: '#8B5CF6',
                                      background: '#F5F3FF',
                                    }}
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
            </div>
            )}
          </motion.div>
        </div>

        {/* ── Right sticky sidebar ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full lg:w-[260px] lg:flex-shrink-0 lg:sticky lg:top-8 lg:self-start"
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: '#0F0F0F',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Lightbulb size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span
              style={{
                fontSize: '0.83rem',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Insights rápidos
            </span>
          </div>

          {/* Impacto promedio */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-white)',
            }}
          >
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 0.4rem',
              }}
            >
              Impacto promedio
            </p>
            <p
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--accent)',
                margin: '0 0 0.5rem',
                lineHeight: 1,
              }}
            >
              {stats?.promedio_impacto ?? 0}
              <span
                style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}
              >
                /10
              </span>
            </p>
            <div
              style={{
                height: 5,
                borderRadius: 99,
                background: 'var(--bg-neutral)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${impactoPct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 99,
                }}
              />
            </div>
          </div>

          {/* Perfil más frecuente */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-white)',
            }}
          >
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 0.3rem',
              }}
            >
              Perfil más frecuente
            </p>
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
              }}
            >
              {topRol}
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: '0.1rem 0 0',
              }}
            >
              {stats?.por_rol[0]?.count ?? 0} respuestas
            </p>
          </div>

          {/* Mayor dolor */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-white)',
            }}
          >
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 0.3rem',
              }}
            >
              Mayor dolor
            </p>
            <p
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {topDesgaste}
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: '0.1rem 0 0',
              }}
            >
              {stats?.top_desgastes[0]?.count ?? 0} menciones
            </p>
          </div>

          {/* Herramienta líder */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-white)',
            }}
          >
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 0.3rem',
              }}
            >
              Herramienta líder
            </p>
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
              }}
            >
              {topHerramienta}
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: '0.1rem 0 0',
              }}
            >
              {stats?.top_herramientas[0]?.count ?? 0} usuarios la usan
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
