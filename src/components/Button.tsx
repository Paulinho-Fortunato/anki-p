/**
 * Reusable Button Component
 * Apple-inspired design with proper touch targets
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, touchTargetSize } from '@theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
  fullWidth = false,
}: ButtonProps) {
  const { colors } = useTheme();

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled, busy: loading }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor(variant)} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function getTextColor(variant: string): string {
  switch (variant) {
    case 'primary':
      return '#FFFFFF';
    case 'secondary':
      return '#007AFF';
    case 'tertiary':
      return '#007AFF';
    case 'danger':
      return '#FFFFFF';
    default:
      return '#007AFF';
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  smallSize: {
    minHeight: touchTargetSize - 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  mediumSize: {
    minHeight: touchTargetSize,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  largeSize: {
    minHeight: touchTargetSize + 8,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  tertiaryText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  smallText: {
    ...typography.subheadline,
  },
  mediumText: {
    ...typography.body,
  },
  largeText: {
    ...typography.headline,
  },
  disabledText: {
    opacity: 0.7,
  },
});
