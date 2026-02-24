import type { InvitacionesStats } from '@/types/dashboard';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsGridProps {
  stats: InvitacionesStats;
}

function StatCell({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <Card variant="outline" className="!p-4 text-center hover:shadow-sm transition-shadow">
      <div className={cn('text-[1.75rem] font-bold leading-tight', accent ? 'text-accent-text' : 'text-text-main')}>
        {value}
      </div>
      <div className="text-[0.72rem] text-text-secondary uppercase tracking-wider mt-1 leading-snug">
        {label}
      </div>
    </Card>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCell value={stats.invitados} label="Personas invitadas" />
      <StatCell value={stats.unidos} label="Ya se Unieron" accent />
      <StatCell value={stats.disponibles} label="Lugares disponibles" />
    </div>
  );
}
