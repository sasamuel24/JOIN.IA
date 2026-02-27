'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, UserPlus, TrendingUp } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  delay: number;
}

function MetricCard({ label, value, trend, trendUp, icon, delay }: MetricCardProps) {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
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
          }}
        >
          {icon}
        </div>
        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: trendUp ? '#22C55E' : '#EF4444',
            }}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
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

export function AdminDashboard() {
  const { metrics, recentUsers, loading } = useAdminDashboard();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-4 md:p-8"
    >
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '0.25rem',
        }}
      >
        Dashboard
      </h1>
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
        }}
      >
        Vista general del estado de JOIN.IA Early Access
      </p>

      {/* Metrics grid */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
      >
        <MetricCard
          label="Total usuarios"
          value={loading ? '—' : String(metrics?.total_usuarios ?? 0)}
          trend="12%"
          trendUp
          icon={<Users size={18} />}
          delay={0}
        />
        <MetricCard
          label="Feedbacks completados"
          value={loading ? '—' : String(metrics?.feedbacks_completados ?? 0)}
          trend="8%"
          trendUp
          icon={<MessageSquare size={18} />}
          delay={0.05}
        />
        <MetricCard
          label="Invitaciones enviadas"
          value={loading ? '—' : String(metrics?.invitaciones_enviadas ?? 0)}
          trend="15%"
          trendUp
          icon={<UserPlus size={18} />}
          delay={0.1}
        />
        <MetricCard
          label="Tasa de conversión"
          value={loading ? '—' : `${metrics?.conversion_rate ?? 0}%`}
          trend="3%"
          trendUp
          icon={<TrendingUp size={18} />}
          delay={0.15}
        />
      </div>

      {/* Recent users table */}
      <div
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Usuarios recientes
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr 0.8fr 0.6fr',
              padding: '0.6rem 1.25rem',
              background: 'var(--bg-neutral)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              minWidth: 500,
            }}
          >
            <span>Nombre</span>
            <span>Email</span>
            <span>Registro</span>
            <span>Estado</span>
          </div>

          {/* Table rows */}
          {recentUsers.map((u, i) => (
            <div
              key={u.email}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr 0.8fr 0.6fr',
                padding: '0.7rem 1.25rem',
                fontSize: '0.85rem',
                borderBottom: i < recentUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                alignItems: 'center',
                minWidth: 500,
              }}
            >
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.date}</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: u.status === 'Activo' ? 'var(--accent)' : '#B87700',
                background: u.status === 'Activo' ? 'var(--accent-light)' : '#FFF7E0',
                padding: '0.15rem 0.5rem',
                borderRadius: 50,
                width: 'fit-content',
              }}
            >
              {u.status}
            </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
