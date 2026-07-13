import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';

function ThemedStatusBar() {
  const t = useTheme();
  return <StatusBar style={t.isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
            <Stack.Screen name="index" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
