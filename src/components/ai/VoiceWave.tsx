/** Animated 5-bar "listening" waveform. */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

function Bar({ delay, color }: { delay: number; color: string }) {
  const v = useSharedValue(0.35);
  useEffect(() => {
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration: 520 }), -1, true));
  }, [delay, v]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: v.value }] }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

export function VoiceWave({ color }: { color: string }) {
  return (
    <View style={styles.wrap}>
      {[0, 130, 260, 390, 520].map((d, i) => (
        <Bar key={i} delay={d} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 22 },
  bar: { width: 3.5, height: 22, borderRadius: 3 },
});
