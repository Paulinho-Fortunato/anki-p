/**
 * Timer Component - Pomodoro Study Timer
 * Visual timer with start/pause/resume controls
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react-native';
import { TimerService, formatTime, getProgress, TimerMode } from '../services/timerService';
import { useTheme } from '../theme/ThemeProvider';
import ProgressRing from './ProgressRing';

interface TimerProps {
  subjectId?: string;
  topicId?: string;
  onSessionComplete?: () => void;
}

export default function Timer({ subjectId, topicId, onSessionComplete }: TimerProps) {
  const theme = useTheme();
  const [state, setState] = useState(TimerService.getState());
  const [config, setConfig] = useState(TimerService.getConfig());

  useEffect(() => {
    TimerService.setContext(subjectId, topicId);
    
    const unsubscribe = TimerService.on({
      onTick: (remaining: number) => {
        setState(TimerService.getState());
      },
      onComplete: () => {
        setState(TimerService.getState());
        if (state.mode === 'work' && onSessionComplete) {
          onSessionComplete();
        }
      },
      onModeChange: (mode: TimerMode) => {
        setState(TimerService.getState());
      },
    });

    return () => {
      // Cleanup if needed
    };
  }, [subjectId, topicId]);

  const handleStart = useCallback(() => {
    TimerService.start();
    setState(TimerService.getState());
  }, []);

  const handlePause = useCallback(() => {
    TimerService.pause();
    setState(TimerService.getState());
  }, []);

  const handleReset = useCallback(() => {
    TimerService.stop();
    setState(TimerService.getState());
  }, []);

  const handleSkip = useCallback(() => {
    TimerService.skipPhase();
    setState(TimerService.getState());
  }, []);

  const progress = getProgress(state.remainingSeconds, 
    state.mode === 'work' ? config.workDuration : 
    state.mode === 'break' ? config.breakDuration : config.longBreakDuration
  );

  const getModeColor = () => {
    switch (state.mode) {
      case 'work': return theme.colors.accent;
      case 'break': return theme.colors.success;
      case 'longBreak': return theme.colors.success;
      default: return theme.colors.textPrimary;
    }
  };

  const getModeLabel = () => {
    switch (state.mode) {
      case 'work': return 'Foco';
      case 'break': return 'Pausa Curta';
      case 'longBreak': return 'Pausa Longa';
      default: return 'Timer';
    }
  };

  const isRunning = state.state === 'running';

  return (
    <View style={styles.container}>
      <View style={styles.modeContainer}>
        <Text style={[styles.modeLabel, { color: getModeColor() }]}>
          {getModeLabel()}
        </Text>
        {state.completedSessions > 0 && (
          <Text style={[styles.sessionsCount, { color: theme.colors.textSecondary }]}>
            {state.completedSessions}/{config.sessionsBeforeLongBreak} sessões
          </Text>
        )}
      </View>

      <View style={styles.timerContainer}>
        <ProgressRing
          progress={progress}
          size={240}
          strokeWidth={12}
          color={getModeColor()}
          trackColor={theme.colors.border}
        >
          <Text style={[styles.timeDisplay, { color: theme.colors.textPrimary }]}>
            {formatTime(state.remainingSeconds)}
          </Text>
        </ProgressRing>
      </View>

      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { backgroundColor: getModeColor() }]}
            onPress={handleStart}
            accessibilityLabel={state.state === 'paused' ? 'Continuar timer' : 'Iniciar timer'}
            accessibilityRole="button"
          >
            <Play size={24} color={theme.colors.surface} />
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              {state.state === 'paused' ? 'Continuar' : 'Iniciar'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: getModeColor() }]}
            onPress={handlePause}
            accessibilityLabel="Pausar timer"
            accessibilityRole="button"
          >
            <Pause size={24} color={getModeColor()} />
            <Text style={[styles.buttonText, { color: getModeColor() }]}>
              Pausar
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceSecondary }]}
            onPress={handleReset}
            accessibilityLabel="Reiniciar timer"
            accessibilityRole="button"
          >
            <RotateCcw size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceSecondary }]}
            onPress={handleSkip}
            accessibilityLabel="Pular fase atual"
            accessibilityRole="button"
          >
            <SkipForward size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {state.state === 'completed' && (
        <View style={[styles.completeMessage, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={{ color: theme.colors.textPrimary }}>
            {state.mode === 'work' ? 'Sessão completada!' : 'Hora de voltar ao foco!'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  modeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionsCount: {
    fontSize: 14,
  },
  timerContainer: {
    marginVertical: 16,
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  controlsContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 200,
    marginBottom: 16,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeMessage: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
