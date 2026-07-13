/**
 * Bottom navigation panel: arrival clock, remaining time · distance, and the red
 * "Terminer" button that ends the route.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/glass/GlassView';
import { navSummary } from '@/state/selectors';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

export function NavBottomPanel() {
  const t = useTheme();
  const route = useStore((s) => s.route);
  const stepIndex = useStore((s) => s.stepIndex);
  const endRoute = useStore((s) => s.endRoute);
  const { eta, line } = navSummary(route, stepIndex);

  return (
    <GlassView radius={26} strong style={styles.panel}>
      <View style={styles.row}>
        <View>
          <Text style={[styles.eta, { color: t.color.text, fontFamily: t.font }]}>{eta}</Text>
          <Text style={[styles.meta, { color: t.color.text2, fontFamily: t.font }]}>{line}</Text>
        </View>
        <Pressable style={[styles.end, { backgroundColor: t.color.danger }]} onPress={endRoute}>
          <Text style={styles.endText}>Terminer</Text>
        </Pressable>
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  panel: { paddingVertical: 14, paddingLeft: 20, paddingRight: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eta: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  meta: { fontSize: 14, fontWeight: '500', marginTop: 5 },
  end: { paddingVertical: 11, paddingHorizontal: 20, borderRadius: 22 },
  endText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
