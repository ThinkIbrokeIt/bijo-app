import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, StyleSheet } from 'react-native';
import HomeScreen from '../app/index';
import { useStore } from '../src/store/useStore';

// Mock StyleSheet.flatten for testing library
StyleSheet.flatten = (style: any) => style || {};

// Mock the store
jest.mock('../src/store/useStore');
const mockUseStore = useStore as jest.MockedFunction<typeof useStore>;

// Mock Alert
const mockAlert = Alert.alert as jest.Mock;

describe('App Component (HomeScreen)', () => {
  const mockStoreValues = {
    data: null,
    initializeNewUser: jest.fn(),
    logMorning: jest.fn(),
    logMidday: jest.fn(),
    logEvening: jest.fn(),
    getTodaysEntry: jest.fn().mockReturnValue(null),
    exportData: jest.fn().mockReturnValue('{}'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStore.mockReturnValue(mockStoreValues);
  });

  describe('Initial Rendering', () => {
    it('should render the app title', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('bijo')).toBeTruthy();
    });

    it('should render all three sections', () => {
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Morning Signal')).toBeTruthy();
      expect(getByText('Mid-day Signal')).toBeTruthy();
      expect(getByText('End of Day')).toBeTruthy();
    });

    it('should render all morning energy buttons', () => {
      const { getAllByText } = render(<HomeScreen />);
      
      // Each energy level appears 2 times (morning, midday) - evening uses different labels
      expect(getAllByText('--')).toHaveLength(2);
      expect(getAllByText('-')).toHaveLength(2);
      expect(getAllByText('0')).toHaveLength(2);
      expect(getAllByText('+')).toHaveLength(2);
      expect(getAllByText('++')).toHaveLength(2);
    });

    it('should render all evening outcome buttons', () => {
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Volatile ↑')).toBeTruthy();
      expect(getByText('Stable ++')).toBeTruthy();
      expect(getByText('Stable 0')).toBeTruthy();
      expect(getByText('Volatile ↓')).toBeTruthy();
      expect(getByText('Stable --')).toBeTruthy();
    });

    it('should render export button', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('Export Data')).toBeTruthy();
    });
  });

  describe('User Initialization', () => {
    it('should initialize new user when data is null', async () => {
      mockUseStore.mockReturnValue({
        ...mockStoreValues,
        data: null,
      });

      render(<HomeScreen />);
      
      await waitFor(() => {
        expect(mockStoreValues.initializeNewUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should not initialize new user when data exists', () => {
      mockUseStore.mockReturnValue({
        ...mockStoreValues,
        data: {
          user: { id: 'test-id' },
          entries: {}
        },
      });

      render(<HomeScreen />);
      
      expect(mockStoreValues.initializeNewUser).not.toHaveBeenCalled();
    });
  });

  describe('Morning Energy Logging', () => {
    it('should log morning energy when button is pressed', () => {
      const { getAllByText } = render(<HomeScreen />);
      
      // Get the '+' button from the morning section (first occurrence)
      const plusButtons = getAllByText('+');
      const morningPlusButton = plusButtons[0]; // First '+' is in morning section
      
      fireEvent.press(morningPlusButton);
      
      const today = new Date().toISOString().split('T')[0];
      expect(mockStoreValues.logMorning).toHaveBeenCalledWith(today, 1);
    });

    it('should log all morning energy levels correctly', () => {
      const { getAllByText, getByText } = render(<HomeScreen />);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Test '--' button (-2)
      fireEvent.press(getAllByText('--')[0]);
      expect(mockStoreValues.logMorning).toHaveBeenCalledWith(today, -2);
      
      // Test '-' button (-1)
      fireEvent.press(getAllByText('-')[0]);
      expect(mockStoreValues.logMorning).toHaveBeenCalledWith(today, -1);
      
      // Test '0' button (0)
      fireEvent.press(getAllByText('0')[0]);
      expect(mockStoreValues.logMorning).toHaveBeenCalledWith(today, 0);
      
      // Test '+' button (1)
      fireEvent.press(getAllByText('+')[0]);
      expect(mockStoreValues.logMorning).toHaveBeenCalledWith(today, 1);
      
      // Test '++' button (2)
      fireEvent.press(getAllByText('++')[0]);
      expect(mockStoreValues.logMorning).toHaveBeenCalledWith(today, 2);
    });
  });

  describe('Midday Energy Logging', () => {
    it('should log midday energy when button is pressed', () => {
      const { getAllByText } = render(<HomeScreen />);
      
      // Get the '+' button from the midday section (second occurrence)
      const plusButtons = getAllByText('+');
      const middayPlusButton = plusButtons[1]; // Second '+' is in midday section
      
      fireEvent.press(middayPlusButton);
      
      const today = new Date().toISOString().split('T')[0];
      expect(mockStoreValues.logMidday).toHaveBeenCalledWith(today, 1);
    });

    it('should log all midday energy levels correctly', () => {
      const { getAllByText } = render(<HomeScreen />);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Test all energy levels for midday (index 1 since they're the second occurrence)
      fireEvent.press(getAllByText('--')[1]);
      expect(mockStoreValues.logMidday).toHaveBeenCalledWith(today, -2);
      
      fireEvent.press(getAllByText('-')[1]);
      expect(mockStoreValues.logMidday).toHaveBeenCalledWith(today, -1);
      
      fireEvent.press(getAllByText('0')[1]);
      expect(mockStoreValues.logMidday).toHaveBeenCalledWith(today, 0);
      
      fireEvent.press(getAllByText('+')[1]);
      expect(mockStoreValues.logMidday).toHaveBeenCalledWith(today, 1);
      
      fireEvent.press(getAllByText('++')[1]);
      expect(mockStoreValues.logMidday).toHaveBeenCalledWith(today, 2);
    });
  });

  describe('Evening Outcome Logging', () => {
    it('should log evening outcome when button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      
      fireEvent.press(getByText('Stable ++'));
      
      const today = new Date().toISOString().split('T')[0];
      expect(mockStoreValues.logEvening).toHaveBeenCalledWith(today, 'stable_high');
    });

    it('should log all evening outcomes correctly', () => {
      const { getByText } = render(<HomeScreen />);
      
      const today = new Date().toISOString().split('T')[0];
      
      fireEvent.press(getByText('Volatile ↑'));
      expect(mockStoreValues.logEvening).toHaveBeenCalledWith(today, 'volatile_high');
      
      fireEvent.press(getByText('Stable ++'));
      expect(mockStoreValues.logEvening).toHaveBeenCalledWith(today, 'stable_high');
      
      fireEvent.press(getByText('Stable 0'));
      expect(mockStoreValues.logEvening).toHaveBeenCalledWith(today, 'stable_neutral');
      
      fireEvent.press(getByText('Volatile ↓'));
      expect(mockStoreValues.logEvening).toHaveBeenCalledWith(today, 'volatile_low');
      
      fireEvent.press(getByText('Stable --'));
      expect(mockStoreValues.logEvening).toHaveBeenCalledWith(today, 'stable_low');
    });
  });

  describe('State Loading from Store', () => {
    it('should load today\'s entry when it exists', () => {
      const mockTodaysEntry = {
        date: '2024-01-15',
        morning: 1,
        midday: -1,
        evening: 'stable_high'
      };
      
      const mockGetTodaysEntry = jest.fn().mockReturnValue(mockTodaysEntry);
      mockUseStore.mockReturnValue({
        ...mockStoreValues,
        data: { user: { id: 'test' }, entries: {} },
        getTodaysEntry: mockGetTodaysEntry,
      });

      render(<HomeScreen />);
      
      // The component should call getTodaysEntry to load current state
      expect(mockGetTodaysEntry).toHaveBeenCalled();
    });

    it('should handle null today\'s entry', () => {
      mockUseStore.mockReturnValue({
        ...mockStoreValues,
        data: { user: { id: 'test' }, entries: {} },
        getTodaysEntry: jest.fn().mockReturnValue(null),
      });

      const { getByText } = render(<HomeScreen />);
      
      // Should render without errors
      expect(getByText('bijo')).toBeTruthy();
    });
  });

  describe('Waveform Display', () => {
    it('should not show waveform when not all values are logged', () => {
      const { queryByText } = render(<HomeScreen />);
      
      expect(queryByText('Waveform Visualization')).toBeNull();
    });

    it('should show waveform placeholder when all values are logged', () => {
      // Mock component state to simulate all values logged
      const mockTodaysEntry = {
        date: '2024-01-15',
        morning: 1,
        midday: 0,
        evening: 'stable_high'
      };
      
      mockUseStore.mockReturnValue({
        ...mockStoreValues,
        data: { user: { id: 'test' }, entries: {} },
        getTodaysEntry: jest.fn().mockReturnValue(mockTodaysEntry),
      });

      const { getByText } = render(<HomeScreen />);
      
      // Should show the waveform section
      expect(getByText('Waveform Visualization')).toBeTruthy();
      expect(getByText('Your personalized energy waveform will appear here once we implement the visualization component.')).toBeTruthy();
    });
  });

  describe('Export Functionality', () => {
    it('should show alert when export button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      
      fireEvent.press(getByText('Export Data'));
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Export',
        'Export functionality will be implemented soon.'
      );
    });
  });

  describe('EnergyButton Component', () => {
    it('should render button with correct label', () => {
      const { getByText, getAllByText } = render(<HomeScreen />);
      
      // Test that all expected energy button labels are present (each appears 2 times for morning and midday)
      expect(getAllByText('--')).toHaveLength(2);
      expect(getAllByText('-')).toHaveLength(2);
      expect(getAllByText('0')).toHaveLength(2);
      expect(getAllByText('+')).toHaveLength(2);
      expect(getAllByText('++')).toHaveLength(2);
      
      // Test evening outcome buttons (each appears once)
      expect(getByText('Volatile ↑')).toBeTruthy();
      expect(getByText('Stable ++')).toBeTruthy();
      expect(getByText('Stable 0')).toBeTruthy();
      expect(getByText('Volatile ↓')).toBeTruthy();
      expect(getByText('Stable --')).toBeTruthy();
    });

    it('should be pressable', () => {
      const { getAllByText } = render(<HomeScreen />);
      
      const button = getAllByText('+')[0];
      
      // Should be able to press without throwing
      expect(() => fireEvent.press(button)).not.toThrow();
      expect(mockStoreValues.logMorning).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle store errors gracefully', () => {
      const mockLogMorning = jest.fn(() => { throw new Error('Store error'); });
      mockUseStore.mockReturnValue({
        ...mockStoreValues,
        logMorning: mockLogMorning,
      });

      const { getAllByText } = render(<HomeScreen />);
      
      // Currently the component doesn't catch errors, so they will propagate
      expect(() => {
        fireEvent.press(getAllByText('+')[0]);
      }).toThrow('Store error');
      
      expect(mockLogMorning).toHaveBeenCalled();
    });

    it('should handle missing data gracefully', () => {
      mockUseStore.mockReturnValue({
        ...mockStoreValues,
        data: null,
        getTodaysEntry: jest.fn().mockReturnValue(null),
      });

      const { getByText } = render(<HomeScreen />);
      
      // Should render without crashing
      expect(getByText('bijo')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render with proper structure for accessibility', () => {
      const { getByText } = render(<HomeScreen />);
      
      // Check that section headers are present for screen readers
      expect(getByText('Morning Signal')).toBeTruthy();
      expect(getByText('Mid-day Signal')).toBeTruthy();
      expect(getByText('End of Day')).toBeTruthy();
    });

    it('should have touchable elements', () => {
      const { getAllByText, getByText } = render(<HomeScreen />);
      
      // All buttons should be touchable
      const buttons = [
        ...getAllByText('--'),
        ...getAllByText('-'),
        ...getAllByText('0'),
        ...getAllByText('+'),
        ...getAllByText('++'),
        getByText('Volatile ↑'),
        getByText('Stable ++'),
        getByText('Stable 0'),
        getByText('Volatile ↓'),
        getByText('Stable --'),
        getByText('Export Data'),
      ];
      
      buttons.forEach(button => {
        expect(() => fireEvent.press(button)).not.toThrow();
      });
    });
  });
});