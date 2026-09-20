/**
 * Timer Service - Pomodoro-style study timer
 * Supports customizable work/break intervals
 */

import { StudySessionRepository } from '@db/repositories';

export interface TimerConfig {
  workDuration: number; // seconds
  breakDuration: number; // seconds
  longBreakDuration: number; // seconds
  sessionsBeforeLongBreak: number;
}

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25 * 60, // 25 minutes
  breakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  sessionsBeforeLongBreak: 4,
};

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';
export type TimerMode = 'work' | 'break' | 'longBreak';

interface TimerCallbacks {
  onTick?: (remainingSeconds: number) => void;
  onComplete?: () => void;
  onModeChange?: (mode: TimerMode) => void;
}

class TimerServiceClass {
  private config: TimerConfig;
  private state: TimerState = 'idle';
  private mode: TimerMode = 'work';
  private remainingSeconds: number = DEFAULT_CONFIG.workDuration;
  private completedSessions: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: string | null = null;
  private callbacks: TimerCallbacks = {};
  private subjectId?: string;
  private topicId?: string;

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.remainingSeconds = this.config.workDuration;
  }

  getConfig(): TimerConfig {
    return this.config;
  }

  setConfig(config: Partial<TimerConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.state === 'idle') {
      this.remainingSeconds = this.mode === 'work' 
        ? this.config.workDuration 
        : this.mode === 'break' 
          ? this.config.breakDuration 
          : this.config.longBreakDuration;
    }
  }

  getState(): { state: TimerState; mode: TimerMode; remainingSeconds: number; completedSessions: number } {
    return {
      state: this.state,
      mode: this.mode,
      remainingSeconds: this.remainingSeconds,
      completedSessions: this.completedSessions,
    };
  }

  setContext(subjectId?: string, topicId?: string): void {
    this.subjectId = subjectId;
    this.topicId = topicId;
  }

  on(callbacks: TimerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  start(): void {
    if (this.state === 'running') return;

    this.state = 'running';
    
    if (!this.startTime && this.mode === 'work') {
      this.startTime = new Date().toISOString();
    }

    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      
      if (this.callbacks.onTick) {
        this.callbacks.onTick(this.remainingSeconds);
      }

      if (this.remainingSeconds <= 0) {
        this.completeCurrentPhase();
      }
    }, 1000);
  }

  pause(): void {
    if (this.state !== 'running') return;

    this.state = 'paused';
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.start();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Save session if we were in work mode
    if (this.mode === 'work' && this.startTime) {
      const endTime = new Date().toISOString();
      const duration = Math.floor(
        (new Date(endTime).getTime() - new Date(this.startTime).getTime()) / 1000
      );

      if (duration > 0) {
        StudySessionRepository.create({
          subject_id: this.subjectId,
          topic_id: this.topicId,
          start_time: this.startTime,
          end_time: endTime,
          duration_seconds: duration,
        });
      }
    }

    this.reset();
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state = 'idle';
    this.mode = 'work';
    this.remainingSeconds = this.config.workDuration;
    this.startTime = null;
    this.completedSessions = 0;

    if (this.callbacks.onModeChange) {
      this.callbacks.onModeChange('work');
    }
  }

  private completeCurrentPhase(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.mode === 'work') {
      this.completedSessions++;

      // Save completed session
      if (this.startTime) {
        StudySessionRepository.create({
          subject_id: this.subjectId,
          topic_id: this.topicId,
          start_time: this.startTime,
          end_time: new Date().toISOString(),
          duration_seconds: this.config.workDuration,
        });
      }

      // Determine next mode
      if (this.completedSessions >= this.config.sessionsBeforeLongBreak) {
        this.mode = 'longBreak';
        this.remainingSeconds = this.config.longBreakDuration;
        this.completedSessions = 0;
      } else {
        this.mode = 'break';
        this.remainingSeconds = this.config.breakDuration;
      }

      this.startTime = null;
    } else {
      // Break completed, back to work
      this.mode = 'work';
      this.remainingSeconds = this.config.workDuration;
    }

    this.state = 'completed';

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }

    if (this.callbacks.onModeChange) {
      this.callbacks.onModeChange(this.mode);
    }
  }

  skipPhase(): void {
    this.completeCurrentPhase();
  }
}

// Singleton instance
export const TimerService = new TimerServiceClass();

// Utility functions
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getProgress(remaining: number, total: number): number {
  return 1 - (remaining / total);
}
