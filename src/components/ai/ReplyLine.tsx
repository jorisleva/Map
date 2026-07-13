import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/** Assistant reply text, aligned to the leading edge. */
export function ReplyLine({ text }: { text: string }) {
  const t = useTheme();
  return <Text style={[styles.reply, { color: t.color.text, fontFamily: t.font }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  reply: { fontSize: 14, lineHeight: 20, alignSelf: 'flex-start', maxWidth: '96%' },
});
