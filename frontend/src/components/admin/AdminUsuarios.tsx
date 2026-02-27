'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  TrendingUp,
  MessageSquare,
  Download,
} from 'lucide-react';
import { AdminStatBar } from '@/components/admin/shared/AdminStatBar';
import { AdminEmptyState } from '@/components/admin/shared/AdminEmptyState';
import { useAdminUsers } from '@/hooks/useAdminUsers';

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  delay: number;
}

function KPICard({ label, value, icon, delay }: KPICardProps) {
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
          marginBottom: '0.75rem',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          marginTop: '0.2rem',
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// ─── Table Skeleton ────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.5fr 0.8fr 0.9fr 0.8fr 0.5fr 0.6fr',
            padding: '0.7rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            gap: '1rem',
            alignItems: 'center',
            minWidth: 760,
          }}
        >
          {[...Array(7)].map((_, j) => (
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'activo' | 'inactivo' }) {
  const isActive = status === 'activo';
  return (
    <span
      style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        color: isActive ? 'var(--accent)' : '#888888',
        background: isActive ? 'var(--accent-light)' : 'var(--bg-neutral)',
        padding: '0.15rem 0.5rem',
        borderRadius: 50,
        whiteSpace: 'nowrap',
      }}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

// ─── Distribución Panel ───────────────────────────────────────────────────────

interface DistribucionPanelProps {
  title: string;
  items: { label: string; count: number }[];
  total: number;
  delay: number;
}

function DistribucionPanel({ title, items, total, delay }: DistribucionPanelProps) {
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
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
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
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
        }}
      >
        {items.map((item, i) => (
          <AdminStatBar
            key={item.label}
            label={item.label}
            count={item.count}
            total={total}
            delay={delay + i * 0.05}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const PAGE_SIZE = 20;

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminUsuarios() {
  const { stats, users, loading } = useAdminUsers();
  const [noResults, setNoResults] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  // ── Derived filter options ─────────────────────────────────────────────────
  const groupOptions = useMemo(() => {
    const set = new Set(users.map((u) => u.group));
    return Array.from(set).sort();
  }, [users]);

  const tierOptions = useMemo(() => {
    const set = new Set(users.map((u) => u.access_tier));
    return Array.from(set).sort();
  }, [users]);

  // ── Filtered + paginated users ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchGroup = !filterGroup || u.group === filterGroup;
      const matchTier = !filterTier || u.access_tier === filterTier;
      const matchStatus = !filterStatus || u.status === filterStatus;
      return matchSearch && matchGroup && matchTier && matchStatus;
    });
  }, [users, search, filterGroup, filterTier, filterStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setNoResults(filtered.length === 0 && !loading);
  }, [filtered, loading]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const header = ['Nombre', 'Email', 'Grupo', 'Tier', 'Registro', 'Feedback', 'Estado'];
    const rows = filtered.map((u) => [
      u.name,
      u.email,
      u.group,
      u.access_tier,
      u.created_at,
      u.feedback_completed ? 'Sí' : 'No',
      u.status,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios-joinia.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-4 md:p-8"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            Usuarios
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            Gestión y seguimiento de usuarios registrados en JOIN.IA
          </p>
        </div>

        <button
          onClick={handleExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-white)',
            color: 'var(--text-main)',
            fontSize: '0.83rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-7"
      >
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
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
                    height: 36,
                    width: 36,
                    borderRadius: 8,
                    background: 'var(--bg-neutral)',
                  }}
                />
                <div
                  style={{
                    height: 28,
                    borderRadius: 6,
                    background: 'var(--bg-neutral)',
                    width: '50%',
                  }}
                />
                <div
                  style={{
                    height: 14,
                    borderRadius: 6,
                    background: 'var(--bg-neutral)',
                    width: '70%',
                  }}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <KPICard
              label="Total usuarios"
              value={stats?.total ?? 0}
              icon={<Users size={18} />}
              delay={0}
            />
            <KPICard
              label="Usuarios activos"
              value={stats?.activos ?? 0}
              icon={<UserCheck size={18} />}
              delay={0.05}
            />
            <KPICard
              label="Nuevos esta semana"
              value={stats?.nuevos_semana ?? 0}
              icon={<TrendingUp size={18} />}
              delay={0.1}
            />
            <KPICard
              label="Con feedback"
              value={
                stats && stats.total > 0
                  ? `${Math.round((stats.con_feedback / stats.total) * 100)}%`
                  : '0%'
              }
              icon={<MessageSquare size={18} />}
              delay={0.15}
            />
          </>
        )}
      </div>

      {/* ── Distribución ───────────────────────────────────────────────────── */}
      {!loading && stats && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-7"
        >
          <DistribucionPanel
            title="Por grupo profesional"
            items={stats.por_grupo.map((g) => ({ label: g.grupo, count: g.count }))}
            total={stats.total}
            delay={0.2}
          />
          <DistribucionPanel
            title="Por nivel de acceso"
            items={stats.por_tier.map((t) => ({ label: t.tier, count: t.count }))}
            total={stats.total}
            delay={0.25}
          />
        </div>
      )}

      {/* ── Tabla section ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: 10,
          background: 'var(--bg-white)',
          overflow: 'hidden',
        }}
      >
        {/* Sub-header con buscador y filtros */}
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
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 220px',
              padding: '0.5rem 0.75rem',
              borderRadius: 7,
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              background: 'var(--bg-white)',
              outline: 'none',
            }}
          />

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 7,
              border: '1px solid var(--border-color)',
              fontSize: '0.83rem',
              color: 'var(--text-main)',
              background: 'var(--bg-white)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todos los grupos</option>
            {groupOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 7,
              border: '1px solid var(--border-color)',
              fontSize: '0.83rem',
              color: 'var(--text-main)',
              background: 'var(--bg-white)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todos los tiers</option>
            {tierOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 7,
              border: '1px solid var(--border-color)',
              fontSize: '0.83rem',
              color: 'var(--text-main)',
              background: 'var(--bg-white)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {/* Table header */}
        <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.5fr 0.8fr 0.9fr 0.8fr 0.5fr 0.6fr',
            padding: '0.6rem 1.25rem',
            background: 'var(--bg-neutral)',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            gap: '1rem',
            minWidth: 760,
          }}
        >
          <span>Nombre</span>
          <span>Email</span>
          <span>Grupo</span>
          <span>Tier</span>
          <span>Registro</span>
          <span>Feedback</span>
          <span>Estado</span>
        </div>

        {/* Table body */}
        {loading ? (
          <TableSkeleton />
        ) : noResults || paginated.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="Sin usuarios"
            description="No se encontraron usuarios que coincidan con los filtros aplicados."
          />
        ) : (
          <>
            {paginated.map((user, i) => (
              <div
                key={user.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.5fr 0.8fr 0.9fr 0.8fr 0.5fr 0.6fr',
                  padding: '0.7rem 1.25rem',
                  fontSize: '0.85rem',
                  borderBottom:
                    i < paginated.length - 1 ? '1px solid var(--border-color)' : 'none',
                  alignItems: 'center',
                  gap: '1rem',
                  minWidth: 760,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </span>
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </span>
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.group}
                </span>
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.8rem',
                  }}
                >
                  {user.access_tier}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {formatDate(user.created_at)}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: user.feedback_completed ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {user.feedback_completed ? '✓' : '—'}
                </span>
                <StatusBadge status={user.status} />
              </div>
            ))}
          </>
        )}
        </div>

        {/* Pagination footer */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Mostrando {rangeStart}–{rangeEnd} de {filtered.length} usuarios
            </span>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background: page === 1 ? 'var(--bg-neutral)' : 'var(--bg-white)',
                    color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: page === 1 ? 'default' : 'pointer',
                    fontWeight: 500,
                  }}
                >
                  ← Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '0.3rem 0.55rem',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: p === page ? 'var(--accent)' : 'var(--bg-white)',
                      color: p === page ? '#ffffff' : 'var(--text-main)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: p === page ? 700 : 500,
                      minWidth: 32,
                    }}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background:
                      page === totalPages ? 'var(--bg-neutral)' : 'var(--bg-white)',
                    color:
                      page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: page === totalPages ? 'default' : 'pointer',
                    fontWeight: 500,
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
