// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map();
  
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn((key, value) => mockStorage.set(key, value)),
      getString: jest.fn((key) => mockStorage.get(key) || null),
      delete: jest.fn((key) => mockStorage.delete(key)),
      clearAll: jest.fn(() => mockStorage.clear()),
    })),
  };
});

// Mock react-native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Alert: {
    alert: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
  G: 'G',
  Circle: 'Circle',
  Line: 'Line',
}));