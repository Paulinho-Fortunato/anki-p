import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, shadows } from '@theme/tokens';
import { Card, EmptyState } from '@components';
import { ConceptRepository } from '@db/repositories';
import { Plus, ChevronRight, BookOpen, Folder } from 'lucide-react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';

export default function ConceitosScreen() {
  const { topicId, topicName } = useLocalSearchParams<{ topicId: string; topicName: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [concepts, setConcepts] = useState(ConceptRepository.getAll(topicId));

  useEffect(() => {
    refreshData();
  }, [topicId]);

  const refreshData = () => {
    setConcepts(ConceptRepository.getAll(topicId));
  };

  const handleDeleteConcept = (conceptId: string, conceptTitle: string) => {
    Alert.alert(
      'Eliminar Conceito',
      `Tem certeza que deseja eliminar "${conceptTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            ConceptRepository.delete(conceptId);
            refreshData();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Link href={`/biblioteca/${topicId}`} asChild>
          <TouchableOpacity accessibilityLabel="Voltar">
            <ChevronRight size={28} color={colors.textPrimary} strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </Link>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {decodeURIComponent(topicName || 'Conceitos')}
        </Text>
        <Link href={`/modal/concept?topicId=${topicId}`} asChild>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            accessibilityLabel="Adicionar conceito"
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Concepts List */}
      {concepts.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Nenhum conceito"
          description="Adicione um conceito para começar a estudar este tópico."
          actionLabel="Adicionar conceito"
          onAction={() => router.push(`/modal/concept?topicId=${topicId}`)}
        />
      ) : (
        <View style={styles.content}>
          {concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              onDelete={() => handleDeleteConcept(concept.id, concept.title)}
            />
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

interface ConceptCardProps {
  concept: any;
  onDelete: () => void;
}

function ConceptCard({ concept, onDelete }: ConceptCardProps) {
  const { colors } = useTheme();
  const hasReview = !!concept.next_review_at;
  const isDue = concept.next_review_at && new Date(concept.next_review_at) <= new Date();

  return (
    <Card style={styles.card}>
      <Link href={`/modal/concept?id=${concept.id}&topicId=${concept.topic_id}`} asChild>
        <TouchableOpacity style={styles.cardContent} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <BookOpen size={24} color={colors.accent} strokeWidth={2} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {concept.title}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {concept.explanation?.substring(0, 60) || 'Sem explicação'}
              {concept.explanation && concept.explanation.length > 60 ? '...' : ''}
            </Text>
          </View>
          {isDue && (
            <View style={[styles.dueBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.dueText, { color: colors.warning }]}>Revisar</Text>
            </View>
          )}
          {!hasReview && (
            <View style={[styles.newBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.newText, { color: colors.success }]}>Novo</Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          accessibilityLabel={`Eliminar ${concept.title}`}
        >
          <Text style={[styles.deleteText, { color: colors.error }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
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
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title2,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.footnote,
  },
  dueBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  dueText: {
    ...typography.caption,
    fontWeight: '600',
  },
  newBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  newText: {
    ...typography.caption,
    fontWeight: '600',
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  deleteButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-end',
  },
  deleteText: {
    ...typography.footnote,
    fontWeight: '600',
  },
});
