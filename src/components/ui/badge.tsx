import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]',
  secondary: 'bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-secondary-foreground))]',
  outline: 'border border-[rgb(var(--color-border))] text-[rgb(var(--color-foreground))]',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  destructive: 'bg-[rgb(var(--color-destructive))] text-[rgb(var(--color-destructive-foreground))]',
} as const;

type Variant = keyof typeof variants;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

