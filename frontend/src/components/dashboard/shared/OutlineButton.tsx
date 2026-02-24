'use client';

import { motion } from 'framer-motion';

interface OutlineButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'accent';
}

export function OutlineButton({
  children,
  onClick,
  disabled = false,
  variant = 'default',
}: OutlineButtonProps) {
  const isAccent = variant === 'accent';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      style={{
        border: `1px solid ${isAccent ? 'var(--accent)' : 'var(--border-color)'}`,
        background: 'transparent',
        color: isAccent ? 'var(--accent)' : 'var(--text-main)',
        padding: '0.6rem 1.25rem',
        borderRadius: 6,
        fontFamily: 'var(--font-main)',
        fontSize: '0.9rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color 0.15s ease, color 0.15s ease, background 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
          e.currentTarget.style.background = 'var(--accent-light)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = isAccent ? 'var(--accent)' : 'var(--border-color)';
          e.currentTarget.style.color = isAccent ? 'var(--accent)' : 'var(--text-main)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {children}
    </motion.button>
  );
}
