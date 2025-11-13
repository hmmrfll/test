import * as React from 'react';
import { cn } from '../../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] px-3 py-2 text-sm text-[rgb(var(--color-foreground))] shadow-sm transition-colors placeholder:text-[rgb(var(--color-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-background))] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

