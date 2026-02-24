interface ProfileStatsProps {
  invitados: number;
  feedbackCompletado: boolean;
  comunidadPosts: number;
}

interface StatCellProps {
  value: string;
  label: string;
}

function StatCell({ value, label }: StatCellProps) {
  return (
    <div className="text-center flex-1">
      <div className="text-2xl font-bold text-text-main leading-tight">
        {value}
      </div>
      <div className="text-[0.72rem] text-text-secondary uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  );
}

export function ProfileStats({ invitados, feedbackCompletado, comunidadPosts }: ProfileStatsProps) {
  return (
    <div className="flex border-t border-b border-border py-5 mx-6">
      <StatCell value={String(invitados)} label="Invitados" />
      <div className="w-px bg-border" />
      <StatCell value={feedbackCompletado ? '\u2713' : '\u2014'} label="Feedback" />
      <div className="w-px bg-border" />
      <StatCell value={String(comunidadPosts)} label="Posts" />
    </div>
  );
}
