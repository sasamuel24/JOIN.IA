import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-surface-0 border border-border p-6',
        elevated: 'bg-surface-0 rounded-xl p-6 shadow-md hover:shadow-lg',
        accent: 'bg-surface-0 border border-accent/20 p-6 shadow-accent',
        ghost: 'bg-surface-1 p-6',
        outline: 'bg-transparent border border-border p-6 hover:border-border-hover',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}
