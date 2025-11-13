import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-background))]',
          checked
            ? 'bg-[rgb(var(--color-primary))]'
            : 'bg-[rgb(var(--color-muted))] dark:bg-[rgba(var(--color-muted),0.55)]',
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:bg-[rgb(var(--color-surface))]',
            checked ? 'translate-x-5' : 'translate-x-1',
          )}
        />
        {label ? <span className="sr-only">{label}</span> : null}
      </button>
    );
  },
);

Switch.displayName = 'Switch';

