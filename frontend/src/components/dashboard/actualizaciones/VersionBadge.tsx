'use client';

import { motion } from 'framer-motion';

interface VersionBadgeProps {
  version: string;
  tier: string;
}

export function VersionBadge({ version, tier }: VersionBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 border border-accent rounded-full py-1 px-4 text-xs text-accent-text font-semibold w-fit">
      <motion.span
        className="inline-block size-[7px] rounded-full bg-success"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      Version actual {version} &middot; {tier}
    </div>
  );
}
