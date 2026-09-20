import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { ColorTokens, lightColors, darkColors, accentColorOptions } from './tokens';

const storage = new MMKV();

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  colors: ColorTokens;
  colorScheme: 'light' | 'dark';
  themeMode: ThemeMode;
  accentColor: string;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setColorScheme: (scheme: 'light' | 'dark' | 'auto') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (storage.getString('themeMode') as ThemeMode) || 'auto';
  });
  
  const [accentColor, setAccentColorState] = useState<string>(() => {
    return storage.getString('accentColor') || accentColorOptions[0].value;
  });

  const resolvedColorScheme: 'light' | 'dark' = 
    themeMode === 'auto' ? (deviceColorScheme ?? 'light') : themeMode;

  const colors = resolvedColorScheme === 'light' ? lightColors : darkColors;
  const isDark = resolvedColorScheme === 'dark';

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    storage.set('themeMode', mode);
  };

  const setColorScheme = (scheme: 'light' | 'dark' | 'auto') => {
    setThemeModeState(scheme);
    storage.set('themeMode', scheme);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    storage.set('accentColor', color);
  };

  return (
    <ThemeContext.Provider
      value={{
        colors: { ...colors, accent: accentColor },
        colorScheme: resolvedColorScheme,
        themeMode,
        accentColor,
        setThemeMode,
        setColorScheme,
        setAccentColor,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for getting themed colors directly
export function useThemedColors() {
  const { colors } = useTheme();
  return colors;
}
