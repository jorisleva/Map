import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/** User query bubble, aligned to the trailing edge. */
export function ChatBubble({ text }: { text: string }) {
  const t = useTheme();
  return (
    <View style={styles.align}>
      <View style={[styles.bubble, { backgroundColor: t.accent }]}>
        <Text style={[styles.text, { fontFamily: t.font }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  align: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderBottomRightRadius: 6,
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '500', lineHeight: 19 },
});
