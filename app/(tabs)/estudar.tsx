import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing } from '@theme/tokens';
import { BookOpen } from 'lucide-react-native';
import { EmptyState } from '@components/EmptyState';
import { Button } from '@components/Button';
import Timer from '@components/Timer';
import { Card } from '@components/Card';
import { SubjectRepository, StudySessionRepository } from '@db/repositories';

export default function EstudarScreen() {
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState(SubjectRepository.getAll());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();
  const [todaySessions, setTodaySessions] = useState(StudySessionRepository.getTodayBySubject());

  useEffect(() => {
    setSubjects(SubjectRepository.getAll());
    setTodaySessions(StudySessionRepository.getTodayBySubject());
  }, []);

  const totalMinutesToday = todaySessions.reduce((acc: number, session) => acc + Math.floor(session.duration_seconds / 60), 0);

  if (subjects.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={BookOpen}
          title="Comece a estudar"
          description="Adicione conceitos e matérias para iniciar suas sessões de estudo ativo"
          action={
            <Button title="Adicionar Disciplina" onPress={() => {}} variant="primary" />
          }
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Estudar</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {totalMinutesToday} minutos estudados hoje
        </Text>
      </View>

      <Timer 
        subjectId={selectedSubjectId}
        onSessionComplete={() => {
          setTodaySessions(StudySessionRepository.getTodayBySubject());
        }}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Disciplinas</Text>
        {subjects.map((subject) => {
          const cardStyle: ViewStyle = selectedSubjectId === subject.id 
            ? { borderColor: colors.accent, borderWidth: 2 }
            : {};
          
          return (
            <Card
              key={subject.id}
              onPress={() => setSelectedSubjectId(subject.id)}
              style={[styles.subjectCard, cardStyle]}
            >
              <Text style={[styles.subjectName, { color: colors.textPrimary }]}>{subject.name}</Text>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  subjectCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  subjectName: {
    ...typography.body,
    fontWeight: '500',
  },
});
