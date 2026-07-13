/**
 * "À proximité" — title, a status subtitle, and the scrollable list of nearby
 * POIs fetched from Overpass.
 */
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

import { PoiRow } from './PoiRow';

export function NearbyList() {
  const t = useTheme();
  const nearby = useStore((s) => s.nearby);
  const status = useStore((s) => s.nearbyStatus);

  const subtitle =
    status === 'loading'
      ? 'Recherche des lieux autour de vous…'
      : status === 'error'
        ? 'Recherche indisponible pour le moment'
        : `${nearby.length} lieux autour de vous`;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: t.color.text, fontFamily: t.font }]}>À proximité</Text>
      <Text style={[styles.sub, { color: t.color.text2, fontFamily: t.font }]}>{subtitle}</Text>

      {status === 'loading' && nearby.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={t.accent} />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {nearby.map((p) => (
            <PoiRow key={p.id} place={p} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  sub: { fontSize: 13, marginTop: 3, marginBottom: 14 },
  list: { flex: 1 },
  listContent: { gap: 9, paddingBottom: 28 },
});
