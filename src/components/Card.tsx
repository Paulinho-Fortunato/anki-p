/**
 * Reusable Card Component
 * Apple-inspired card design with subtle shadows
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { borderRadius, shadows, spacing } from '@theme/tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  onPress,
  accessibilityLabel,
}: CardProps) {
  const { colors } = useTheme();

  const cardStyles = [
    styles.base,
    { backgroundColor: colors.surface },
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && [styles.outlined, { borderColor: colors.border }],
    padding !== 'none' && styles[`${padding}Padding`],
    style,
  ];

  if (onPress) {
    return (
      <View
        style={cardStyles}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={cardStyles} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
  },
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: spacing.sm,
  },
  mediumPadding: {
    padding: spacing.lg,
  },
  largePadding: {
    padding: spacing.xxl,
  },
});
