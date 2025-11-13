import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'kr-life-theme';

const getSystemPreference = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored ?? getSystemPreference();
};

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  hydrateTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const next: Theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      return { theme: next };
    });
  },
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  },
  hydrateTheme: () => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      set({ theme: stored });
      return;
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const nextTheme: Theme = prefersDark ? 'dark' : 'light';
    set({ theme: nextTheme });
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  },
}));

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
}

