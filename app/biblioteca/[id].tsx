import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, shadows } from '@theme/tokens';
import { Card, EmptyState } from '@components';
import { TopicRepository, ConceptRepository } from '@db/repositories';
import { ChevronRight, BookOpen, Folder, Plus } from 'lucide-react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [topics, setTopics] = useState(TopicRepository.getAll(id));

  useEffect(() => {
    refreshData();
  }, [id]);

  const refreshData = () => {
    setTopics(TopicRepository.getAll(id));
  };

  const handleDeleteTopic = (topicId: string, topicName: string) => {
    Alert.alert(
      'Eliminar Matéria',
      `Tem certeza que deseja eliminar "${topicName}"? Todos os conceitos associados serão eliminados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            TopicRepository.delete(topicId);
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
        <Link href="/biblioteca" asChild>
          <TouchableOpacity accessibilityLabel="Voltar">
            <ChevronRight size={28} color={colors.textPrimary} strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </Link>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Matérias</Text>
        <Link href={`/modal/topic?subjectId=${id}`} asChild>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            accessibilityLabel="Adicionar matéria"
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Topics List */}
      {topics.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Nenhuma matéria"
          description="Adicione uma matéria para organizar os conceitos desta disciplina."
          actionLabel="Adicionar matéria"
          onAction={() => router.push(`/modal/topic?subjectId=${id}`)}
        />
      ) : (
        <View style={styles.content}>
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onDelete={() => handleDeleteTopic(topic.id, topic.name)}
            />
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

interface TopicCardProps {
  topic: any;
  onDelete: () => void;
}

function TopicCard({ topic, onDelete }: TopicCardProps) {
  const { colors } = useTheme();
  const concepts = ConceptRepository.getAll(topic.id);

  return (
    <Card style={styles.card}>
      <Link href={`/conceitos?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`} asChild>
        <TouchableOpacity style={styles.cardContent} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <BookOpen size={24} color={colors.accent} strokeWidth={2} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {topic.name}
            </Text>
            {topic.description ? (
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {topic.description}
              </Text>
            ) : (
              <Text style={[styles.cardSubtitle, { color: colors.textTertiary }]}>
                {concepts.length} conceito{concepts.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
        </TouchableOpacity>
      </Link>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          accessibilityLabel={`Eliminar ${topic.name}`}
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
