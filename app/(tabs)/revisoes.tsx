import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing } from '@theme/tokens';
import { Repeat } from 'lucide-react-native';
import { EmptyState } from '@components/EmptyState';

export default function RevisoesScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <EmptyState
        icon={Repeat}
        title="Nenhuma revisão pendente"
        description="Quando você tiver conceitos para revisar, eles aparecerão aqui"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
});
