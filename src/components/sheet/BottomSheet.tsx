/**
 * Draggable bottom sheet snapping between "peek" and "full". Drag position is a
 * Reanimated shared value (off the store); only the committed snap is stored.
 * A tiny drag reads as a tap and toggles the snap.
 */
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GlassView } from '@/components/glass/GlassView';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

const SPRING = { damping: 22, stiffness: 210, mass: 0.7 };

export function BottomSheet({ children }: { children: ReactNode }) {
  const t = useTheme();
  const { height } = useWindowDimensions();
  const snap = useStore((s) => s.sheetSnap);
  const setSheetSnap = useStore((s) => s.setSheetSnap);
  const toggleSheet = useStore((s) => s.toggleSheet);

  const sheetH = Math.min(height * 0.6, 540);
  const peekOffset = sheetH - 232; // how far down "peek" sits

  const ty = useSharedValue(snap === 'full' ? 0 : peekOffset);
  const start = useSharedValue(0);

  useEffect(() => {
    ty.value = withSpring(snap === 'full' ? 0 : peekOffset, SPRING);
  }, [snap, peekOffset, ty]);

  const pan = Gesture.Pan()
    .onStart(() => {
      start.value = ty.value;
    })
    .onUpdate((e) => {
      ty.value = Math.min(Math.max(start.value + e.translationY, 0), peekOffset);
    })
    .onEnd((e) => {
      if (Math.abs(e.translationY) < 6) {
        runOnJS(toggleSheet)();
        return;
      }
      const goFull = ty.value < peekOffset / 2 || e.velocityY < -600;
      ty.value = withSpring(goFull ? 0 : peekOffset, SPRING);
      runOnJS(setSheetSnap)(goFull ? 'full' : 'peek');
    });

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));

  return (
    <Animated.View style={[styles.wrap, { height: sheetH }, animated]}>
      <GlassView radius={28} strong style={styles.glass}>
        <GestureDetector gesture={pan}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: t.color.text3 }]} />
          </View>
        </GestureDetector>
        <View style={styles.body}>{children}</View>
      </GlassView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  glass: { flex: 1 },
  handleWrap: { paddingTop: 10, paddingBottom: 6, alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3 },
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 4 },
});
