import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Repeat, Sparkles } from 'lucide-react-native';
import { useTheme } from '@theme/ThemeProvider';
import { Button, Card, EmptyState } from '@components';
import { spacing, typography } from '@theme/tokens';
import { getDueConcepts, processConceptReview, RATING, type Rating } from '@services/srsService';

type DueConcept = ReturnType<typeof getDueConcepts>[number];

const ratingOptions: { rating: Rating; label: string; variant: 'danger' | 'secondary' | 'primary' }[] = [
  { rating: RATING.FORGOT, label: 'Não lembrei', variant: 'danger' },
  { rating: RATING.PARTIAL, label: 'Parcialmente', variant: 'secondary' },
  { rating: RATING.REMEMBERED, label: 'Lembrei', variant: 'secondary' },
  { rating: RATING.EASY, label: 'Muito fácil', variant: 'primary' },
];

export default function RevisoesScreen() {
  const { colors } = useTheme();
  const [dueConcepts, setDueConcepts] = useState<DueConcept[]>([]);

  const loadDueConcepts = useCallback(() => {
    setDueConcepts(getDueConcepts());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDueConcepts();
    }, [loadDueConcepts])
  );

  const handleReview = (conceptId: string, rating: Rating) => {
    try {
      processConceptReview(conceptId, rating);
      setDueConcepts((current) => current.filter((concept) => concept.id !== conceptId));
    } catch (error) {
      Alert.alert('Não foi possível guardar', 'Tente novamente. Os seus dados não foram alterados.');
      console.error('Review failed:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.accent + '18' }]}>
          <Repeat size={24} color={colors.accent} strokeWidth={2.2} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Revisões</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Reforce o que aprendeu hoje.</Text>
        </View>
        <Text style={[styles.count, { color: colors.accent }]}>{dueConcepts.length}</Text>
      </View>

      {dueConcepts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Tudo revisto"
          description="Não há conceitos pendentes. Continue a estudar para manter o ritmo."
        />
      ) : (
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>A seguir</Text>
          {dueConcepts.map((concept) => (
            <Card key={concept.id} style={styles.reviewCard} variant="elevated">
              <Text style={[styles.conceptTitle, { color: colors.textPrimary }]}>{concept.title}</Text>
              <Text style={[styles.prompt, { color: colors.textSecondary }]}>Como explicaria este conceito?</Text>
              <View style={styles.actions}>
                {ratingOptions.map((option) => (
                  <Button
                    key={option.rating}
                    title={option.label}
                    variant={option.variant}
                    size="small"
                    onPress={() => handleReview(concept.id, option.rating)}
                    style={styles.actionButton}
                    accessibilityLabel={`${option.label}: ${concept.title}`}
                  />
                ))}
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.lg, marginBottom: spacing.xxl },
  headerIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.title1 },
  subtitle: { ...typography.subheadline, marginTop: spacing.xs },
  count: { ...typography.largeTitle, fontWeight: '700' },
  sectionLabel: { ...typography.subheadline, fontWeight: '600', marginBottom: spacing.md },
  reviewCard: { marginBottom: spacing.md },
  conceptTitle: { ...typography.title2, marginBottom: spacing.sm },
  prompt: { ...typography.body, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexGrow: 1, minWidth: '45%' },
});
