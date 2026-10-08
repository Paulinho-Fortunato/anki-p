// Jest setup file

jest.mock('uuid', () => ({
  v4: jest.fn(() => '00000000-0000-4000-8000-000000000001'),
}));

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      getString: jest.fn(),
      getNumber: jest.fn(),
      getBoolean: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
    })),
  };
});

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
  },
  AndroidImportance: { DEFAULT: 3, HIGH: 4, LOW: 2, MIN: 1, NONE: 0 },
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
}));
