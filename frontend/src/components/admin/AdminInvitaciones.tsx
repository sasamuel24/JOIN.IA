'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Mail, Users } from 'lucide-react';
import type { AdminInvitacion, AdminInvitacionesStats } from '@/types/admin';
import { AdminEmptyState } from '@/components/admin/shared/AdminEmptyState';
import { useAdminInvitaciones } from '@/hooks/useAdminInvitaciones';
import { useWindowSize } from '@/hooks/useWindowSize';

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AdminInvitacion['status'], { color: string; background: string }> = {
  pendiente: { color: '#B87700', background: '#FFF7E0' },
  unido: { color: 'var(--accent)', background: 'var(--accent-light)' },
  expirado: { color: '#888888', background: 'var(--bg-neutral)' },
};

const STATUS_LABELS: Record<AdminInvitacion['status'], string> = {
  pendiente: 'Pendiente',
  unido: 'Unido',
  expirado: 'Expirado',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getRelativeLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  d.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - d.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ─── FunnelCard ────────────────────────────────────────────────────────────────

interface FunnelCardProps {
  label: string;
  value: number;
  total: number;
  color: string;
  delay: number;
}

function FunnelCard({ label, value, total, color, delay }: FunnelCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        flex: 1,
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        padding: '1rem',
        textAlign: 'center',
        background: 'var(--bg-white)',
      }}
    >
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color }}>{value}</div>
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginTop: '0.15rem',
        }}
      >
        {label}
      </div>
      {total > 0 && value !== total && (
        <div
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
          }}
        >
          {pct}% del total
        </div>
      )}
    </motion.div>
  );
}

// ─── InvitacionStatusBadge ─────────────────────────────────────────────────────

function InvitacionStatusBadge({ status }: { status: AdminInvitacion['status'] }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        color: style.color,
        background: style.background,
        padding: '0.15rem 0.55rem',
        borderRadius: 50,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── TableSkeleton ─────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr 1.2fr 0.7fr 0.8fr 0.8fr',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {[...Array(6)].map((_, j) => (
            <div
              key={j}
              style={{
                height: 14,
                borderRadius: 4,
                background: 'var(--bg-neutral)',
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function SectionCard({ title, delay, children, style: extraStyle }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        background: 'var(--bg-white)',
        overflow: 'hidden',
        ...extraStyle,
      }}
    >
      <div
        style={{
          padding: '0.9rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <h3
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Card skeletons (mobile) ──────────────────────────────────────────────────

function InviterCardSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: 13, width: '40%', borderRadius: 4, background: 'var(--bg-neutral)' }} />
            <div style={{ height: 13, width: 52, borderRadius: 4, background: 'var(--bg-neutral)' }} />
          </div>
          <div style={{ height: 11, width: '65%', borderRadius: 4, background: 'var(--bg-neutral)' }} />
          <div style={{ height: 11, width: '50%', borderRadius: 4, background: 'var(--bg-neutral)' }} />
        </div>
      ))}
    </>
  );
}

function InvCardSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: 13, width: '45%', borderRadius: 4, background: 'var(--bg-neutral)' }} />
            <div style={{ height: 18, width: 64, borderRadius: 50, background: 'var(--bg-neutral)' }} />
          </div>
          <div style={{ height: 11, width: '70%', borderRadius: 4, background: 'var(--bg-neutral)' }} />
          <div style={{ height: 11, width: '55%', borderRadius: 4, background: 'var(--bg-neutral)' }} />
        </div>
      ))}
    </>
  );
}

// ─── InviterCard (mobile) ─────────────────────────────────────────────────────

interface InviterCardProps {
  inviter: AdminInvitacionesStats['top_inviters'][number];
  index: number;
}

function InviterCard({ inviter, index }: InviterCardProps) {
  const tasa = inviter.count > 0 ? ((inviter.converted / inviter.count) * 100).toFixed(0) : '0';
  const isFirst = index === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        background: isFirst ? 'rgba(0,212,170,0.03)' : 'transparent',
      }}
    >
      {/* Row 1: rank + name + tasa */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
          <span style={{ fontWeight: 700, color: isFirst ? '#F59E0B' : 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
            {isFirst ? '🥇' : `#${index + 1}`}
          </span>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
            {inviter.name.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {inviter.name}
          </span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)', flexShrink: 0 }}>{tasa}%</span>
      </div>
      {/* Row 2: email */}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {inviter.email}
      </span>
      {/* Row 3: stats */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{inviter.count}</span> enviadas
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{inviter.converted}</span> convertidas
        </span>
      </div>
    </motion.div>
  );
}

// ─── InvitacionCard (mobile) ──────────────────────────────────────────────────

interface InvitacionCardProps {
  inv: AdminInvitacion;
  index: number;
}

function InvitacionCard({ inv, index }: InvitacionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      style={{
        padding: '0.9rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
      }}
    >
      {/* Row 1: name + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {inv.invited_name ?? '—'}
        </span>
        <InvitacionStatusBadge status={inv.status} />
      </div>
      {/* Row 2: invited email */}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {inv.invited_email}
      </span>
      {/* Row 3: invitador */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>Invitado por:</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.inviter_name}</span>
      </div>
      {/* Row 4: dates */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.63rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Enviado</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formatDate(inv.invited_at)}</div>
        </div>
        {inv.joined_at && (
          <div>
            <div style={{ fontSize: '0.63rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unido</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{formatDate(inv.joined_at)}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Top Inviters Table ────────────────────────────────────────────────────────

interface TopInvitersProps {
  inviters: AdminInvitacionesStats['top_inviters'];
  delay: number;
}

function TopInviters({ inviters, delay }: TopInvitersProps) {
  const { isMobile } = useWindowSize();
  return (
    <SectionCard title="Top Inviters — Ranking de embajadores" delay={delay} style={{ marginBottom: '1.5rem' }}>
      {isMobile ? (
        /* ── CARD VIEW (< 768px) ── */
        inviters.length === 0 ? (
          <AdminEmptyState icon={Trophy} title="Sin datos" description="No hay inviters registrados aún." />
        ) : (
          inviters.map((inviter, i) => <InviterCard key={inviter.email} inviter={inviter} index={i} />)
        )
      ) : (
        /* ── TABLE VIEW (≥ 768px) ── */
        <div style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5rem 1fr 1.4fr 6rem 7rem 5rem',
              padding: '0.55rem 1.25rem',
              background: 'var(--bg-neutral)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              gap: '0.75rem',
              minWidth: 560,
            }}
          >
            <span>#</span>
            <span>Usuario</span>
            <span>Email</span>
            <span style={{ textAlign: 'center' }}>Enviadas</span>
            <span style={{ textAlign: 'center' }}>Convertidas</span>
            <span style={{ textAlign: 'right' }}>Tasa</span>
          </div>

          {/* Rows */}
          <div style={{ minWidth: 560 }}>
            {inviters.map((inviter, i) => {
              const tasa =
                inviter.count > 0
                  ? ((inviter.converted / inviter.count) * 100).toFixed(0)
                  : '0';
              const isFirst = i === 0;
              return (
                <div
                  key={inviter.email}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5rem 1fr 1.4fr 6rem 7rem 5rem',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.84rem',
                    borderBottom: i < inviters.length - 1 ? '1px solid var(--border-color)' : 'none',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: isFirst ? 'rgba(0,212,170,0.03)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600, color: isFirst ? '#F59E0B' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {isFirst && <Trophy size={14} color="#F59E0B" />}
                    {!isFirst && <span>{i + 1}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      {inviter.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inviter.name}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inviter.email}
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600, textAlign: 'center' }}>{inviter.count}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, textAlign: 'center' }}>{inviter.converted}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right', fontWeight: 500 }}>{tasa}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineProps {
  invitaciones: AdminInvitacion[];
  delay: number;
}

function Timeline({ invitaciones, delay }: TimelineProps) {
  // Ordenar por fecha descendente y tomar las primeras 8
  const sorted = useMemo(() => {
    return [...invitaciones]
      .sort((a, b) => new Date(b.invited_at).getTime() - new Date(a.invited_at).getTime())
      .slice(0, 8);
  }, [invitaciones]);

  // Agrupar por fecha relativa
  const grouped = useMemo(() => {
    const groups: { label: string; items: AdminInvitacion[] }[] = [];
    const seen: Record<string, number> = {};
    sorted.forEach((inv) => {
      const label = getRelativeLabel(inv.invited_at);
      if (seen[label] === undefined) {
        seen[label] = groups.length;
        groups.push({ label, items: [] });
      }
      groups[seen[label]].items.push(inv);
    });
    return groups;
  }, [sorted]);

  return (
    <SectionCard title="Ultimas invitaciones" delay={delay} style={{ marginBottom: '1.5rem' }}>
      <div style={{ padding: '0.5rem 1.25rem 1rem' }}>
        {grouped.map((group) => (
          <div key={group.label}>
            {/* Date label */}
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.75rem 0 0.25rem',
              }}
            >
              {group.label}
            </div>

            {group.items.map((inv, idx) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0',
                  borderBottom:
                    idx < group.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                {/* Avatar del invitador */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--bg-neutral)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  {inv.inviter_name.slice(0, 2).toUpperCase()}
                </div>

                {/* Texto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-main)', margin: 0 }}>
                    <strong>{inv.inviter_name}</strong> invitó a{' '}
                    <strong>{inv.invited_email}</strong>
                  </p>
                </div>

                {/* Badge de estado */}
                <InvitacionStatusBadge status={inv.status} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

type FilterStatus = 'todas' | AdminInvitacion['status'];

export function AdminInvitaciones() {
  const { stats, invitaciones, loading } = useAdminInvitaciones();
  const { isMobile } = useWindowSize();

  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todas');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invitaciones.filter((inv) => {
      const matchStatus = filterStatus === 'todas' || inv.status === filterStatus;
      const matchSearch =
        !q ||
        inv.invited_email.toLowerCase().includes(q) ||
        (inv.invited_name ?? '').toLowerCase().includes(q) ||
        inv.inviter_name.toLowerCase().includes(q) ||
        inv.inviter_email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [invitaciones, filterStatus, search]);

  // Reset page when filters change
  useMemo(() => { setPage(1); }, [filterStatus, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-4 md:p-8"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.25rem',
            margin: 0,
          }}
        >
          Invitaciones
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            margin: '0.25rem 0 0',
          }}
        >
          Programa de referidos y estado de expansión
        </p>
      </div>

      {/* ── Funnel de conversión ─────────────────────────────────────────────── */}
      {loading ? (
        <div
          className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-2 mb-6"
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 88,
                borderRadius: 10,
                background: 'var(--bg-neutral)',
              }}
            />
          ))}
        </div>
      ) : stats ? (
        <div
          className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-2 mb-6"
        >
          <FunnelCard
            label="Enviadas"
            value={stats.total_enviadas}
            total={stats.total_enviadas}
            color="var(--text-main)"
            delay={0}
          />
          <div className="hidden md:block" style={{ fontSize: '1.2rem', color: 'var(--border-color)', flexShrink: 0 }}>
            →
          </div>
          <FunnelCard
            label="Pendientes"
            value={stats.pendientes}
            total={stats.total_enviadas}
            color="#F59E0B"
            delay={0.05}
          />
          <div className="hidden md:block" style={{ fontSize: '1.2rem', color: 'var(--border-color)', flexShrink: 0 }}>
            →
          </div>
          <FunnelCard
            label="Unidas"
            value={stats.unidas}
            total={stats.total_enviadas}
            color="var(--accent)"
            delay={0.1}
          />
          <div className="hidden md:block" style={{ fontSize: '1.2rem', color: 'var(--border-color)', flexShrink: 0 }}>
            →
          </div>
          <FunnelCard
            label="Expiradas"
            value={stats.expiradas}
            total={stats.total_enviadas}
            color="#888888"
            delay={0.15}
          />
        </div>
      ) : null}

      {/* ── Tasa de conversión destacada ─────────────────────────────────────── */}
      {!loading && stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            border: '2px solid var(--accent)',
            borderRadius: 10,
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--accent-light)',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.25rem',
                margin: 0,
              }}
            >
              Tasa de conversión
            </p>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                margin: '0.25rem 0 0',
              }}
            >
              Invitadas unidas / total enviadas
            </p>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--accent)',
              lineHeight: 1,
            }}
          >
            {stats.conversion_rate.toFixed(1)}%
          </div>
        </motion.div>
      )}

      {/* ── Top Inviters ─────────────────────────────────────────────────────── */}
      {!loading && stats && (
        <TopInviters inviters={stats.top_inviters} delay={0.25} />
      )}

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      {!loading && invitaciones.length > 0 && (
        <Timeline invitaciones={invitaciones} delay={0.3} />
      )}

      {/* ── Tabla completa con filtros ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: 10,
          background: 'var(--bg-white)',
          overflow: 'hidden',
        }}
      >
        {/* Sub-header: filtros */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(
              [
                { value: 'todas', label: 'Todas' },
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'unido', label: 'Unida' },
                { value: 'expirado', label: 'Expirada' },
              ] as { value: FilterStatus; label: string }[]
            ).map((tab) => {
              const isActive = filterStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value)}
                  style={{
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    border: isActive
                      ? '1px solid var(--accent)'
                      : '1px solid var(--border-color)',
                    borderRadius: 6,
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 200px',
              padding: '0.45rem 0.75rem',
              borderRadius: 7,
              border: '1px solid var(--border-color)',
              fontSize: '0.83rem',
              color: 'var(--text-main)',
              background: 'var(--bg-white)',
              outline: 'none',
            }}
          />
        </div>

        {/* Tabla — dual mode */}
        {isMobile ? (
          /* ── CARD VIEW (< 768px) ── */
          loading ? (
            <InvCardSkeleton />
          ) : filtered.length === 0 ? (
            <AdminEmptyState icon={Mail} title="Sin invitaciones" description="No se encontraron invitaciones que coincidan con los filtros aplicados." />
          ) : (
            paginated.map((inv, i) => <InvitacionCard key={inv.id} inv={inv} index={i} />)
          )
        ) : (
          /* ── TABLE VIEW (≥ 768px) ── */
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.4fr 1.2fr 0.75fr 0.85fr 0.85fr',
                padding: '0.6rem 1.25rem',
                background: 'var(--bg-neutral)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                gap: '1rem',
                minWidth: 640,
              }}
            >
              <span>Invitado</span>
              <span>Email invitado</span>
              <span>Invitador</span>
              <span>Estado</span>
              <span>Enviado</span>
              <span>Unido</span>
            </div>

            {loading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <AdminEmptyState icon={Mail} title="Sin invitaciones" description="No se encontraron invitaciones que coincidan con los filtros aplicados." />
            ) : (
              <div style={{ minWidth: 640 }}>
                {paginated.map((inv, i) => (
                  <div
                    key={inv.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.1fr 1.4fr 1.2fr 0.75fr 0.85fr 0.85fr',
                      padding: '0.7rem 1.25rem',
                      fontSize: '0.84rem',
                      borderBottom: i < paginated.length - 1 ? '1px solid var(--border-color)' : 'none',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inv.invited_name ?? '—'}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {inv.invited_email}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.83rem' }}>
                        {inv.inviter_name}
                      </span>
                      <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.73rem' }}>
                        {inv.inviter_email}
                      </span>
                    </div>
                    <InvitacionStatusBadge status={inv.status} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(inv.invited_at)}</span>
                    <span style={{ color: inv.joined_at ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {inv.joined_at ? formatDate(inv.joined_at) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer con paginación */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              padding: '0.65rem 1.25rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={13} color="var(--text-muted)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {rangeStart}–{rangeEnd} de {filtered.length} invitación{filtered.length !== 1 ? 'es' : ''}
                {filterStatus !== 'todas' ? ` · "${STATUS_LABELS[filterStatus]}"` : ''}
              </span>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.3rem 0.7rem',
                    fontSize: '0.78rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    background: page === 1 ? 'var(--bg-neutral)' : 'var(--bg-white)',
                    color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: page === 1 ? 'default' : 'pointer',
                  }}
                >
                  ← Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 0.2rem' }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        style={{
                          width: 30,
                          height: 30,
                          fontSize: '0.78rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          background: p === page ? 'var(--accent)' : 'var(--bg-white)',
                          color: p === page ? '#ffffff' : 'var(--text-main)',
                          fontWeight: p === page ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.3rem 0.7rem',
                    fontSize: '0.78rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    background: page === totalPages ? 'var(--bg-neutral)' : 'var(--bg-white)',
                    color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: page === totalPages ? 'default' : 'pointer',
                  }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
