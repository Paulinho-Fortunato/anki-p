import { Stack } from 'expo-router';
import { ThemeProvider } from '@theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
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
  );
}
