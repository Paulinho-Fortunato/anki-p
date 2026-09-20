import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, shadows } from '@theme/tokens';
import { Button } from '@components';
import { TopicRepository } from '@db/repositories';
import { X, Save } from 'lucide-react-native';

export default function TopicModal() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, insira um nome para a matéria.');
      return;
    }

    if (!subjectId) {
      Alert.alert('Erro', 'Disciplina não encontrada.');
      return;
    }

    TopicRepository.create(subjectId, name.trim(), description.trim() || undefined);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Cancelar">
          <X size={28} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Nova Matéria</Text>
        <TouchableOpacity onPress={handleSave} accessibilityLabel="Guardar">
          <Save size={28} color={colors.accent} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Name Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Nome</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.textPrimary 
              },
            ]}
            placeholder="Ex: Álgebra, Idade Média, React Native..."
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Descrição (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.textPrimary 
              },
            ]}
            placeholder="Breve descrição do conteúdo..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.headline,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginVertical: spacing.xl,
  },
  label: {
    ...typography.subheadline,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.lg,
  },
});
