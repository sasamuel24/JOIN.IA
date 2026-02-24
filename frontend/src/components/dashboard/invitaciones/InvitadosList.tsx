import { UserPlus } from 'lucide-react';
import type { Invitado } from '@/types/dashboard';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InvitadosListProps {
  invitados: Invitado[];
  disponibles: number;
}

const STATUS_VARIANT: Record<string, 'warning' | 'accent' | 'default'> = {
  pendiente: 'warning',
  unido: 'accent',
  expirado: 'default',
};

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  unido: 'Se unió',
  expirado: 'Expirado',
};

export function InvitadosList({ invitados, disponibles }: InvitadosListProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-text-main mb-4">
        Personas invitadas
      </h3>

      <div className="border border-border rounded-xl overflow-hidden">
        {invitados.map((inv, i) => (
          <div
            key={inv.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5',
              (i < invitados.length - 1 || disponibles > 0) && 'border-b border-border'
            )}
          >
            <Avatar
              src={null}
              name={inv.name || inv.email}
              size="sm"
              className={inv.status === 'unido' ? '' : '!bg-surface-2 !text-text-secondary'}
            />

            <div className="flex-1 min-w-0">
              {inv.name && (
                <div className="text-sm font-semibold text-text-main leading-snug">
                  {inv.name}
                </div>
              )}
              <div className="text-[0.8rem] text-text-secondary truncate">
                {inv.email}
              </div>
            </div>

            <Badge variant={STATUS_VARIANT[inv.status] ?? 'default'} size="sm">
              {inv.status === 'unido' && <span>&#10003;</span>}
              {STATUS_LABEL[inv.status] ?? inv.status}
            </Badge>
          </div>
        ))}

        {disponibles > 0 && (
          <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-1">
            <div className="w-8 h-8 rounded-full border-[1.5px] border-dashed border-border flex items-center justify-center text-text-secondary shrink-0">
              <UserPlus size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[0.85rem] font-semibold text-text-main">
                Invitación pendiente
              </div>
              <div className="text-xs text-accent-text">
                {disponibles} {disponibles === 1 ? 'lugar disponible' : 'lugares más disponibles'}
              </div>
            </div>
            <span className="text-[0.8rem] font-semibold text-text-main border border-border rounded-md px-3 py-1 cursor-default">
              Invitar &rarr;
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
