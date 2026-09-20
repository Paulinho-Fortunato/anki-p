/**
 * Notification Service - Local notifications using expo-notifications
 * All scheduling is local, no external services required
 */

import * as Notifications from 'expo-notifications';
import { ReminderRepository } from '@db/repositories';

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
}

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  sound: true,
  vibration: true,
};

class NotificationServiceClass {
  private config: NotificationConfig;
  private initialized: boolean = false;

  constructor() {
    this.config = DEFAULT_CONFIG;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Set up notification handler
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          console.log('Notification received:', notification);
          return {
            shouldShowAlert: this.config.enabled,
            shouldPlaySound: this.config.sound,
            shouldSetBadge: true,
          };
        },
      });

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        this.config.enabled = false;
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      this.config.enabled = false;
    }
  }

  getConfig(): NotificationConfig {
    return this.config;
  }

  setConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  isEnabled(): boolean {
    return this.config.enabled && this.initialized;
  }

  async scheduleNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, any>
  ): Promise<string | null> {
    if (!this.config.enabled || !this.initialized) {
      return null;
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: this.config.sound,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate.getTime(),
          channelId: 'study-reminders',
        },
      });

      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async scheduleReminder(reminderId: string, title: string, scheduledAt: string): Promise<string | null> {
    const triggerDate = new Date(scheduledAt);
    
    // Don't schedule past reminders
    if (triggerDate.getTime() < Date.now()) {
      return null;
    }

    return this.scheduleNotification(
      'Hora de estudar!',
      title,
      triggerDate,
      { reminderId, type: 'reminder' }
    );
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  async syncRemindersWithNotifications(): Promise<void> {
    if (!this.config.enabled || !this.initialized) return;

    try {
      const reminders = ReminderRepository.getEnabled();
      const scheduled = await this.getScheduledNotifications();
      
      // Create a map of existing notification IDs
      const existingIds = new Set(scheduled.map(n => n.identifier));

      for (const reminder of reminders) {
        // Skip if already has a valid notification
        if (reminder.notification_id && existingIds.has(reminder.notification_id)) {
          continue;
        }

        // Schedule new notification
        const notificationId = await this.scheduleReminder(
          reminder.id,
          reminder.title,
          reminder.scheduled_at
        );

        if (notificationId) {
          ReminderRepository.update(reminder.id, { notification_id: notificationId });
        }
      }

      // Clean up notifications for disabled/deleted reminders
      for (const notification of scheduled) {
        const reminder = reminderIdFromNotification(notification);
        if (!reminder || !reminders.find(r => r.id === reminder)) {
          await this.cancelNotification(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Failed to sync reminders:', error);
    }
  }
}

// Helper to extract reminder ID from notification data
function reminderIdFromNotification(notification: Notifications.NotificationRequest): string | null {
  const data = notification.content.data;
  if (data && typeof data === 'object' && 'reminderId' in data) {
    return data.reminderId as string;
  }
  return null;
}

// Singleton instance
export const NotificationService = new NotificationServiceClass();

// Preset notification channels/categories
export const NOTIFICATION_CATEGORIES = {
  STUDY_REMINDER: 'study-reminders',
  REVIEW_REMINDER: 'review-reminders',
  BREAK_REMINDER: 'break-reminders',
};
