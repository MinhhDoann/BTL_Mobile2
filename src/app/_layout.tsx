import { AuthProvider } from '@/src/contexts/auth';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/contexts/auth';
import { MiniPlayer } from '@/src/components/ui/mini-player';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="artist-studio" options={{ headerShown: false }} />
            <Stack.Screen name="playlist-detail" options={{ headerShown: false }} />
            <Stack.Screen name="song-detail" options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
          <MiniPlayer />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
