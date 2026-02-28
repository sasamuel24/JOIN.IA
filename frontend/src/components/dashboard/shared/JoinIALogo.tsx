import { cn } from '@/lib/utils';

interface JoinIALogoProps {
  size?: 'sm' | 'md' | 'lg';
  textColor?: string;
}

const SIZES = {
  sm: { dot: 'w-[3px] h-[3px]', gap: 'gap-[2px]', font: 'text-[0.85rem]' },
  md: { dot: 'w-1 h-1', gap: 'gap-[3px]', font: 'text-[1.1rem]' },
  lg: { dot: 'w-[5px] h-[5px]', gap: 'gap-[3px]', font: 'text-[1.25rem]' },
};

export function JoinIALogo({ size = 'md', textColor }: JoinIALogoProps) {
  const s = SIZES[size];

  return (
    <span className="inline-flex items-center gap-[0.45rem]">
      <span className={cn('grid grid-cols-3 grid-rows-3', s.gap)}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={cn('rounded-full bg-accent', s.dot)} />
        ))}
      </span>
      <span className={cn('font-bold', s.font)} style={textColor ? { color: textColor } : undefined}>
        JOIN.IA
      </span>
    </span>
  );
}
