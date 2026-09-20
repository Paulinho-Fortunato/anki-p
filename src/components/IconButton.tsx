/**
 * Reusable IconButton Component
 * Uses Lucide icons exclusively (no emojis)
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { touchTargetSize, borderRadius } from '@theme/tokens';
import type { LucideIcon } from 'lucide-react-native';

interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export function IconButton({
  icon: Icon,
  onPress,
  size = 24,
  variant = 'default',
  disabled = false,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();

  const buttonStyles = [
    styles.base,
    variant === 'primary' && { backgroundColor: colors.accent },
    variant === 'danger' && { backgroundColor: colors.error },
    variant === 'ghost' && styles.ghost,
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={buttonStyles}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Icon
        size={size}
        color={getIconColor(variant, colors.textPrimary, colors.surface)}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}

function getIconColor(variant: string, defaultColor: string, backgroundColor: string): string {
  switch (variant) {
    case 'primary':
      return '#FFFFFF';
    case 'danger':
      return '#FFFFFF';
    case 'ghost':
      return defaultColor;
    default:
      return defaultColor;
  }
}

const styles = StyleSheet.create({
  base: {
    width: touchTargetSize,
    height: touchTargetSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
});
