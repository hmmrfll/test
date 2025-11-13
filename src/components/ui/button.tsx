import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

const variants = {
  default:
    'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] hover:bg-[rgb(var(--color-primary-hover))] dark:text-[rgb(var(--color-primary-foreground))]',
  secondary:
    'bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-secondary-foreground))] hover:bg-[rgb(var(--color-secondary-hover))] dark:text-[rgb(var(--color-secondary-foreground))]',
  outline:
    'border border-[rgb(var(--color-border))] text-[rgb(var(--color-foreground))] hover:bg-[rgb(var(--color-muted))] dark:hover:bg-[rgb(var(--color-muted))]/30',
  ghost:
    'text-[rgb(var(--color-foreground))] hover:bg-[rgb(var(--color-muted))] dark:hover:bg-[rgb(var(--color-muted))]/30',
  destructive:
    'bg-[rgb(var(--color-destructive))] text-[rgb(var(--color-destructive-foreground))] hover:bg-[rgb(var(--color-destructive-hover))] dark:text-[rgb(var(--color-destructive-foreground))]',
} as const;

type Variant = keyof typeof variants;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-background))] disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

