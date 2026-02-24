import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full font-bold shrink-0',
  {
    variants: {
      size: {
        sm: 'w-8 h-8 text-[0.65rem]',
        md: 'w-10 h-10 text-[0.8rem]',
        lg: 'w-[88px] h-[88px] text-xl',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  src?: string | null;
  name: string;
  online?: boolean;
}

export function Avatar({ src, name, size, online, className, ...props }: AvatarProps) {
  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className="w-full h-full rounded-full bg-accent-light text-accent-text flex items-center justify-center">
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface-0" />
      )}
    </div>
  );
}
