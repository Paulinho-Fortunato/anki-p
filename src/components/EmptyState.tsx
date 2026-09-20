/**
 * Empty State Component
 * For displaying empty states with icon and message
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing } from '@theme/tokens';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, actionLabel, onAction, compact = false }: EmptyStateProps) {
  const { colors } = useTheme();

  const defaultAction = actionLabel && onAction ? (
    <TouchableOpacity onPress={onAction} style={styles.actionButton}>
      <Text style={[styles.actionText, { color: colors.accent }]}>{actionLabel}</Text>
    </TouchableOpacity>
  ) : null;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }, compact && styles.iconContainerCompact]}>
        <Icon size={compact ? 32 : 48} color={colors.textTertiary} strokeWidth={1.5} />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact, { color: colors.textPrimary }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, compact && styles.descriptionCompact, { color: colors.textSecondary }]}>{description}</Text>
      )}
      {action || defaultAction}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  action: {
    marginTop: spacing.md,
  },
  actionButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  actionText: {
    ...typography.body,
    fontWeight: '600',
  },
  containerCompact: {
    padding: spacing.lg,
  },
  iconContainerCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.md,
  },
  titleCompact: {
    ...typography.title2,
  },
  descriptionCompact: {
    ...typography.subheadline,
    paddingHorizontal: spacing.md,
  },
});
