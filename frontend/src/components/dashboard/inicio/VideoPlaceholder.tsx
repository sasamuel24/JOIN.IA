'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface VideoPlaceholderProps {
  thumbnailUrl?: string;
  onPlay?: () => void;
}

export function VideoPlaceholder({ thumbnailUrl, onPlay }: VideoPlaceholderProps) {
  return (
    <div
      className="relative aspect-video rounded-xl overflow-hidden bg-surface-2 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      onClick={onPlay}
    >
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt="Video preview" className="w-full h-full object-cover" />
      )}

      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${thumbnailUrl ? 'bg-black/45' : 'bg-black/5'}`}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md"
        >
          <Play size={22} className="text-text-main ml-0.5" />
        </motion.div>
        <span className={`text-[0.85rem] font-medium ${thumbnailUrl ? 'text-white' : 'text-text-secondary'}`}>
          Reproducir video
        </span>
      </div>
    </div>
  );
}
