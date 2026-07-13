/**
 * Top turn-by-turn banner: maneuver glyph on the accent tile, the live distance
 * to the next turn, the street, and a secondary "Puis …" preview of the step
 * after. Tapping advances the step (handy for demos without GPS movement).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { GlassView } from '@/components/glass/GlassView';
import { bannerDistance, currentStep, nextStep } from '@/state/selectors';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

export function ManeuverBanner() {
  const t = useTheme();
  const route = useStore((s) => s.route);
  const stepIndex = useStore((s) => s.stepIndex);
  const user = useStore((s) => s.userLocation);
  const advanceStep = useStore((s) => s.advanceStep);

  const step = currentStep(route, stepIndex);
  const next = nextStep(route, stepIndex);
  if (!step) return null;

  return (
    <View>
      <Pressable onPress={advanceStep}>
        <GlassView radius={24} strong style={styles.banner}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: t.accent }]}>
              <Icon name="maneuver" size={30} color="#fff" />
            </View>
            <View style={styles.text}>
              <Text style={[styles.dist, { color: t.color.text, fontFamily: t.font }]}>
                {bannerDistance(route, stepIndex, user)}
              </Text>
              <Text numberOfLines={1} style={[styles.street, { color: t.color.text2, fontFamily: t.font }]}>
                {step.name || step.instruction}
              </Text>
            </View>
          </View>
        </GlassView>
      </Pressable>
      {next && (
        <Text numberOfLines={1} style={[styles.then, { color: t.color.text2, fontFamily: t.font }]}>
          Puis <Text style={{ color: t.color.text, fontWeight: '700' }}>{next.instruction}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingVertical: 14, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  dist: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  street: { fontSize: 15, fontWeight: '500', marginTop: 4 },
  then: { fontSize: 13, marginTop: 10, paddingHorizontal: 8 },
});
