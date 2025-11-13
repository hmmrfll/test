import * as React from 'react';
import { cn } from '../../lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[120px] w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] px-3 py-2 text-sm text-[rgb(var(--color-foreground))] shadow-sm transition-colors placeholder:text-[rgb(var(--color-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-background))] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

