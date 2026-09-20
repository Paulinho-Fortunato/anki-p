import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, shadows } from '@theme/tokens';
import { Button } from '@components';
import { ConceptRepository } from '@db/repositories';
import { X, Save, BookOpen } from 'lucide-react-native';

export default function ConceptModal() {
  const router = useRouter();
  const { id, topicId } = useLocalSearchParams<{ id?: string; topicId: string }>();
  const { colors } = useTheme();
  
  const isEditing = !!id;
  const existingConcept = isEditing ? ConceptRepository.getById(id!) : null;

  const [title, setTitle] = useState(existingConcept?.title || '');
  const [explanation, setExplanation] = useState(existingConcept?.explanation || '');
  const [question, setQuestion] = useState(existingConcept?.question || '');
  const [answer, setAnswer] = useState(existingConcept?.answer || '');
  const [notes, setNotes] = useState(existingConcept?.notes || '');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Por favor, insira um título para o conceito.');
      return;
    }

    const targetTopicId = topicId || existingConcept?.topic_id;
    if (!targetTopicId) {
      Alert.alert('Erro', 'Matéria não encontrada.');
      return;
    }

    if (isEditing && existingConcept) {
      ConceptRepository.update(existingConcept.id, {
        title: title.trim(),
        explanation: explanation.trim() || undefined,
        question: question.trim() || undefined,
        answer: answer.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      ConceptRepository.create(targetTopicId, title.trim(), {
        explanation: explanation.trim() || undefined,
        question: question.trim() || undefined,
        answer: answer.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!isEditing || !existingConcept) return;

    Alert.alert(
      'Eliminar Conceito',
      `Tem certeza que deseja eliminar "${existingConcept.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            ConceptRepository.delete(existingConcept.id);
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
          {isEditing ? 'Editar Conceito' : 'Novo Conceito'}
        </Text>
        <TouchableOpacity onPress={handleSave} accessibilityLabel="Guardar">
          <Save size={28} color={colors.accent} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Título</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.textPrimary 
              },
            ]}
            placeholder="Ex: Teorema de Pitágoras, Revolução Francesa..."
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus
            autoCapitalize="sentences"
          />
        </View>

        {/* Explanation Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Explicação</Text>
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
            placeholder="Explique o conceito com suas palavras..."
            placeholderTextColor={colors.textTertiary}
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Question for Active Recall */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Pergunta (para recuperação ativa)
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.textPrimary 
              },
            ]}
            placeholder="Ex: Qual é a fórmula do Teorema de Pitágoras?"
            placeholderTextColor={colors.textTertiary}
            value={question}
            onChangeText={setQuestion}
            autoCapitalize="sentences"
          />
        </View>

        {/* Answer for Active Recall */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Resposta (oculta até revelar)
          </Text>
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
            placeholder="A resposta que deve lembrar..."
            placeholderTextColor={colors.textTertiary}
            value={answer}
            onChangeText={setAnswer}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Notas adicionais</Text>
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
            placeholder="Informações extras, dicas, referências..."
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Delete Button (only when editing) */}
        {isEditing && (
          <View style={styles.deleteSection}>
            <Button
              variant="danger"
              title="Eliminar Conceito"
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
    marginVertical: spacing.lg,
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
  deleteSection: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,59,48,0.3)',
  },
});
