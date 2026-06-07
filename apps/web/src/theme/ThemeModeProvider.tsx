import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { ThemeModeContext, THEME_STORAGE_KEY, type ThemeMode } from './themeMode';

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
}

/** Centralized, persisted light/dark theme with a togglable color mode. */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode, primary: { main: '#1565c0' }, secondary: { main: '#7b1fa2' } },
        shape: { borderRadius: 10 },
      }),
    [mode],
  );

  const value = useMemo(
    () => ({ mode, toggle: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')) }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
