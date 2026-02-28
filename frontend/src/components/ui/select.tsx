import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex w-full rounded-md border bg-surface-0 px-3.5 py-2.5 text-sm text-text-main font-[family-name:var(--font-main)]',
          'transition-colors duration-150 appearance-auto',
          'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error' : 'border-border',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };
