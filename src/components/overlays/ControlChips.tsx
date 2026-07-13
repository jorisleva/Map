/**
 * Right-hand glass control column: recenter on the user, toggle light/dark
 * ("layers"), and a compass that re-centers north-up.
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { GlassView } from '@/components/glass/GlassView';
import { toLngLat } from '@/lib/geo';
import { useStore } from '@/state/store';
import { useThemeContext } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';

function Chip({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  return (
    <Pressable onPress={onPress}>
      <GlassView radius={23} style={styles.chip}>
        <View style={styles.center}>{children}</View>
      </GlassView>
    </Pressable>
  );
}

export function ControlChips() {
  const t = useTheme();
  const { toggleScheme } = useThemeContext();
  const user = useStore((s) => s.userLocation);
  const flyTo = useStore((s) => s.flyTo);
  const setFollowUser = useStore((s) => s.setFollowUser);

  const recenter = () => {
    if (user) {
      flyTo(toLngLat(user), 16);
      setFollowUser(true);
    }
  };

  return (
    <View style={styles.col}>
      <Chip onPress={recenter}>
        <Icon name="locate" size={19} color={t.color.icon} />
      </Chip>
      <Chip onPress={toggleScheme}>
        <Icon name="layers" size={19} color={t.color.icon} />
      </Chip>
      <Chip onPress={recenter}>
        <Icon name="compass" size={19} color={t.color.icon} />
      </Chip>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 12 },
  chip: { width: 46, height: 46 },
  center: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
});
