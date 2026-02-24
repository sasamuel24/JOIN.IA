import { cn } from '@/lib/utils';

interface DashboardDividerProps {
  className?: string;
}

export function DashboardDivider({ className }: DashboardDividerProps) {
  return (
    <hr className={cn('h-px border-none bg-gradient-to-r from-transparent via-accent-glow to-transparent', className)} />
  );
}
