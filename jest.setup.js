// Jest setup file
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
  setNotificationHandlerAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
}));
