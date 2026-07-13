/**
 * Design tokens ported 1:1 from the "Navigation mobile Liquid Glass" Claude
 * Design project (Phone.dc.html `renderVals()`). Light/dark palettes + the glass
 * recipe. CSS `backdrop-filter: blur() saturate()` → expo-blur intensity + a
 * translucent tint; the inset "sheen" highlight → a diagonal gradient overlay;
 * the 1px border → hairline; the drop shadow → shadow/elevation.
 */
import { Platform } from 'react-native';

export type Scheme = 'light' | 'dark';
export type Plat = 'ios' | 'android';

export const DEFAULT_ACCENT = '#6ea8ff';

export interface Theme {
  scheme: Scheme;
  isDark: boolean;
  platform: Plat;
  ios: boolean;
  accent: string;
  color: {
    text: string;
    text2: string;
    text3: string;
    icon: string;
    danger: string;
    green: string;
    micBg: string;
    scrim: string;
    routeCasing: string;
    amberIcon: string;
    amberTitle: string;
    amberText: string;
    amberBg: string;
    amberBorder: string;
    amberHalo: string;
  };
  glass: {
    blurIntensity: number;
    tint: 'light' | 'dark' | 'default';
    /** translucent fill layered over the blur (subtle vs strong panels) */
    bg: string;
    bgStrong: string;
    border: string;
    /** diagonal highlight gradient stops (top-left → transparent) */
    sheen: readonly [string, string];
    chipBg: string;
    shadow: { color: string; opacity: number; radius: number; offsetY: number; elevation: number };
  };
  font: string | undefined;
  radius: { pill: number; card: number; sheet: number; chip: number; sm: number };
}

const FONT = Platform.select<string | undefined>({
  ios: undefined, // system (SF)
  android: 'sans-serif',
  default: undefined,
});

export function getTheme(scheme: Scheme, platform: Plat, accent: string = DEFAULT_ACCENT): Theme {
  const isDark = scheme === 'dark';
  const ios = platform === 'ios';

  const color: Theme['color'] = isDark
    ? {
        text: '#f1f4f8',
        text2: 'rgba(255,255,255,0.6)',
        text3: 'rgba(255,255,255,0.42)',
        icon: 'rgba(255,255,255,0.82)',
        danger: '#e2483d',
        green: '#3fae6b',
        micBg: 'rgba(110,168,255,0.18)',
        scrim: 'rgba(0,0,0,0.35)',
        routeCasing: 'rgba(10,14,20,0.6)',
        amberIcon: '#f6a723',
        amberTitle: '#ffd98a',
        amberText: 'rgba(255,231,190,0.82)',
        amberBg: 'rgba(52,42,20,0.5)',
        amberBorder: 'rgba(246,167,35,0.5)',
        amberHalo: 'rgba(246,167,35,0.28)',
      }
    : {
        text: '#14171c',
        text2: 'rgba(20,23,28,0.56)',
        text3: 'rgba(20,23,28,0.4)',
        icon: 'rgba(20,25,32,0.66)',
        danger: '#e2483d',
        green: '#3fae6b',
        micBg: 'rgba(110,168,255,0.16)',
        scrim: 'rgba(255,255,255,0.5)',
        routeCasing: '#ffffff',
        amberIcon: '#c07d12',
        amberTitle: '#8a5a08',
        amberText: 'rgba(120,80,20,0.85)',
        amberBg: 'rgba(255,247,232,0.62)',
        amberBorder: 'rgba(246,167,35,0.5)',
        amberHalo: 'rgba(246,167,35,0.28)',
      };

  const glass: Theme['glass'] = isDark
    ? {
        blurIntensity: 55,
        tint: 'dark',
        bg: 'rgba(26,30,37,0.5)',
        bgStrong: 'rgba(32,37,45,0.64)',
        border: 'rgba(255,255,255,0.16)',
        sheen: ['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)'],
        chipBg: 'rgba(34,39,47,0.5)',
        shadow: { color: '#000', opacity: 0.55, radius: 24, offsetY: 14, elevation: 12 },
      }
    : {
        blurIntensity: 42,
        tint: 'light',
        bg: 'rgba(255,255,255,0.52)',
        bgStrong: 'rgba(255,255,255,0.72)',
        border: 'rgba(255,255,255,0.78)',
        sheen: ['rgba(255,255,255,0.62)', 'rgba(255,255,255,0)'],
        chipBg: 'rgba(255,255,255,0.55)',
        shadow: { color: 'rgba(20,32,60,1)', opacity: 0.16, radius: 20, offsetY: 12, elevation: 8 },
      };

  return {
    scheme,
    isDark,
    platform,
    ios,
    accent,
    color,
    glass,
    font: FONT,
    radius: { pill: 26, card: 22, sheet: 28, chip: 23, sm: 14 },
  };
}
