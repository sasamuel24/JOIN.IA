'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import type { CurrentUser } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  user: CurrentUser;
  coverUrl?: string;
  onAvatarChange?: (file: File) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfileHeader({ user, coverUrl, onAvatarChange }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="relative mb-4">
      {/* Cover with content inside */}
      <div
        className="min-h-[180px] relative flex items-end px-4 sm:px-8 lg:px-12 pb-7"
        style={{
          background: coverUrl
            ? `url(${coverUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        }}
      >
        {/* Avatar */}
        <div className="group relative shrink-0 mr-5">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-[88px] h-[88px] rounded-full border-[3px] border-white object-cover bg-[#111]"
            />
          ) : (
            <div
              className={cn(
                'w-[88px] h-[88px] rounded-full border-[3px] border-white bg-[#111]',
                'text-white flex items-center justify-center text-2xl font-bold tracking-wide'
              )}
            >
              {getInitials(user.name)}
            </div>
          )}

          {/* Upload overlay button */}
          <button
            onClick={handleFileSelect}
            aria-label="Cambiar foto de perfil"
            className={cn(
              'absolute inset-0 rounded-full bg-black/45 border-none cursor-pointer',
              'flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'focus-visible:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
            )}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>

          {/* Online dot */}
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#00D4AA] border-[2.5px] border-[#1a1a1a]" />
        </div>

        {/* Name + subtitle + badges */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-[1.35rem] font-bold text-white leading-tight">
            {firstName} {lastName}
          </h1>
          <p className="text-[0.85rem] text-white/60 mt-0.5 mb-2.5">
            {user.role === 'admin' ? 'Administrador' : 'CEO'} &middot;{' '}
            {user.group || 'Colombia'}
          </p>

          {/* Badges */}
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="accent" size="sm" className="uppercase tracking-wide">
              + Early Access
            </Badge>
            <span
              className={cn(
                'inline-flex items-center text-[0.68rem] font-medium px-3 py-1 rounded-full',
                'bg-white/[0.12] border border-white/20 text-white/85 uppercase tracking-wide'
              )}
            >
              {user.role === 'admin' ? 'Admin' : 'CEO / Fundador'}
            </span>
            <span
              className={cn(
                'inline-flex items-center text-[0.68rem] font-medium px-3 py-1 rounded-full',
                'bg-white/[0.12] border border-white/20 text-white/85 uppercase tracking-wide'
              )}
            >
              Colombia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
