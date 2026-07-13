/**
 * The Liquid Glass surface used by every floating panel. On iOS 26+ it uses the
 * real system glass (expo-glass-effect); everywhere else it reproduces the
 * design's recipe: expo-blur backdrop + translucent tint + hairline border +
 * diagonal "sheen" highlight + drop shadow. One API, consistent look.
 */
import { BlurView } from 'expo-blur';
import { GlassView as ExpoGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

const HAIRLINE = StyleSheet.hairlineWidth;
const USE_NATIVE_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

export interface GlassViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** border radius of the surface */
  radius?: number;
  /** stronger, more opaque fill for foreground panels (sheets, banners) */
  strong?: boolean;
  /** show the diagonal top-left highlight (default true) */
  sheen?: boolean;
  /** hairline border (default true) */
  border?: boolean;
  /** custom fill color (e.g. the amber alert card) — replaces the glass tint */
  fill?: string;
  /** custom border color (e.g. amber) */
  borderColor?: string;
  /** drop shadow (default true) */
  shadow?: boolean;
  /** iOS-26 interactive glass */
  interactive?: boolean;
}

export function GlassView({
  children,
  style,
  radius = 22,
  strong = false,
  sheen = true,
  border = true,
  fill,
  borderColor,
  shadow = true,
  interactive = false,
}: GlassViewProps) {
  const t = useTheme();
  const fillColor = fill ?? (strong ? t.glass.bgStrong : t.glass.bg);
  const bColor = borderColor ?? t.glass.border;

  const shadowStyle: ViewStyle = shadow
    ? {
        shadowColor: t.glass.shadow.color,
        shadowOpacity: t.glass.shadow.opacity,
        shadowRadius: t.glass.shadow.radius,
        shadowOffset: { width: 0, height: t.glass.shadow.offsetY },
        elevation: t.glass.shadow.elevation,
      }
    : {};

  // iOS 26: use the real system Liquid Glass as the surface.
  if (USE_NATIVE_GLASS && !fill) {
    return (
      <View style={[{ borderRadius: radius }, shadowStyle, style]}>
        <ExpoGlassView
          glassEffectStyle="regular"
          isInteractive={interactive}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
        {border && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: radius, borderWidth: HAIRLINE, borderColor: bColor },
            ]}
          />
        )}
        <View style={{ borderRadius: radius }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[{ borderRadius: radius }, shadowStyle, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            overflow: 'hidden',
            borderWidth: border ? HAIRLINE : 0,
            borderColor: bColor,
          },
        ]}
      >
        <BlurView
          intensity={t.glass.blurIntensity}
          tint={t.glass.tint}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fillColor }]} />
        {sheen && (
          <LinearGradient
            colors={[t.glass.sheen[0], t.glass.sheen[1]]}
            locations={[0, 0.5]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
      <View style={{ borderRadius: radius }}>{children}</View>
    </View>
  );
}
