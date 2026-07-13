/**
 * The assistant panel: header, the conversation (user bubbles + assistant
 * replies), the structured result cards from the search tool, and the input pill
 * with the animated listening wave. Tapping the handle returns to browse.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Icon } from '@/components/common/Icon';
import { GlassView } from '@/components/glass/GlassView';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

import { ChatBubble } from './ChatBubble';
import { ReplyLine } from './ReplyLine';
import { ResultCard } from './ResultCard';
import { VoiceWave } from './VoiceWave';

const SHIMMER = ['#6ea8ff', '#9b8cff', '#c98cff', '#8ce0ff', '#a0ffd8', '#6ea8ff'] as const;

export function AIPanel() {
  const t = useTheme();
  const { height } = useWindowDimensions();
  const conversation = useStore((s) => s.conversation);
  const aiStatus = useStore((s) => s.aiStatus);
  const aiCards = useStore((s) => s.aiCards);
  const sendUserMessage = useStore((s) => s.sendUserMessage);
  const goBrowse = useStore((s) => s.goBrowse);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    void sendUserMessage(value);
  };

  const statusText =
    aiStatus === 'thinking' ? 'réfléchit…' : aiStatus === 'error' ? 'hors ligne' : "à l'écoute";
  const panelH = Math.min(height * 0.72, 620);
  const inputBg = t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(20,25,32,0.05)';

  return (
    <View style={[styles.wrap, { height: panelH }]} pointerEvents="box-none">
      <GlassView radius={30} strong style={styles.glass}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.handleWrap} onPress={goBrowse}>
            <View style={[styles.handle, { backgroundColor: t.color.text3 }]} />
          </Pressable>

          <View style={styles.head}>
            <View style={styles.headOrb}>
              <LinearGradient colors={SHIMMER} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            </View>
            <Text style={[styles.headText, { color: t.color.text, fontFamily: t.font }]}>
              Assistant · {statusText}
            </Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {conversation.length === 0 && (
              <Text style={[styles.hint, { color: t.color.text2, fontFamily: t.font }]}>
                Demandez par exemple : « parking pas cher ouvert maintenant près de la gare ».
              </Text>
            )}
            {conversation.map((m, i) =>
              m.role === 'user' ? <ChatBubble key={i} text={m.content} /> : <ReplyLine key={i} text={m.content} />,
            )}
            {aiStatus === 'thinking' && <ActivityIndicator color={t.accent} style={styles.thinking} />}
            {aiCards.length > 0 && (
              <View style={styles.cards}>
                {aiCards.map((c) => (
                  <ResultCard key={c.id} place={c} />
                ))}
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputPill, { backgroundColor: inputBg, borderColor: t.glass.border }]}>
            <VoiceWave color={t.accent} />
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={submit}
              placeholder="Parlez ou tapez votre demande…"
              placeholderTextColor={t.color.text2}
              returnKeyType="send"
              style={[styles.input, { color: t.color.text, fontFamily: t.font }]}
            />
            <Pressable onPress={submit} hitSlop={8}>
              <Icon name="arrow-right" size={20} color={t.accent} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  glass: { flex: 1 },
  flex: { flex: 1 },
  handleWrap: { paddingTop: 10, paddingBottom: 6, alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 18, marginBottom: 12 },
  headOrb: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },
  headText: { fontSize: 15, fontWeight: '600' },
  scroll: { paddingHorizontal: 18, paddingBottom: 14, gap: 12 },
  hint: { fontSize: 14, lineHeight: 20 },
  thinking: { alignSelf: 'flex-start' },
  cards: { gap: 9, marginTop: 2 },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 18,
    marginBottom: 20,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 0 },
});
