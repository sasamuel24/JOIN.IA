'use client';

import { Avatar } from '@/components/ui/avatar';
import { useCommunityMembers } from '@/hooks/useCommunity';

export function TabMiembros() {
  const { members, loading, error } = useCommunityMembers();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-10 h-10 border-[3px] border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">Cargando miembros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="text-sm text-error">Error: {error}</div>
        <p className="text-xs text-text-secondary">
          No se pudieron cargar los miembros de la comunidad
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-sm text-text-secondary">No hay miembros para mostrar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {members.map(m => (
        <div
          key={m.id}
          className="border border-border rounded-[10px] p-4 flex flex-col items-center text-center transition-all duration-150 cursor-default hover:border-accent-glow hover:shadow-accent"
        >
          <div className="relative mb-2.5 inline-block">
            <Avatar name={m.name} src={m.avatar_url} size="md" />
            {m.is_active_now && (
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success border-2 border-bg-white" />
            )}
          </div>
          <div className="text-[0.9rem] font-semibold text-main">
            {m.name}
          </div>
          <div className="text-[0.78rem] text-secondary mt-0.5">
            {m.role}
          </div>
          <div className="text-[0.7rem] text-secondary mt-1">
            Desde {m.joined}
          </div>
        </div>
      ))}
    </div>
  );
}
