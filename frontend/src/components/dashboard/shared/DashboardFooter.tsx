import { JoinIALogo } from './JoinIALogo';

export function DashboardFooter() {
  return (
    <div className="flex items-center gap-2 pt-2">
      <JoinIALogo size="sm" />
      <span className="text-text-secondary text-[0.8rem]">·</span>
      <span className="text-[0.8rem] text-text-secondary">Reduciendo friccion</span>
    </div>
  );
}
