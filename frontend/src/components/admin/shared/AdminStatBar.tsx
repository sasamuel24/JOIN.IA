'use client';

interface AdminStatBarProps {
  label: string;
  count: number;
  total: number;
  color?: string;
  delay?: number;
}

export function AdminStatBar({ label, count, total, color = 'var(--accent)', delay = 0 }: AdminStatBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.83rem', color: 'var(--text-main)', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {pct}% <span style={{ color: 'var(--text-muted)' }}>({count})</span>
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 99,
          background: 'var(--bg-neutral)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            transition: 'width 0.6s ease',
            transitionDelay: `${delay}s`,
          }}
        />
      </div>
    </div>
  );
}
