import { Stack } from 'expo-router';
import { ThemeProvider } from '@theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from '@db/index';

// Initialize the database synchronously before any screen renders.
// This guarantees tables exist regardless of which route is opened first
// (deep links, direct navigation to /search, /biblioteca/[id], etc.).
initializeDatabase();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: '',
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
