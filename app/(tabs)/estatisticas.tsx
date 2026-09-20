import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing } from '@theme/tokens';
import { Card } from '@components/Card';
import { BarChart, LineChart } from '@components/StatsChart';
import { EmptyState } from '@components/EmptyState';
import { Clock, TrendingUp, BookOpen, Calendar } from 'lucide-react-native';
import { StudySessionRepository, SubjectRepository } from '@db/index';

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    sessionsCount: 0,
    streak: 0,
    subjectsCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<{ label: string; value: number }[]>([]);
  const [subjectData, setSubjectData] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      // Total study time this week (in minutes)
      const weeklySeconds = StudySessionRepository.getTotalStudyTimeDays(7);
      const totalMinutes = Math.floor(weeklySeconds / 60);

      // Sessions count
      const sessions = StudySessionRepository.getAll();
      
      // Streak
      const streak = StudySessionRepository.getCurrentStreak();

      // Subjects count
      const subjects = SubjectRepository.getAll();

      // Weekly daily data
      const dailyStats = StudySessionRepository.getDailyStats(7);
      const chartData = dailyStats.map(day => ({
        label: new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        value: day.duration_minutes,
      }));

      // By subject data
      const bySubject = StudySessionRepository.getBySubjectLastWeek();
      const subjectChartData = bySubject.map(item => ({
        label: item.subject_name || 'Sem disciplina',
        value: item.duration_minutes,
      }));

      setStats({
        totalStudyTime: totalMinutes,
        sessionsCount: sessions.length,
        streak: streak,
        subjectsCount: subjects.length,
      });
      setWeeklyData(chartData);
      setSubjectData(subjectChartData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Estatísticas</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Seu progresso de estudos</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Clock size={24} color={colors.accent} strokeWidth={2} />
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {formatHours(stats.totalStudyTime)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Esta semana</Text>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <TrendingUp size={24} color={colors.success} strokeWidth={2} />
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{stats.streak}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Dias seguidos</Text>
        </Card>
      </View>

      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <BookOpen size={24} color={colors.warning} strokeWidth={2} />
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{stats.subjectsCount}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Disciplinas</Text>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Calendar size={24} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{stats.sessionsCount}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Sessões</Text>
        </Card>
      </View>

      {/* Weekly Chart */}
      <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Estudo por dia</Text>
        {weeklyData.some(d => d.value > 0) ? (
          <BarChart 
            data={weeklyData} 
            height={160}
            barWidth={32}
            color={colors.accent}
          />
        ) : (
          <EmptyState
            icon={Clock}
            title="Sem dados esta semana"
            description="Complete sessões de estudo para ver seu progresso"
            compact
          />
        )}
      </Card>

      {/* By Subject Chart */}
      {subjectData.length > 0 && subjectData.some(d => d.value > 0) && (
        <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Por disciplina</Text>
          <BarChart 
            data={subjectData} 
            height={160}
            barWidth={40}
            color={colors.warning}
          />
        </Card>
      )}

      {/* Insights */}
      <Card style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Insights</Text>
        {stats.streak >= 7 && (
          <View style={styles.insightItem}>
            <Text style={[styles.insightText, { color: colors.textPrimary }]}>
              🔥 Incrível! Você mantém uma sequência de {stats.streak} dias
            </Text>
          </View>
        )}
        {stats.totalStudyTime >= 300 && (
          <View style={styles.insightItem}>
            <Text style={[styles.insightText, { color: colors.textPrimary }]}>
              📚 Excelente! {formatHours(stats.totalStudyTime)} estudados esta semana
            </Text>
          </View>
        )}
        {stats.streak === 0 && stats.totalStudyTime === 0 && (
          <EmptyState
            icon={BookOpen}
            title="Comece a estudar"
            description="Use o timer na aba Estudar para registrar suas sessões"
            compact
          />
        )}
      </Card>
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
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    ...typography.largeTitle,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
    borderRadius: 16,
  },
  summaryValue: {
    ...typography.title2,
    marginTop: spacing.sm,
  },
  summaryLabel: {
    ...typography.footnote,
    marginTop: spacing.xs,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  insightsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  insightItem: {
    paddingVertical: spacing.sm,
  },
  insightText: {
    ...typography.body,
  },
});
