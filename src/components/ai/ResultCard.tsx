/** A place returned by the assistant's search tool. Tapping opens the place. */
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/glass/GlassView';
import { formatDistance } from '@/lib/geo';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';
import type { Place } from '@/state/types';

export function ResultCard({ place }: { place: Place }) {
  const t = useTheme();
  const selectPlace = useStore((s) => s.selectPlace);
  const meta = [place.meta, place.distanceM != null ? formatDistance(place.distanceM) : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable onPress={() => selectPlace(place)}>
      <GlassView radius={16} shadow={false} style={styles.card}>
        <View style={styles.inner}>
          <LinearGradient colors={[t.accent, '#9b8cff']} style={styles.thumb} />
          <View style={styles.body}>
            <Text numberOfLines={1} style={[styles.name, { color: t.color.text, fontFamily: t.font }]}>
              {place.name}
            </Text>
            {!!meta && (
              <Text numberOfLines={1} style={[styles.meta, { color: t.color.text2, fontFamily: t.font }]}>
                {meta}
              </Text>
            )}
          </View>
          <Text style={[styles.go, { color: t.accent }]}>→</Text>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  inner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14 },
  thumb: { width: 40, height: 40, borderRadius: 11 },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  go: { fontSize: 18, fontWeight: '600' },
});
