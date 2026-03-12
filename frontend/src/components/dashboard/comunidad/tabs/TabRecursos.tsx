'use client';

import { FileText, Video, Link as LinkIcon, BookOpen, Settings } from 'lucide-react';
import { useCommunityResources } from '@/hooks/useCommunity';

const TYPE_ICONS = {
  guide: BookOpen,
  template: FileText,
  video: Video,
  article: LinkIcon,
  tool: Settings,
};

const TYPE_LABELS = {
  guide: 'Guia',
  template: 'Template',
  video: 'Video',
  article: 'Articulo',
  tool: 'Herramienta',
};

export function TabRecursos() {
  const { resources, loading, error } = useCommunityResources();

  if (loading) {
    return (
      <div>
        <p className="text-[0.85rem] text-secondary mb-4">
          Recursos para la comunidad
        </p>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-10 h-10 border-[3px] border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="text-[0.85rem] text-secondary mb-4">
          Recursos para la comunidad
        </p>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="text-sm text-error">Error: {error}</div>
          <p className="text-xs text-text-secondary">
            No se pudieron cargar los recursos de la comunidad
          </p>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div>
        <p className="text-[0.85rem] text-secondary mb-4">
          Recursos para la comunidad
        </p>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm text-text-secondary">No hay recursos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[0.85rem] text-secondary mb-4">
        Recursos para la comunidad
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {resources.map(recurso => {
          const Icon = TYPE_ICONS[recurso.type];
          return (
            <div
              key={recurso.id}
              className="border border-border rounded-[10px] p-5 cursor-pointer transition-all duration-150 hover:border-accent-glow hover:shadow-accent"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <span className="text-[0.7rem] font-semibold text-accent-text uppercase tracking-wide">
                  {TYPE_LABELS[recurso.type]}
                </span>
              </div>
              <h4 className="text-[0.92rem] font-semibold text-main leading-snug mb-1">
                {recurso.title}
              </h4>
              <p className="text-[0.82rem] text-secondary leading-normal">
                {recurso.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
