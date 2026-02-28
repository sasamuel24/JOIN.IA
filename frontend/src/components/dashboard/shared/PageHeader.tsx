import { cn } from '@/lib/utils';

interface PageHeaderProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ badge, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {badge && <div className="mb-4">{badge}</div>}
      <h1 className="text-2xl font-bold text-text-main leading-tight mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[0.95rem] text-text-secondary leading-relaxed max-w-xl">
          {subtitle}
        </p>
      )}
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
}
