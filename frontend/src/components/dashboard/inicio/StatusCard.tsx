import { Card } from '@/components/ui/card';

interface StatusCardProps {
  status: string;
  group: string;
}

export function StatusCard({ status, group }: StatusCardProps) {
  return (
    <Card variant="default" className="flex gap-8 px-6 py-4">
      <div>
        <span className="block text-[0.7rem] font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Estado
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[0.95rem] font-semibold text-text-main">{status}</span>
        </div>
      </div>

      <div className="w-px bg-border" />

      <div>
        <span className="block text-[0.7rem] font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Grupo
        </span>
        <span className="text-[0.95rem] font-semibold text-text-main">{group}</span>
      </div>
    </Card>
  );
}
