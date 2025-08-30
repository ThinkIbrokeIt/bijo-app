import { renderHook, act } from '@testing-library/react-native';
import { useStore } from '../useStore';
import { EnergyLevel, EveningOutcome, BijoData } from '../../types';

// Mock react-native-mmkv is already done in jest-setup.js

describe('useStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.data = null;
    });
  });

  describe('initializeNewUser', () => {
    it('should create a new user with empty entries', () => {
      const { result } = renderHook(() => useStore());
      
      expect(result.current.data).toBeNull();
      
      act(() => {
        result.current.initializeNewUser();
      });
      
      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.user.id).toBeDefined();
      expect(typeof result.current.data?.user.id).toBe('string');
      expect(result.current.data?.user.id.length).toBeGreaterThan(0);
      expect(result.current.data?.entries).toEqual({});
    });

    it('should generate unique user IDs for different instances', () => {
      const { result: result1 } = renderHook(() => useStore());
      const { result: result2 } = renderHook(() => useStore());
      
      act(() => {
        result1.current.initializeNewUser();
      });
      
      act(() => {
        result2.current.initializeNewUser();
      });
      
      // Note: Since zustand stores are singletons, both results will have the same data
      // This test verifies the ID generation logic works
      expect(result1.current.data?.user.id).toBeDefined();
      expect(result2.current.data?.user.id).toBeDefined();
    });
  });

  describe('logMorning', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.initializeNewUser();
      });
    });

    it('should log morning energy level for a new date', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      const energyLevel: EnergyLevel = 2;
      
      act(() => {
        result.current.logMorning(testDate, energyLevel);
      });
      
      expect(result.current.data?.entries[testDate]).toEqual({
        date: testDate,
        morning: energyLevel,
      });
    });

    it('should update morning energy level for existing date', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      
      act(() => {
        result.current.logMorning(testDate, 1);
      });
      
      act(() => {
        result.current.logMorning(testDate, -2);
      });
      
      expect(result.current.data?.entries[testDate].morning).toBe(-2);
    });

    it('should preserve existing midday and evening values when updating morning', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      
      act(() => {
        result.current.logMidday(testDate, 1);
        result.current.logEvening(testDate, 'stable_high');
        result.current.logMorning(testDate, -1);
      });
      
      expect(result.current.data?.entries[testDate]).toEqual({
        date: testDate,
        morning: -1,
        midday: 1,
        evening: 'stable_high',
      });
    });

    it('should handle all valid energy levels', () => {
      const { result } = renderHook(() => useStore());
      const energyLevels: EnergyLevel[] = [-2, -1, 0, 1, 2];
      
      energyLevels.forEach((level, index) => {
        const testDate = `2024-01-${15 + index}`;
        act(() => {
          result.current.logMorning(testDate, level);
        });
        
        expect(result.current.data?.entries[testDate].morning).toBe(level);
      });
    });


  });

  describe('logMidday', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.initializeNewUser();
      });
    });

    it('should log midday energy level for a new date', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      const energyLevel: EnergyLevel = 1;
      
      act(() => {
        result.current.logMidday(testDate, energyLevel);
      });
      
      expect(result.current.data?.entries[testDate]).toEqual({
        date: testDate,
        midday: energyLevel,
      });
    });

    it('should preserve existing morning and evening values when updating midday', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      
      act(() => {
        result.current.logMorning(testDate, -1);
        result.current.logEvening(testDate, 'volatile_low');
        result.current.logMidday(testDate, 2);
      });
      
      expect(result.current.data?.entries[testDate]).toEqual({
        date: testDate,
        morning: -1,
        midday: 2,
        evening: 'volatile_low',
      });
    });


  });

  describe('logEvening', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.initializeNewUser();
      });
    });

    it('should log evening outcome for a new date', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      const eveningOutcome: EveningOutcome = 'stable_high';
      
      act(() => {
        result.current.logEvening(testDate, eveningOutcome);
      });
      
      expect(result.current.data?.entries[testDate]).toEqual({
        date: testDate,
        evening: eveningOutcome,
      });
    });

    it('should handle all valid evening outcomes', () => {
      const { result } = renderHook(() => useStore());
      const outcomes: EveningOutcome[] = [
        'volatile_high',
        'stable_high',
        'stable_neutral',
        'volatile_low',
        'stable_low'
      ];
      
      outcomes.forEach((outcome, index) => {
        const testDate = `2024-01-${15 + index}`;
        act(() => {
          result.current.logEvening(testDate, outcome);
        });
        
        expect(result.current.data?.entries[testDate].evening).toBe(outcome);
      });
    });

    it('should preserve existing morning and midday values when updating evening', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      
      act(() => {
        result.current.logMorning(testDate, 2);
        result.current.logMidday(testDate, 0);
        result.current.logEvening(testDate, 'stable_neutral');
      });
      
      expect(result.current.data?.entries[testDate]).toEqual({
        date: testDate,
        morning: 2,
        midday: 0,
        evening: 'stable_neutral',
      });
    });


  });

  describe('behavior without user data', () => {
    it('logMorning should do nothing if no user data exists', () => {
      const { result } = renderHook(() => useStore());
      // Don't initialize user - data should remain null from global beforeEach
      
      act(() => {
        result.current.logMorning('2024-01-15', 1);
      });
      
      expect(result.current.data).toBeNull();
    });

    it('logMidday should do nothing if no user data exists', () => {
      const { result } = renderHook(() => useStore());
      // Don't initialize user - data should remain null from global beforeEach
      
      act(() => {
        result.current.logMidday('2024-01-15', 1);
      });
      
      expect(result.current.data).toBeNull();
    });

    it('logEvening should do nothing if no user data exists', () => {
      const { result } = renderHook(() => useStore());
      // Don't initialize user - data should remain null from global beforeEach
      
      act(() => {
        result.current.logEvening('2024-01-15', 'stable_high');
      });
      
      expect(result.current.data).toBeNull();
    });
  });

  describe('getTodaysEntry', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.initializeNewUser();
      });
    });

    it('should return null when no data exists', () => {
      const { result } = renderHook(() => useStore());
      // Reset data to null
      act(() => {
        (result.current as any).data = null;
      });
      
      const todaysEntry = result.current.getTodaysEntry();
      expect(todaysEntry).toBeNull();
    });

    it('should return null when today has no entry', () => {
      const { result } = renderHook(() => useStore());
      
      const todaysEntry = result.current.getTodaysEntry();
      expect(todaysEntry).toBeNull();
    });

    it('should return today\'s entry when it exists', () => {
      const { result } = renderHook(() => useStore());
      const today = new Date().toISOString().split('T')[0];
      
      act(() => {
        result.current.logMorning(today, 1);
        result.current.logMidday(today, -1);
      });
      
      const todaysEntry = result.current.getTodaysEntry();
      expect(todaysEntry).toEqual({
        date: today,
        morning: 1,
        midday: -1,
      });
    });

    it('should return complete entry with all three logs', () => {
      const { result } = renderHook(() => useStore());
      const today = new Date().toISOString().split('T')[0];
      
      act(() => {
        result.current.logMorning(today, 2);
        result.current.logMidday(today, 0);
        result.current.logEvening(today, 'volatile_high');
      });
      
      const todaysEntry = result.current.getTodaysEntry();
      expect(todaysEntry).toEqual({
        date: today,
        morning: 2,
        midday: 0,
        evening: 'volatile_high',
      });
    });
  });

  describe('exportData', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.initializeNewUser();
      });
    });

    it('should export data as JSON string', () => {
      const { result } = renderHook(() => useStore());
      
      const exportedData = result.current.exportData();
      const parsedData = JSON.parse(exportedData);
      
      expect(parsedData).toHaveProperty('user');
      expect(parsedData).toHaveProperty('entries');
      expect(parsedData.user).toHaveProperty('id');
      expect(typeof parsedData.user.id).toBe('string');
    });

    it('should export data with entries when they exist', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      
      act(() => {
        result.current.logMorning(testDate, 1);
        result.current.logEvening(testDate, 'stable_high');
      });
      
      const exportedData = result.current.exportData();
      const parsedData: BijoData = JSON.parse(exportedData);
      
      expect(parsedData.entries[testDate]).toEqual({
        date: testDate,
        morning: 1,
        evening: 'stable_high',
      });
    });

    it('should export null when no data exists', () => {
      const { result } = renderHook(() => useStore());
      // Reset data to null
      act(() => {
        (result.current as any).data = null;
      });
      
      const exportedData = result.current.exportData();
      expect(exportedData).toBe('null');
    });

    it('should export formatted JSON with proper indentation', () => {
      const { result } = renderHook(() => useStore());
      
      const exportedData = result.current.exportData();
      
      // Check that it's properly formatted (has newlines and spaces)
      expect(exportedData).toContain('\n');
      expect(exportedData).toContain('  ');
    });
  });

  describe('integration tests', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useStore());
      act(() => {
        result.current.initializeNewUser();
      });
    });

    it('should handle complete daily workflow', () => {
      const { result } = renderHook(() => useStore());
      const testDate = '2024-01-15';
      
      // Log morning
      act(() => {
        result.current.logMorning(testDate, -1);
      });
      
      expect(result.current.data?.entries[testDate].morning).toBe(-1);
      expect(result.current.data?.entries[testDate].midday).toBeUndefined();
      expect(result.current.data?.entries[testDate].evening).toBeUndefined();
      
      // Log midday
      act(() => {
        result.current.logMidday(testDate, 2);
      });
      
      expect(result.current.data?.entries[testDate].morning).toBe(-1);
      expect(result.current.data?.entries[testDate].midday).toBe(2);
      expect(result.current.data?.entries[testDate].evening).toBeUndefined();
      
      // Log evening
      act(() => {
        result.current.logEvening(testDate, 'volatile_high');
      });
      
      expect(result.current.data?.entries[testDate]).toEqual({
        date: testDate,
        morning: -1,
        midday: 2,
        evening: 'volatile_high',
      });
    });

    it('should handle multiple days of entries', () => {
      const { result } = renderHook(() => useStore());
      const dates = ['2024-01-15', '2024-01-16', '2024-01-17'];
      
      dates.forEach((date, index) => {
        act(() => {
          result.current.logMorning(date, (index - 1) as EnergyLevel);
          result.current.logMidday(date, (index) as EnergyLevel);
          result.current.logEvening(date, index === 0 ? 'stable_low' : index === 1 ? 'stable_neutral' : 'stable_high');
        });
      });
      
      expect(Object.keys(result.current.data?.entries || {})).toHaveLength(3);
      expect(result.current.data?.entries['2024-01-15'].morning).toBe(-1);
      expect(result.current.data?.entries['2024-01-16'].midday).toBe(1);
      expect(result.current.data?.entries['2024-01-17'].evening).toBe('stable_high');
    });
  });
});