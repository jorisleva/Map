/**
 * Place detail shown in the sheet: name, rating·category·hours, photo strip, and
 * the action row (Itinéraire computes a route, Appeler dials, Enregistrer saves).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

export function PlaceDetail() {
  const t = useTheme();
  const place = useStore((s) => s.selectedPlace);
  const startRoute = useStore((s) => s.startRoute);
  const navStatus = useStore((s) => s.navStatus);
  if (!place) return null;

  const photo = t.isDark ? (['#3a4650', '#252c33'] as const) : (['#d8ded6', '#c3ccc2'] as const);
  const ghostBg = t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(20,25,32,0.06)';
  const metaLine =
    [
      place.rating != null ? place.rating.toFixed(1).replace('.', ',') : null,
      place.category,
      place.hours,
    ]
      .filter(Boolean)
      .join(' · ') || place.category;

  const call = () => {
    if (place.phone) Linking.openURL(`tel:${place.phone.replace(/\s/g, '')}`);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={[styles.name, { color: t.color.text, fontFamily: t.font }]}>{place.name}</Text>

      <View style={styles.metaRow}>
        <View style={[styles.dot, { backgroundColor: t.color.green }]} />
        <Text style={[styles.meta, { color: t.color.text2, fontFamily: t.font }]}>{metaLine}</Text>
      </View>

      <View style={styles.photos}>
        {[0, 1, 2].map((i) => (
          <LinearGradient key={i} colors={photo} style={styles.photo} />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.primary, { backgroundColor: t.accent }]} onPress={() => startRoute()}>
          <Text style={styles.primaryText}>{navStatus === 'loading' ? 'Calcul…' : 'Itinéraire'}</Text>
        </Pressable>
        <Pressable style={[styles.ghost, { backgroundColor: ghostBg }]} onPress={call}>
          <Text style={[styles.ghostText, { color: t.color.text, fontFamily: t.font }]}>Appeler</Text>
        </Pressable>
        <Pressable style={[styles.ghost, { backgroundColor: ghostBg }]}>
          <Text style={[styles.ghostText, { color: t.color.text, fontFamily: t.font }]}>Enregistrer</Text>
        </Pressable>
      </View>

      {!!place.address && (
        <Text style={[styles.addr, { color: t.color.text2, fontFamily: t.font }]}>{place.address}</Text>
      )}
      {navStatus === 'error' && (
        <Text style={[styles.err, { color: t.color.danger, fontFamily: t.font }]}>
          Itinéraire indisponible. Réessayez.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  meta: { fontSize: 13, fontWeight: '500' },
  photos: { flexDirection: 'row', gap: 8, marginTop: 16 },
  photo: { flex: 1, height: 92, borderRadius: 14 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 16 },
  primary: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14 },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  ghost: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14 },
  ghostText: { fontSize: 13, fontWeight: '600' },
  addr: { fontSize: 13, marginTop: 16, lineHeight: 18 },
  err: { fontSize: 13, marginTop: 10 },
});
