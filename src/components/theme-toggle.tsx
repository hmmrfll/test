import { useMemo } from 'react';
import { Button } from './ui/button';
import { IconMoon, IconSun } from './icons';
import { useThemeStore } from '../store/theme';

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const label = useMemo(() => (theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'), [theme]);

  return (
    <Button
      type="button"
      variant="ghost"
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-muted-foreground))] transition-colors hover:bg-[rgb(var(--color-secondary))] hover:text-[rgb(var(--color-foreground))] dark:hover:bg-[rgb(var(--color-secondary))]/40"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
    >
      {theme === 'light' ? <IconMoon className="h-5 w-5" /> : <IconSun className="h-5 w-5" />}
    </Button>
  );
}

