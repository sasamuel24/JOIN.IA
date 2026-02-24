'use client';

import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface PostData {
  id: string;
  author: string;
  role: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

const MOCK_POSTS: PostData[] = [
  {
    id: '1',
    author: 'Maria Camila',
    role: 'Fundadora, StartupX',
    content:
      'Acabo de completar el feedback. Es increible ver que los problemas que tengo son los mismos que tiene el 72% de la comunidad. No estoy sola en esto.',
    likes: 12,
    comments: 3,
    time: 'Hace 2h',
  },
  {
    id: '2',
    author: 'Javier P.',
    role: 'Director de Operaciones',
    content:
      'Pregunta para la comunidad: alguien ha logrado reducir las reuniones semanales de seguimiento sin perder visibilidad? Estoy buscando ideas antes de que JOIN.IA lo resuelva por nosotros',
    likes: 8,
    comments: 5,
    time: 'Hace 5h',
  },
  {
    id: '3',
    author: 'Ana Torres',
    role: 'CTO, MediaLab',
    content:
      'Llevo 3 semanas en Early Access y lo que mas valoro es la transparencia del equipo. El changelog semanal es oro puro.',
    likes: 15,
    comments: 2,
    time: 'Hace 1d',
  },
];

export function TabFeed() {
  const [newPost, setNewPost] = useState('');

  return (
    <div>
      {/* New post input */}
      <div className="border border-border rounded-[10px] p-4 mb-5">
        <Input
          type="text"
          placeholder="Comparte algo con la comunidad"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          className="mb-3"
        />
        <div className="flex justify-end">
          <button
            disabled={!newPost.trim()}
            className={cn(
              'px-4 py-1.5 rounded-md border-none text-[0.82rem] font-semibold font-[family-name:var(--font-main)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              newPost.trim()
                ? 'bg-accent text-white cursor-pointer hover:bg-accent-dark'
                : 'bg-surface-2 text-secondary cursor-not-allowed'
            )}
          >
            Publicar
          </button>
        </div>
      </div>

      {/* Posts list */}
      <div className="flex flex-col gap-4">
        {MOCK_POSTS.map(post => (
          <div
            key={post.id}
            className="border border-border rounded-[10px] p-4"
          >
            {/* Author */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <Avatar name={post.author} size="sm" />
              <div className="flex-1">
                <span className="text-[0.85rem] font-semibold text-main">
                  {post.author}
                </span>
                <span className="text-xs text-secondary ml-2">
                  {post.role}
                </span>
              </div>
              <span className="text-[0.72rem] text-secondary">
                {post.time}
              </span>
            </div>

            {/* Content */}
            <p className="text-[0.9rem] text-main leading-relaxed mb-3">
              {post.content}
            </p>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                aria-label={`Me gusta, ${post.likes}`}
                className="flex items-center gap-1 bg-transparent border-none text-secondary text-[0.8rem] font-[family-name:var(--font-main)] cursor-pointer hover:text-main transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
              >
                <Heart size={14} />
                {post.likes}
              </button>
              <button
                aria-label={`Comentarios, ${post.comments}`}
                className="flex items-center gap-1 bg-transparent border-none text-secondary text-[0.8rem] font-[family-name:var(--font-main)] cursor-pointer hover:text-main transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
              >
                <MessageCircle size={14} />
                {post.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
