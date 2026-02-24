'use client';

import { motion } from 'framer-motion';

interface ComunidadHeaderProps {
  miembros: number;
  posts: number;
  activosAhora: number;
}

interface StatItemProps {
  value: number;
  label: string;
  showDot?: boolean;
}

function StatItem({ value, label, showDot }: StatItemProps) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-bold text-main">
        {value}
      </span>
      <span className="text-[0.8rem] text-secondary flex items-center gap-1">
        {showDot && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-success inline-block"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {label}
      </span>
    </div>
  );
}

export function ComunidadHeader({ miembros, posts, activosAhora }: ComunidadHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      <StatItem value={miembros} label="Miembros" />
      <div className="w-px h-6 bg-border" />
      <StatItem value={posts} label="Posts" />
      <div className="w-px h-6 bg-border" />
      <StatItem value={activosAhora} label="Activos ahora" showDot />
    </div>
  );
}
