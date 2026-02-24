'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ChangelogItem } from '@/types/dashboard';

interface TimelineItemProps {
  item: ChangelogItem;
  index: number;
}

export function TimelineItem({ item, index }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: 'easeOut' }}
      className="flex gap-5 pb-8"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0 w-4">
        <div
          className={cn(
            'size-2.5 rounded-full border-2 border-accent shrink-0 mt-1',
            index === 0 ? 'bg-accent' : 'bg-surface-0'
          )}
        />
        <div className="w-0.5 flex-1 bg-border mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-secondary">
            v{item.version}
          </span>
          <span className="text-xs text-secondary">&middot;</span>
          <span className="text-xs text-secondary">
            {item.date}
          </span>
        </div>

        <h3 className="text-lg font-bold text-main mb-2 leading-tight">
          {item.title}
        </h3>

        {item.image_url && (
          <div className="w-full max-h-[200px] rounded-lg overflow-hidden mb-3 bg-surface-2">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <p className="text-sm text-secondary leading-relaxed mb-2.5">
          {item.description}
        </p>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map(tag => (
              <span
                key={tag}
                className="text-[0.68rem] font-semibold bg-surface-2 border border-border rounded px-2 py-0.5 text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
