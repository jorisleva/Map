/**
 * "Où allez-vous ?" glass pill. Live Photon type-ahead as you type; Nominatim on
 * submit; the mic button opens the AI assistant.
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { GlassView } from '@/components/glass/GlassView';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { suggest } from '@/services/geocode/photon';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/useTheme';

export function SearchPill() {
  const t = useTheme();
  const query = useStore((s) => s.searchQuery);
  const suggestions = useStore((s) => s.suggestions);
  const setQuery = useStore((s) => s.setQuery);
  const setSuggestions = useStore((s) => s.setSuggestions);
  const submitSearch = useStore((s) => s.submitSearch);
  const pickSuggestion = useStore((s) => s.pickSuggestion);
  const openAI = useStore((s) => s.openAI);
  const user = useStore((s) => s.userLocation);
  const [focused, setFocused] = useState(false);
  const debounced = useDebouncedValue(query, 280);

  useEffect(() => {
    let active = true;
    if (debounced.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    suggest(debounced, user)
      .then((s) => active && setSuggestions(s))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [debounced, user, setSuggestions]);

  return (
    <View>
      <GlassView radius={26} strong style={styles.pill}>
        <View style={styles.row}>
          <Icon name="search" size={17} color={t.color.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onSubmitEditing={() => submitSearch(query)}
            placeholder="Où allez-vous ?"
            placeholderTextColor={t.color.text2}
            returnKeyType="search"
            style={[styles.input, { color: t.color.text, fontFamily: t.font }]}
          />
          <Pressable
            onPress={openAI}
            hitSlop={8}
            style={[styles.mic, { backgroundColor: t.color.micBg }]}
          >
            <Icon name="mic" size={16} color={t.accent} />
          </Pressable>
        </View>
      </GlassView>

      {focused && suggestions.length > 0 && (
        <GlassView radius={20} strong style={styles.dropdown}>
          {suggestions.map((s) => (
            <Pressable key={s.id} onPress={() => pickSuggestion(s)} style={styles.sugg}>
              <Icon name="search" size={14} color={t.color.text3} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.suggLabel, { color: t.color.text, fontFamily: t.font }]}>
                  {s.label}
                </Text>
                {!!s.sub && (
                  <Text numberOfLines={1} style={[styles.suggSub, { color: t.color.text2, fontFamily: t.font }]}>
                    {s.sub}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </GlassView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { height: 52 },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 8 },
  input: { flex: 1, fontSize: 16, height: 52, paddingVertical: 0 },
  mic: { width: 38, height: 38, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dropdown: { marginTop: 8, paddingVertical: 6 },
  sugg: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 11 },
  suggLabel: { fontSize: 14, fontWeight: '600' },
  suggSub: { fontSize: 12, marginTop: 2 },
});
