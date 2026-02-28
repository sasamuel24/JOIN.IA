import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-text-secondary border border-border px-3 py-1',
        accent: 'bg-accent-light text-accent-text border border-accent/30 px-3 py-1',
        success: 'bg-success-light text-green-700 border border-green-300 px-3 py-1',
        warning: 'bg-warning-light text-amber-700 border border-amber-300 px-3 py-1',
        error: 'bg-error-light text-red-700 border border-red-300 px-3 py-1',
        outline: 'bg-transparent text-text-secondary border border-border px-3 py-1',
      },
      size: {
        sm: 'text-[0.68rem] px-2 py-0.5',
        md: 'text-xs px-3 py-1',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
