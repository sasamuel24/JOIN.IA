import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex w-full rounded-md border bg-surface-0 px-3.5 py-2.5 text-sm text-text-main font-[family-name:var(--font-main)]',
          'placeholder:text-text-muted',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error focus:ring-error/30 focus:border-error' : 'border-border',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
