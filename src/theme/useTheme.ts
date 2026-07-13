import { useThemeContext } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme/tokens';

/** Active resolved theme. No component should hardcode a color — read from here. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}
