import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, shadows } from '@theme/tokens';
import { Button } from '@components';
import { SubjectRepository } from '@db/repositories';
import { X, Save } from 'lucide-react-native';

export default function SubjectModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  
  const isEditing = !!id;
  const existingSubject = isEditing ? SubjectRepository.getById(id!) : null;

  const [name, setName] = useState(existingSubject?.name || '');
  const [selectedColor, setSelectedColor] = useState(existingSubject?.color || colors.accent);

  const colorOptions = [
    '#007AFF', // Blue
    '#AF52DE', // Purple
    '#FF2D55', // Pink
    '#FF9500', // Orange
    '#34C759', // Green
    '#5AC8FA', // Teal
    '#5856D6', // Indigo
    '#FF3B30', // Red
  ];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, insira um nome para a disciplina.');
      return;
    }

    if (isEditing && existingSubject) {
      SubjectRepository.update(existingSubject.id, { name: name.trim(), color: selectedColor });
    } else {
      SubjectRepository.create(name.trim(), selectedColor);
    }

    router.back();
  };

  const handleDelete = () => {
    if (!isEditing || !existingSubject) return;

    Alert.alert(
      'Eliminar Disciplina',
      `Tem certeza que deseja eliminar "${existingSubject.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            SubjectRepository.delete(existingSubject.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Cancelar">
          <X size={28} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}
        </Text>
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
            placeholder="Ex: Matemática, História, Programação..."
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
          />
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Cor</Text>
          <View style={styles.colorGrid}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
                accessibilityLabel={`Selecionar cor ${color}`}
              >
                {selectedColor === color && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delete Button (only when editing) */}
        {isEditing && (
          <View style={styles.deleteSection}>
            <Button
              variant="danger"
              title="Eliminar Disciplina"
              onPress={handleDelete}
              fullWidth
            />
          </View>
        )}

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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorOption: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  deleteSection: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,59,48,0.3)',
  },
});
