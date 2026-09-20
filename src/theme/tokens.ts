/**
 * Design System Tokens
 * Inspired by Apple design principles: simplicity, clarity, hierarchy
 */

export type ColorScheme = 'light' | 'dark';

export interface ColorTokens {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Borders & Dividers
  border: string;
  borderSubtle: string;
  
  // Semantic Colors
  accent: string;
  success: string;
  warning: string;
  error: string;
  
  // Overlays
  overlay: string;
}

export const lightColors: ColorTokens = {
  background: '#FFFFFF',
  surface: '#F5F5F7',
  surfaceSecondary: '#EFEFF4',
  textPrimary: '#1D1D1F',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',
  border: '#D2D2D7',
  borderSubtle: '#E5E5EA',
  accent: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const darkColors: ColorTokens = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  border: '#38383A',
  borderSubtle: '#2C2C2E',
  accent: '#0A84FF',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// Accent color options for user customization
export const accentColorOptions = [
  { name: 'Blue', value: '#007AFF' },
  { name: 'Purple', value: '#AF52DE' },
  { name: 'Pink', value: '#FF2D55' },
  { name: 'Orange', value: '#FF9500' },
  { name: 'Green', value: '#34C759' },
  { name: 'Teal', value: '#5AC8FA' },
  { name: 'Indigo', value: '#5856D6' },
  { name: 'Red', value: '#FF3B30' },
];

// Typography scale (based on Apple's Human Interface Guidelines)
export const typography = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' as const },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadow definitions
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Touch target minimum (Apple HIG: 44x44pt)
export const touchTargetSize = 44;

// Animation durations
export const animationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
};
