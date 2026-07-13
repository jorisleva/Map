/**
 * Resolves system color-scheme + platform into a single Theme object and
 * publishes it via context. A manual override (toggleScheme) lets the app flip
 * light/dark like the original design board; default follows the OS.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DEFAULT_ACCENT, getTheme, type Plat, type Scheme, type Theme } from '@/theme/tokens';

interface ThemeContextValue {
  theme: Theme;
  scheme: Scheme;
  toggleScheme: () => void;
  setOverride: (s: Scheme | null) => void;
  accent: string;
  setAccent: (c: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const resolvePlatform = (): Plat => (Platform.OS === 'android' ? 'android' : 'ios');

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<Scheme | null>(null);
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT);

  const scheme: Scheme = override ?? (system === 'dark' ? 'dark' : 'light');
  const theme = useMemo(() => getTheme(scheme, resolvePlatform(), accent), [scheme, accent]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      scheme,
      accent,
      setAccent,
      setOverride,
      toggleScheme: () => setOverride(scheme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, scheme, accent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within <ThemeProvider>');
  return ctx;
}
