/**
 * The floating AI orb — a glass bead with a slowly rotating iridescent shimmer
 * and a soft glow. Tapping it opens the assistant.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

const SHIMMER = ['#6ea8ff', '#9b8cff', '#c98cff', '#8ce0ff', '#a0ffd8', '#6ea8ff'] as const;

export function AIOrb() {
  const t = useTheme();
  const openAI = useStore((s) => s.openAI);
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.linear }), -1, false);
  }, [spin]);

  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  return (
    <Pressable onPress={openAI} style={styles.wrap} hitSlop={10}>
      <View style={[styles.glow, { backgroundColor: t.accent }]} />
      <View style={[styles.glass, { borderColor: t.glass.border }]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={SHIMMER}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    opacity: 0.35,
    ...Platform.select({
      ios: { shadowColor: '#6ea8ff', shadowOpacity: 0.9, shadowRadius: 16 },
      android: { elevation: 10 },
      default: {},
    }),
  },
  glass: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    borderWidth: 1,
  },
  shimmer: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    left: '-50%',
    top: '-50%',
  },
});
