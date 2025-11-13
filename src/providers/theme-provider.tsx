import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { applyTheme, useThemeStore } from '../store/theme';

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}

