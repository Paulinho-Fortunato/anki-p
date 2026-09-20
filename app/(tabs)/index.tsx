import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing } from '@theme/tokens';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { BarChart } from '@components/StatsChart';
import { BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react-native';
import { initializeDatabase, SubjectRepository, StudySessionRepository } from '@db/index';
import { getDueConcepts, getReviewStats } from '@services/srsService';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    studyTimeToday: 0,
    dueReviews: 0,
    streak: 0,
  });
  const [weeklyData, setWeeklyData] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    initializeDatabase();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const subjects = SubjectRepository.getAll();
      const studyTimeSeconds = StudySessionRepository.getTotalStudyTimeDays(1);
      const dueConcepts = getDueConcepts();
      const streak = StudySessionRepository.getCurrentStreak();
      
      // Get weekly stats for chart
      const dailyStats = StudySessionRepository.getDailyStats(7);
      const chartData = dailyStats.map(day => ({
        label: new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        value: day.duration_minutes,
      }));
      setWeeklyData(chartData);

      setStats({
        totalSubjects: subjects.length,
        studyTimeToday: Math.floor(studyTimeSeconds / 60), // minutes
        dueReviews: dueConcepts.length,
        streak: streak,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Bom dia</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Vamos estudar hoje?</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { backgroundColor: colors.surface }] as any}>
          <BookOpen size={24} color={colors.accent} strokeWidth={2} />
          <Text style={[styles.statValue, { color: colors.textPrimary }] as any}>{stats.totalSubjects}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }] as any}>Disciplinas</Text>
        </Card>
        
        <Card style={[styles.statCard, { backgroundColor: colors.surface }] as any}>
          <Clock size={24} color={colors.success} strokeWidth={2} />
          <Text style={[styles.statValue, { color: colors.textPrimary }] as any}>{stats.studyTimeToday}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }] as any}>Min hoje</Text>
        </Card>
        
        <Card style={[styles.statCard, { backgroundColor: colors.surface }] as any}>
          <TrendingUp size={24} color={colors.warning} strokeWidth={2} />
          <Text style={[styles.statValue, { color: colors.textPrimary }] as any}>{stats.streak}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }] as any}>Dias seguidos</Text>
        </Card>
      </View>

      {/* Weekly Stats Chart */}
      <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Esta semana</Text>
        {weeklyData.length > 0 ? (
          <BarChart 
            data={weeklyData} 
            height={140}
            barWidth={28}
            color={colors.accent}
          />
        ) : (
          <EmptyState
            icon={Clock}
            title="Sem dados de estudo"
            description="Complete sessões de estudo para ver seu progresso semanal"
            compact
          />
        )}
      </Card>

      {/* Due Reviews Alert */}
      {stats.dueReviews > 0 && (
        <Card 
          variant="outlined" 
          style={[styles.alertCard, { borderColor: colors.warning, backgroundColor: colors.surface }] as any}
        >
          <View style={styles.alertContent}>
            <Calendar size={24} color={colors.warning} strokeWidth={2} />
            <View style={styles.alertText}>
              <Text style={[styles.alertTitle, { color: colors.textPrimary }] as any}>
                Revisões pendentes
              </Text>
              <Text style={[styles.alertMessage, { color: colors.textSecondary }] as any}>
                Você tem {stats.dueReviews} {stats.dueReviews === 1 ? 'conceito' : 'conceitos'} para revisar hoje
              </Text>
            </View>
          </View>
          <Button 
            title="Revisar agora" 
            onPress={() => {}} 
            variant="primary"
            size="small"
          />
        </Card>
      )}

      {/* Today's Plan */}
      <Card style={[styles.planCard, { backgroundColor: colors.surface }] as any}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Plano de hoje</Text>
        <EmptyState
          icon={BookOpen}
          title="Nenhuma atividade planejada"
          description="Adicione disciplinas e conceitos para começar a organizar seus estudos"
          action={
            <Button title="Adicionar disciplina" onPress={() => {}} variant="secondary" />
          }
        />
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button title="Novo Conceito" onPress={() => {}} variant="primary" style={styles.quickAction} />
        <Button title="Timer" onPress={() => {}} variant="secondary" style={styles.quickAction} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xxl,
    marginTop: spacing.lg,
  },
  greeting: {
    ...typography.subheadline,
  },
  title: {
    ...typography.largeTitle,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
    borderRadius: 16,
  },
  statValue: {
    ...typography.title2,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.footnote,
    marginTop: spacing.xs,
  },
  alertCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  alertTitle: {
    ...typography.headline,
  },
  alertMessage: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  planCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
});
