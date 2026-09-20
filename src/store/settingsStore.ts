/**
 * Settings Store - MMKV based persistent storage for user preferences
 * High-performance storage for frequently accessed settings
 */

import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// Storage keys
const KEYS = {
  // SRS Settings
  SRS_INTERVALS_FORGOT: 'srs:intervals:forgot',
  SRS_INTERVALS_PARTIAL: 'srs:intervals:partial',
  SRS_INTERVALS_REMEMBERED: 'srs:intervals:remembered',
  SRS_INTERVALS_EASY: 'srs:intervals:easy',
  SRS_EASE_FACTOR: 'srs:ease_factor',
  SRS_MAX_INTERVAL: 'srs:max_interval',
  
  // Timer Settings
  TIMER_FOCUS_DURATION: 'timer:focus_duration',
  TIMER_SHORT_BREAK_DURATION: 'timer:short_break_duration',
  TIMER_LONG_BREAK_DURATION: 'timer:long_break_duration',
  TIMER_SESSIONS_BEFORE_LONG_BREAK: 'timer:sessions_before_long_break',
  
  // Notification Settings
  NOTIFICATIONS_ENABLED: 'notifications:enabled',
  NOTIFICATIONS_DAILY_REMINDER: 'notifications:daily_reminder',
  NOTIFICATIONS_DAILY_TIME: 'notifications:daily_time',
  NOTIFICATIONS_SOUND: 'notifications:sound',
  NOTIFICATIONS_VIBRATION: 'notifications:vibration',
  
  // Display Settings
  THEME_MODE: 'display:theme_mode', // 'light' | 'dark' | 'system'
  ACCENT_COLOR: 'display:accent_color',
  FONT_SIZE_SCALE: 'display:font_size_scale',
  
  // Study Settings
  STUDY_START_HOUR: 'study:start_hour',
  STUDY_END_HOUR: 'study:end_hour',
  STUDY_DAYS_PER_WEEK: 'study:days_per_week',
  WEEK_START_DAY: 'study:week_start_day', // 0 = Sunday, 1 = Monday
  
  // User Profile
  USER_NAME: 'user:name',
  USER_GOAL: 'user:goal',
  ONBOARDING_COMPLETED: 'onboarding:completed',
} as const;

// Default SRS intervals (in days)
export interface SRSIntervals {
  forgot: number;      // "Não lembrei" - usually 0 (same day) or 1
  partial: number;     // "Parcialmente" - short interval
  remembered: number;  // "Lembrei" - medium interval
  easy: number;        // "Facilmente" - long interval
}

export interface SRSSettings {
  intervals: SRSIntervals;
  easeFactor: number;
  maxInterval: number;
}

export const DEFAULT_SRS_SETTINGS: SRSSettings = {
  intervals: {
    forgot: 0,
    partial: 2,
    remembered: 7,
    easy: 20,
  },
  easeFactor: 2.5,
  maxInterval: 60,
};

// Preset configurations
export const SRS_PRESETS = {
  STANDARD: {
    name: 'Padrão',
    description: 'Equilibrado para maioria dos estudantes',
    intervals: { forgot: 0, partial: 2, remembered: 7, easy: 20 },
    easeFactor: 2.5,
    maxInterval: 60,
  },
  INTENSIVE: {
    name: 'Intensivo',
    description: 'Revisões mais frequentes para retenção máxima',
    intervals: { forgot: 0, partial: 1, remembered: 3, easy: 10 },
    easeFactor: 2.3,
    maxInterval: 30,
  },
  RELAXED: {
    name: 'Relaxado',
    description: 'Intervalos maiores para revisão espaçada ampla',
    intervals: { forgot: 1, partial: 3, remembered: 10, easy: 30 },
    easeFactor: 2.7,
    maxInterval: 90,
  },
} as const;

// ==================== SRS Settings ====================

export function getSRSSettings(): SRSSettings {
  try {
    const intervalsStr = storage.getString(KEYS.SRS_INTERVALS_FORGOT);
    if (!intervalsStr) {
      return DEFAULT_SRS_SETTINGS;
    }

    const intervals: SRSIntervals = {
      forgot: JSON.parse(storage.getString(KEYS.SRS_INTERVALS_FORGOT) || '0'),
      partial: JSON.parse(storage.getString(KEYS.SRS_INTERVALS_PARTIAL) || '2'),
      remembered: JSON.parse(storage.getString(KEYS.SRS_INTERVALS_REMEMBERED) || '7'),
      easy: JSON.parse(storage.getString(KEYS.SRS_INTERVALS_EASY) || '20'),
    };

    const easeFactor = JSON.parse(storage.getString(KEYS.SRS_EASE_FACTOR) || '2.5');
    const maxInterval = JSON.parse(storage.getString(KEYS.SRS_MAX_INTERVAL) || '60');

    return { intervals, easeFactor, maxInterval };
  } catch (error) {
    console.error('Error loading SRS settings:', error);
    return DEFAULT_SRS_SETTINGS;
  }
}

export function setSRSSettings(settings: Partial<SRSSettings>): void {
  try {
    if (settings.intervals) {
      storage.set(KEYS.SRS_INTERVALS_FORGOT, JSON.stringify(settings.intervals.forgot));
      storage.set(KEYS.SRS_INTERVALS_PARTIAL, JSON.stringify(settings.intervals.partial));
      storage.set(KEYS.SRS_INTERVALS_REMEMBERED, JSON.stringify(settings.intervals.remembered));
      storage.set(KEYS.SRS_INTERVALS_EASY, JSON.stringify(settings.intervals.easy));
    }
    if (settings.easeFactor !== undefined) {
      storage.set(KEYS.SRS_EASE_FACTOR, JSON.stringify(settings.easeFactor));
    }
    if (settings.maxInterval !== undefined) {
      storage.set(KEYS.SRS_MAX_INTERVAL, JSON.stringify(settings.maxInterval));
    }
  } catch (error) {
    console.error('Error saving SRS settings:', error);
    throw error;
  }
}

export function applySRSPreset(presetKey: keyof typeof SRS_PRESETS): void {
  const preset = SRS_PRESETS[presetKey];
  setSRSSettings({
    intervals: preset.intervals,
    easeFactor: preset.easeFactor,
    maxInterval: preset.maxInterval,
  });
}

// ==================== Timer Settings ====================

export interface TimerSettings {
  focusDuration: number;      // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number;  // minutes
  sessionsBeforeLongBreak: number;
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

export function getTimerSettings(): TimerSettings {
  try {
    return {
      focusDuration: JSON.parse(storage.getString(KEYS.TIMER_FOCUS_DURATION) || '25'),
      shortBreakDuration: JSON.parse(storage.getString(KEYS.TIMER_SHORT_BREAK_DURATION) || '5'),
      longBreakDuration: JSON.parse(storage.getString(KEYS.TIMER_LONG_BREAK_DURATION) || '15'),
      sessionsBeforeLongBreak: JSON.parse(storage.getString(KEYS.TIMER_SESSIONS_BEFORE_LONG_BREAK) || '4'),
    };
  } catch {
    return DEFAULT_TIMER_SETTINGS;
  }
}

export function setTimerSettings(settings: Partial<TimerSettings>): void {
  if (settings.focusDuration !== undefined) {
    storage.set(KEYS.TIMER_FOCUS_DURATION, JSON.stringify(settings.focusDuration));
  }
  if (settings.shortBreakDuration !== undefined) {
    storage.set(KEYS.TIMER_SHORT_BREAK_DURATION, JSON.stringify(settings.shortBreakDuration));
  }
  if (settings.longBreakDuration !== undefined) {
    storage.set(KEYS.TIMER_LONG_BREAK_DURATION, JSON.stringify(settings.longBreakDuration));
  }
  if (settings.sessionsBeforeLongBreak !== undefined) {
    storage.set(KEYS.TIMER_SESSIONS_BEFORE_LONG_BREAK, JSON.stringify(settings.sessionsBeforeLongBreak));
  }
}

// ==================== Notification Settings ====================

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyTime: string; // HH:mm format
  sound: boolean;
  vibration: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyReminder: true,
  dailyTime: '09:00',
  sound: true,
  vibration: true,
};

export function getNotificationSettings(): NotificationSettings {
  try {
    return {
      enabled: JSON.parse(storage.getString(KEYS.NOTIFICATIONS_ENABLED) || 'true'),
      dailyReminder: JSON.parse(storage.getString(KEYS.NOTIFICATIONS_DAILY_REMINDER) || 'true'),
      dailyTime: storage.getString(KEYS.NOTIFICATIONS_DAILY_TIME) || '09:00',
      sound: JSON.parse(storage.getString(KEYS.NOTIFICATIONS_SOUND) || 'true'),
      vibration: JSON.parse(storage.getString(KEYS.NOTIFICATIONS_VIBRATION) || 'true'),
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function setNotificationSettings(settings: Partial<NotificationSettings>): void {
  if (settings.enabled !== undefined) {
    storage.set(KEYS.NOTIFICATIONS_ENABLED, JSON.stringify(settings.enabled));
  }
  if (settings.dailyReminder !== undefined) {
    storage.set(KEYS.NOTIFICATIONS_DAILY_REMINDER, JSON.stringify(settings.dailyReminder));
  }
  if (settings.dailyTime !== undefined) {
    storage.set(KEYS.NOTIFICATIONS_DAILY_TIME, settings.dailyTime);
  }
  if (settings.sound !== undefined) {
    storage.set(KEYS.NOTIFICATIONS_SOUND, JSON.stringify(settings.sound));
  }
  if (settings.vibration !== undefined) {
    storage.set(KEYS.NOTIFICATIONS_VIBRATION, JSON.stringify(settings.vibration));
  }
}

// ==================== Display Settings ====================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface DisplaySettings {
  themeMode: ThemeMode;
  accentColor: string;
  fontSizeScale: number;
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  themeMode: 'system',
  accentColor: '#007AFF',
  fontSizeScale: 1.0,
};

export function getDisplaySettings(): DisplaySettings {
  try {
    return {
      themeMode: (storage.getString(KEYS.THEME_MODE) as ThemeMode) || 'system',
      accentColor: storage.getString(KEYS.ACCENT_COLOR) || '#007AFF',
      fontSizeScale: JSON.parse(storage.getString(KEYS.FONT_SIZE_SCALE) || '1.0'),
    };
  } catch {
    return DEFAULT_DISPLAY_SETTINGS;
  }
}

export function setDisplaySettings(settings: Partial<DisplaySettings>): void {
  if (settings.themeMode !== undefined) {
    storage.set(KEYS.THEME_MODE, settings.themeMode);
  }
  if (settings.accentColor !== undefined) {
    storage.set(KEYS.ACCENT_COLOR, settings.accentColor);
  }
  if (settings.fontSizeScale !== undefined) {
    storage.set(KEYS.FONT_SIZE_SCALE, JSON.stringify(settings.fontSizeScale));
  }
}

// ==================== Study Schedule Settings ====================

export interface StudyScheduleSettings {
  startHour: number;
  endHour: number;
  daysPerWeek: number;
  weekStartDay: number; // 0 = Sunday, 1 = Monday
}

export const DEFAULT_STUDY_SCHEDULE_SETTINGS: StudyScheduleSettings = {
  startHour: 8,
  endHour: 20,
  daysPerWeek: 5,
  weekStartDay: 1, // Monday
};

export function getStudyScheduleSettings(): StudyScheduleSettings {
  try {
    return {
      startHour: JSON.parse(storage.getString(KEYS.STUDY_START_HOUR) || '8'),
      endHour: JSON.parse(storage.getString(KEYS.STUDY_END_HOUR) || '20'),
      daysPerWeek: JSON.parse(storage.getString(KEYS.STUDY_DAYS_PER_WEEK) || '5'),
      weekStartDay: JSON.parse(storage.getString(KEYS.WEEK_START_DAY) || '1'),
    };
  } catch {
    return DEFAULT_STUDY_SCHEDULE_SETTINGS;
  }
}

export function setStudyScheduleSettings(settings: Partial<StudyScheduleSettings>): void {
  if (settings.startHour !== undefined) {
    storage.set(KEYS.STUDY_START_HOUR, JSON.stringify(settings.startHour));
  }
  if (settings.endHour !== undefined) {
    storage.set(KEYS.STUDY_END_HOUR, JSON.stringify(settings.endHour));
  }
  if (settings.daysPerWeek !== undefined) {
    storage.set(KEYS.STUDY_DAYS_PER_WEEK, JSON.stringify(settings.daysPerWeek));
  }
  if (settings.weekStartDay !== undefined) {
    storage.set(KEYS.WEEK_START_DAY, JSON.stringify(settings.weekStartDay));
  }
}

// ==================== User Profile ====================

export function getUserName(): string {
  return storage.getString(KEYS.USER_NAME) || '';
}

export function setUserName(name: string): void {
  storage.set(KEYS.USER_NAME, name);
}

export function getUserGoal(): string {
  return storage.getString(KEYS.USER_GOAL) || '';
}

export function setUserGoal(goal: string): void {
  storage.set(KEYS.USER_GOAL, goal);
}

// ==================== Onboarding ====================

export function isOnboardingCompleted(): boolean {
  return storage.getBoolean(KEYS.ONBOARDING_COMPLETED) === true;
}

export function setOnboardingCompleted(completed: boolean): void {
  storage.set(KEYS.ONBOARDING_COMPLETED, completed);
}

// ==================== Utility Functions ====================

export function resetAllSettings(): void {
  storage.clearAll();
}

export function exportSettings(): string {
  const settings = {
    srs: getSRSSettings(),
    timer: getTimerSettings(),
    notifications: getNotificationSettings(),
    display: getDisplaySettings(),
    studySchedule: getStudyScheduleSettings(),
    user: {
      name: getUserName(),
      goal: getUserGoal(),
    },
  };
  return JSON.stringify(settings, null, 2);
}

export function importSettings(jsonString: string): void {
  try {
    const settings = JSON.parse(jsonString);
    
    if (settings.srs) setSRSSettings(settings.srs);
    if (settings.timer) setTimerSettings(settings.timer);
    if (settings.notifications) setNotificationSettings(settings.notifications);
    if (settings.display) setDisplaySettings(settings.display);
    if (settings.studySchedule) setStudyScheduleSettings(settings.studySchedule);
    if (settings.user?.name) setUserName(settings.user.name);
    if (settings.user?.goal) setUserGoal(settings.user.goal);
  } catch (error) {
    throw new Error('Invalid settings JSON format');
  }
}
