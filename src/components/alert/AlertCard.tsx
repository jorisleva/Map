/**
 * The amber "Zone de vigilance" safety card with a soft glow halo. Tapping it
 * dismisses. Rendered as an overlay above the current screen.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

export function AlertCard() {
  const t = useTheme();
  const alert = useStore((s) => s.alert);
  const dismiss = useStore((s) => s.dismissAlert);
  if (!alert) return null;

  return (
    <Pressable style={styles.wrap} onPress={dismiss}>
      <View style={[styles.halo, { backgroundColor: t.color.amberHalo }]} />
      <View style={[styles.card, { backgroundColor: t.color.amberBg, borderColor: t.color.amberBorder }]}>
        <View style={[styles.icon, { backgroundColor: 'rgba(246,167,35,0.22)' }]}>
          <Icon name="alert" size={20} color={t.color.amberIcon} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, { color: t.color.amberTitle, fontFamily: t.font }]}>{alert.title}</Text>
          {!!alert.body && (
            <Text style={[styles.text, { color: t.color.amberText, fontFamily: t.font }]}>{alert.body}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'stretch' },
  halo: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: -14,
    height: 150,
    borderRadius: 80,
    opacity: 0.9,
  },
  card: {
    flexDirection: 'row',
    gap: 13,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  text: { fontSize: 13, lineHeight: 18, marginTop: 4 },
});
