import { EnergyLevel, EveningOutcome, LogEntry, BijoData, WaveformPoint } from '../index';

describe('Types', () => {
  describe('EnergyLevel', () => {
    it('should accept all valid energy levels', () => {
      const validLevels: EnergyLevel[] = [-2, -1, 0, 1, 2];
      
      validLevels.forEach(level => {
        expect([-2, -1, 0, 1, 2]).toContain(level);
      });
    });

    it('should type check energy levels correctly', () => {
      // These should compile without errors
      const level1: EnergyLevel = -2;
      const level2: EnergyLevel = -1;
      const level3: EnergyLevel = 0;
      const level4: EnergyLevel = 1;
      const level5: EnergyLevel = 2;
      
      expect([level1, level2, level3, level4, level5]).toEqual([-2, -1, 0, 1, 2]);
    });
  });

  describe('EveningOutcome', () => {
    it('should accept all valid evening outcomes', () => {
      const validOutcomes: EveningOutcome[] = [
        'volatile_high',
        'stable_high',
        'stable_neutral',
        'volatile_low',
        'stable_low'
      ];
      
      const expectedOutcomes = [
        'volatile_high',
        'stable_high',
        'stable_neutral',
        'volatile_low',
        'stable_low'
      ];
      
      validOutcomes.forEach(outcome => {
        expect(expectedOutcomes).toContain(outcome);
      });
    });

    it('should type check evening outcomes correctly', () => {
      const outcome1: EveningOutcome = 'volatile_high';
      const outcome2: EveningOutcome = 'stable_high';
      const outcome3: EveningOutcome = 'stable_neutral';
      const outcome4: EveningOutcome = 'volatile_low';
      const outcome5: EveningOutcome = 'stable_low';
      
      expect([outcome1, outcome2, outcome3, outcome4, outcome5]).toEqual([
        'volatile_high',
        'stable_high',
        'stable_neutral',
        'volatile_low',
        'stable_low'
      ]);
    });
  });

  describe('LogEntry', () => {
    it('should create valid log entry with all fields', () => {
      const entry: LogEntry = {
        date: '2024-01-15',
        morning: 2,
        midday: -1,
        evening: 'stable_high'
      };
      
      expect(entry.date).toBe('2024-01-15');
      expect(entry.morning).toBe(2);
      expect(entry.midday).toBe(-1);
      expect(entry.evening).toBe('stable_high');
    });

    it('should create valid log entry with null values', () => {
      const entry: LogEntry = {
        date: '2024-01-15',
        morning: null,
        midday: null,
        evening: null
      };
      
      expect(entry.date).toBe('2024-01-15');
      expect(entry.morning).toBeNull();
      expect(entry.midday).toBeNull();
      expect(entry.evening).toBeNull();
    });

    it('should create valid log entry with mixed null and values', () => {
      const entry: LogEntry = {
        date: '2024-01-15',
        morning: 1,
        midday: null,
        evening: 'volatile_low'
      };
      
      expect(entry.date).toBe('2024-01-15');
      expect(entry.morning).toBe(1);
      expect(entry.midday).toBeNull();
      expect(entry.evening).toBe('volatile_low');
    });

    it('should require date field', () => {
      const entry: LogEntry = {
        date: '2024-01-15',
        morning: null,
        midday: null,
        evening: null
      };
      
      expect(entry).toHaveProperty('date');
      expect(typeof entry.date).toBe('string');
    });
  });

  describe('BijoData', () => {
    it('should create valid BijoData structure', () => {
      const data: BijoData = {
        user: {
          id: 'test-user-id'
        },
        entries: {}
      };
      
      expect(data.user.id).toBe('test-user-id');
      expect(data.entries).toEqual({});
    });

    it('should create BijoData with entries', () => {
      const data: BijoData = {
        user: {
          id: 'test-user-id'
        },
        entries: {
          '2024-01-15': {
            date: '2024-01-15',
            morning: 1,
            midday: -1,
            evening: 'stable_neutral'
          },
          '2024-01-16': {
            date: '2024-01-16',
            morning: null,
            midday: 2,
            evening: null
          }
        }
      };
      
      expect(data.user.id).toBe('test-user-id');
      expect(Object.keys(data.entries)).toHaveLength(2);
      expect(data.entries['2024-01-15'].morning).toBe(1);
      expect(data.entries['2024-01-16'].midday).toBe(2);
    });

    it('should require user and entries fields', () => {
      const data: BijoData = {
        user: {
          id: 'test-id'
        },
        entries: {}
      };
      
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('entries');
      expect(data.user).toHaveProperty('id');
    });
  });

  describe('WaveformPoint', () => {
    it('should create valid waveform point', () => {
      const point: WaveformPoint = {
        x: 1,
        y: 2
      };
      
      expect(point.x).toBe(1);
      expect(point.y).toBe(2);
    });

    it('should handle time values (0: Morning, 1: Midday, 2: Evening)', () => {
      const morningPoint: WaveformPoint = { x: 0, y: -2 };
      const middayPoint: WaveformPoint = { x: 1, y: 1 };
      const eveningPoint: WaveformPoint = { x: 2, y: 2 };
      
      expect(morningPoint.x).toBe(0);
      expect(middayPoint.x).toBe(1);
      expect(eveningPoint.x).toBe(2);
    });

    it('should handle energy level values (-2 to 2)', () => {
      const points: WaveformPoint[] = [
        { x: 0, y: -2 },
        { x: 1, y: -1 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 2 }
      ];
      
      points.forEach(point => {
        expect(point.y).toBeGreaterThanOrEqual(-2);
        expect(point.y).toBeLessThanOrEqual(2);
      });
    });

    it('should handle decimal values for smooth waveforms', () => {
      const point: WaveformPoint = {
        x: 1.5,
        y: 0.5
      };
      
      expect(point.x).toBe(1.5);
      expect(point.y).toBe(0.5);
    });
  });
});

// Type utility functions tests
describe('Type Utilities', () => {
  const isValidEnergyLevel = (value: any): value is EnergyLevel => {
    return [-2, -1, 0, 1, 2].includes(value);
  };

  const isValidEveningOutcome = (value: any): value is EveningOutcome => {
    return ['volatile_high', 'stable_high', 'stable_neutral', 'volatile_low', 'stable_low'].includes(value);
  };

  const isValidLogEntry = (value: any): value is LogEntry => {
    return !!(
      value &&
      typeof value === 'object' &&
      typeof value.date === 'string' &&
      (value.morning === null || isValidEnergyLevel(value.morning)) &&
      (value.midday === null || isValidEnergyLevel(value.midday)) &&
      (value.evening === null || isValidEveningOutcome(value.evening))
    );
  };

  describe('isValidEnergyLevel', () => {
    it('should validate correct energy levels', () => {
      expect(isValidEnergyLevel(-2)).toBe(true);
      expect(isValidEnergyLevel(-1)).toBe(true);
      expect(isValidEnergyLevel(0)).toBe(true);
      expect(isValidEnergyLevel(1)).toBe(true);
      expect(isValidEnergyLevel(2)).toBe(true);
    });

    it('should reject invalid energy levels', () => {
      expect(isValidEnergyLevel(-3)).toBe(false);
      expect(isValidEnergyLevel(3)).toBe(false);
      expect(isValidEnergyLevel(0.5)).toBe(false);
      expect(isValidEnergyLevel('1')).toBe(false);
      expect(isValidEnergyLevel(null)).toBe(false);
      expect(isValidEnergyLevel(undefined)).toBe(false);
    });
  });

  describe('isValidEveningOutcome', () => {
    it('should validate correct evening outcomes', () => {
      expect(isValidEveningOutcome('volatile_high')).toBe(true);
      expect(isValidEveningOutcome('stable_high')).toBe(true);
      expect(isValidEveningOutcome('stable_neutral')).toBe(true);
      expect(isValidEveningOutcome('volatile_low')).toBe(true);
      expect(isValidEveningOutcome('stable_low')).toBe(true);
    });

    it('should reject invalid evening outcomes', () => {
      expect(isValidEveningOutcome('invalid')).toBe(false);
      expect(isValidEveningOutcome('high')).toBe(false);
      expect(isValidEveningOutcome('')).toBe(false);
      expect(isValidEveningOutcome(1)).toBe(false);
      expect(isValidEveningOutcome(null)).toBe(false);
      expect(isValidEveningOutcome(undefined)).toBe(false);
    });
  });

  describe('isValidLogEntry', () => {
    it('should validate correct log entries', () => {
      const validEntry: LogEntry = {
        date: '2024-01-15',
        morning: 1,
        midday: -1,
        evening: 'stable_high'
      };
      
      expect(isValidLogEntry(validEntry)).toBe(true);
    });

    it('should validate log entries with null values', () => {
      const validEntry: LogEntry = {
        date: '2024-01-15',
        morning: null,
        midday: null,
        evening: null
      };
      
      expect(isValidLogEntry(validEntry)).toBe(true);
    });

    it('should reject invalid log entries', () => {
      expect(isValidLogEntry(null)).toBe(false);
      expect(isValidLogEntry(undefined)).toBe(false);
      expect(isValidLogEntry({})).toBe(false);
      expect(isValidLogEntry({ date: '2024-01-15' })).toBe(false); // missing other fields
      expect(isValidLogEntry({ 
        date: 123, 
        morning: 1, 
        midday: 1, 
        evening: 'stable_high' 
      })).toBe(false); // invalid date type
      expect(isValidLogEntry({ 
        date: '2024-01-15', 
        morning: 3, // invalid energy level
        midday: 1, 
        evening: 'stable_high' 
      })).toBe(false);
      expect(isValidLogEntry({ 
        date: '2024-01-15', 
        morning: 1, 
        midday: 1, 
        evening: 'invalid' // invalid evening outcome
      })).toBe(false);
    });
  });
});