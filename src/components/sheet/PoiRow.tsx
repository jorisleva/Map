/**
 * A single nearby-POI row: gradient thumb, name, meta, distance. Tapping selects
 * the place (→ place screen + map flyTo).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/glass/GlassView';
import { formatDistance } from '@/lib/geo';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';
import type { Place } from '@/state/types';

export function PoiRow({ place }: { place: Place }) {
  const t = useTheme();
  const selectPlace = useStore((s) => s.selectPlace);
  const thumb = t.isDark ? (['#33506a', '#22333f'] as const) : (['#cfe0ea', '#b7cdd9'] as const);

  return (
    <Pressable onPress={() => selectPlace(place)}>
      <GlassView radius={16} shadow={false} style={styles.row}>
        <View style={styles.inner}>
          <LinearGradient colors={thumb} style={styles.thumb} />
          <View style={styles.body}>
            <Text numberOfLines={1} style={[styles.name, { color: t.color.text, fontFamily: t.font }]}>
              {place.name}
            </Text>
            {!!place.meta && (
              <Text numberOfLines={1} style={[styles.meta, { color: t.color.text2, fontFamily: t.font }]}>
                {place.meta}
              </Text>
            )}
          </View>
          {place.distanceM != null && (
            <Text style={[styles.dist, { color: t.color.text2, fontFamily: t.font }]}>
              {formatDistance(place.distanceM)}
            </Text>
          )}
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {},
  inner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10 },
  thumb: { width: 42, height: 42, borderRadius: 12 },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  dist: { fontSize: 12, fontWeight: '600' },
});
