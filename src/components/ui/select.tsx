import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, icon, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted-foreground))]">{icon}</span> : null}
      <select
        ref={ref}
        className={cn(
          'h-10 w-full appearance-none rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] px-3 py-2 text-sm text-[rgb(var(--color-foreground))] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-background))] disabled:cursor-not-allowed disabled:opacity-50',
          icon ? 'pl-9' : null,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted-foreground))]">▾</span>
    </div>
  );
});

Select.displayName = 'Select';

