type BadgeVariant = 'pendiente' | 'unido' | 'expirado';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const VARIANTS: Record<BadgeVariant, { bg: string; color: string; border: string; text: string }> =
  {
    pendiente: {
      bg: '#FFF7E0',
      color: '#B87700',
      border: '#F5C842',
      text: 'Pendiente',
    },
    unido: {
      bg: '#E6FFF9',
      color: '#00704E',
      border: 'var(--accent)',
      text: 'Se unió',
    },
    expirado: {
      bg: '#F5F5F5',
      color: '#888888',
      border: '#DDDDDD',
      text: 'Expirado',
    },
  };

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const v = VARIANTS[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.65rem',
        borderRadius: 50,
        fontSize: '0.72rem',
        fontWeight: 600,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {variant === 'unido' && <span>&#10003;</span>}
      {label ?? v.text}
    </span>
  );
}
