import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, shadows } from '@theme/tokens';
import { Card, EmptyState, Button } from '@components';
import { SubjectRepository, TopicRepository, ConceptRepository } from '@db/repositories';
import { Plus, Search, ChevronRight, Folder, BookOpen } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function BibliotecaScreen() {
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState(SubjectRepository.getAll());
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    setSubjects(SubjectRepository.getAll());
  };

  const handleDeleteSubject = (id: string, name: string) => {
    Alert.alert(
      'Eliminar Disciplina',
      `Tem certeza que deseja eliminar "${name}"? Todas as matérias e conceitos associados serão eliminados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            SubjectRepository.delete(id);
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Biblioteca</Text>
        <Link href="/modal/subject" asChild>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            accessibilityLabel="Adicionar disciplina"
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary }]}>
        <Search size={20} color={colors.textSecondary} strokeWidth={2} />
        <Text
          style={[
            styles.searchPlaceholder,
            { color: searchQuery ? colors.textPrimary : colors.textSecondary },
          ]}
        >
          {searchQuery || 'Pesquisar...'}
        </Text>
      </View>

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Nenhuma disciplina"
          description="Comece por adicionar uma disciplina para organizar os seus estudos."
          actionLabel="Adicionar disciplina"
          onAction={() => {}}
        />
      ) : (
        <View style={styles.content}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onDelete={handleDeleteSubject}
            />
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

interface SubjectCardProps {
  subject: any;
  onDelete: (id: string, name: string) => void;
}

function SubjectCard({ subject, onDelete }: SubjectCardProps) {
  const { colors } = useTheme();
  const topics = TopicRepository.getAll(subject.id);
  const conceptsCount = topics.reduce(
    (acc, topic) => acc + ConceptRepository.getAll(topic.id).length,
    0
  );

  return (
    <Card style={styles.card}>
      <Link href={`/biblioteca/${subject.id}`} asChild>
        <TouchableOpacity style={styles.cardContent} activeOpacity={0.7}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: subject.color || colors.accent + '20' },
            ]}
          >
            <BookOpen size={24} color={subject.color || colors.accent} strokeWidth={2} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {subject.name}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {topics.length} matéria{topics.length !== 1 ? 's' : ''} • {conceptsCount} conceito{conceptsCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
        </TouchableOpacity>
      </Link>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(subject.id, subject.name)}
          accessibilityLabel={`Eliminar ${subject.name}`}
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
    ...typography.title1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  searchPlaceholder: {
    ...typography.body,
    marginLeft: spacing.md,
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
