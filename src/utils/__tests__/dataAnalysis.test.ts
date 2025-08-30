import {
  calculateAverageEnergy,
  countEveningOutcomes,
  getMostCommonEveningOutcome,
  calculateEnergyVariance,
  generateWaveformPoints,
  eveningOutcomeToNumeric,
  generateSmoothWaveform,
  detectEnergyTrend,
  calculateCompletionRate,
} from '../dataAnalysis';
import { LogEntry, EveningOutcome } from '../../types';

describe('dataAnalysis', () => {
  const mockEntries: LogEntry[] = [
    {
      date: '2024-01-01',
      morning: 2,
      midday: 1,
      evening: 'stable_high',
    },
    {
      date: '2024-01-02',
      morning: -1,
      midday: 0,
      evening: 'volatile_low',
    },
    {
      date: '2024-01-03',
      morning: 1,
      midday: -2,
      evening: 'stable_neutral',
    },
    {
      date: '2024-01-04',
      morning: null,
      midday: 2,
      evening: null,
    },
    {
      date: '2024-01-05',
      morning: 0,
      midday: null,
      evening: 'stable_high',
    },
  ];

  describe('calculateAverageEnergy', () => {
    it('should calculate average morning energy correctly', () => {
      const average = calculateAverageEnergy(mockEntries, 'morning');
      // Valid morning entries: 2, -1, 1, 0 = 2/4 = 0.5
      expect(average).toBe(0.5);
    });

    it('should calculate average midday energy correctly', () => {
      const average = calculateAverageEnergy(mockEntries, 'midday');
      // Valid midday entries: 1, 0, -2, 2 = 1/4 = 0.25
      expect(average).toBe(0.25);
    });

    it('should return null for empty array', () => {
      const average = calculateAverageEnergy([], 'morning');
      expect(average).toBeNull();
    });

    it('should return null when all entries are null for specified time', () => {
      const entriesWithNullMorning: LogEntry[] = [
        { date: '2024-01-01', morning: null, midday: 1, evening: 'stable_high' },
        { date: '2024-01-02', morning: null, midday: 0, evening: 'volatile_low' },
      ];
      
      const average = calculateAverageEnergy(entriesWithNullMorning, 'morning');
      expect(average).toBeNull();
    });

    it('should handle extreme values correctly', () => {
      const extremeEntries: LogEntry[] = [
        { date: '2024-01-01', morning: -2, midday: null, evening: null },
        { date: '2024-01-02', morning: 2, midday: null, evening: null },
      ];
      
      const average = calculateAverageEnergy(extremeEntries, 'morning');
      expect(average).toBe(0);
    });

    it('should handle single entry', () => {
      const singleEntry: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: null, evening: null },
      ];
      
      const average = calculateAverageEnergy(singleEntry, 'morning');
      expect(average).toBe(1);
    });
  });

  describe('countEveningOutcomes', () => {
    it('should count all evening outcomes correctly', () => {
      const counts = countEveningOutcomes(mockEntries);
      
      expect(counts).toEqual({
        volatile_high: 0,
        stable_high: 2,
        stable_neutral: 1,
        volatile_low: 1,
        stable_low: 0,
      });
    });

    it('should return zero counts for empty array', () => {
      const counts = countEveningOutcomes([]);
      
      expect(counts).toEqual({
        volatile_high: 0,
        stable_high: 0,
        stable_neutral: 0,
        volatile_low: 0,
        stable_low: 0,
      });
    });

    it('should handle entries with null evening values', () => {
      const entriesWithNullEvening: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: 1, evening: null },
        { date: '2024-01-02', morning: 1, midday: 1, evening: 'stable_high' },
      ];
      
      const counts = countEveningOutcomes(entriesWithNullEvening);
      
      expect(counts.stable_high).toBe(1);
      expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(1);
    });

    it('should handle all possible evening outcomes', () => {
      const allOutcomesEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: 1, evening: 'volatile_high' },
        { date: '2024-01-02', morning: 1, midday: 1, evening: 'stable_high' },
        { date: '2024-01-03', morning: 1, midday: 1, evening: 'stable_neutral' },
        { date: '2024-01-04', morning: 1, midday: 1, evening: 'volatile_low' },
        { date: '2024-01-05', morning: 1, midday: 1, evening: 'stable_low' },
      ];
      
      const counts = countEveningOutcomes(allOutcomesEntries);
      
      expect(counts.volatile_high).toBe(1);
      expect(counts.stable_high).toBe(1);
      expect(counts.stable_neutral).toBe(1);
      expect(counts.volatile_low).toBe(1);
      expect(counts.stable_low).toBe(1);
    });
  });

  describe('getMostCommonEveningOutcome', () => {
    it('should return most common evening outcome', () => {
      const mostCommon = getMostCommonEveningOutcome(mockEntries);
      expect(mostCommon).toBe('stable_high'); // appears 2 times
    });

    it('should return null for empty array', () => {
      const mostCommon = getMostCommonEveningOutcome([]);
      expect(mostCommon).toBeNull();
    });

    it('should return null when all evening values are null', () => {
      const entriesWithNullEvening: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: 1, evening: null },
        { date: '2024-01-02', morning: 1, midday: 1, evening: null },
      ];
      
      const mostCommon = getMostCommonEveningOutcome(entriesWithNullEvening);
      expect(mostCommon).toBeNull();
    });

    it('should handle ties by returning the first one encountered', () => {
      const tiedEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: 1, evening: 'stable_high' },
        { date: '2024-01-02', morning: 1, midday: 1, evening: 'volatile_low' },
        { date: '2024-01-03', morning: 1, midday: 1, evening: 'stable_high' },
        { date: '2024-01-04', morning: 1, midday: 1, evening: 'volatile_low' },
      ];
      
      const mostCommon = getMostCommonEveningOutcome(tiedEntries);
      // Should return one of them (implementation dependent, but should be consistent)
      expect(['stable_high', 'volatile_low']).toContain(mostCommon);
    });

    it('should return single outcome when only one exists', () => {
      const singleOutcomeEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: 1, evening: 'stable_neutral' },
      ];
      
      const mostCommon = getMostCommonEveningOutcome(singleOutcomeEntries);
      expect(mostCommon).toBe('stable_neutral');
    });
  });

  describe('calculateEnergyVariance', () => {
    it('should calculate variance correctly', () => {
      const variance = calculateEnergyVariance(mockEntries, 'morning');
      // Morning values: 2, -1, 1, 0 -> average = 0.5
      // Squared differences: (2-0.5)^2, (-1-0.5)^2, (1-0.5)^2, (0-0.5)^2
      // = 2.25 + 2.25 + 0.25 + 0.25 = 5 -> variance = 5/4 = 1.25
      expect(variance).toBe(1.25);
    });

    it('should return null for less than 2 entries', () => {
      const singleEntry: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: null, evening: null },
      ];
      
      const variance = calculateEnergyVariance(singleEntry, 'morning');
      expect(variance).toBeNull();
    });

    it('should return null for empty array', () => {
      const variance = calculateEnergyVariance([], 'morning');
      expect(variance).toBeNull();
    });

    it('should return 0 for identical values', () => {
      const identicalEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: null, evening: null },
        { date: '2024-01-02', morning: 1, midday: null, evening: null },
        { date: '2024-01-03', morning: 1, midday: null, evening: null },
      ];
      
      const variance = calculateEnergyVariance(identicalEntries, 'morning');
      expect(variance).toBe(0);
    });
  });

  describe('eveningOutcomeToNumeric', () => {
    it('should convert all evening outcomes to correct numeric values', () => {
      const conversions: [EveningOutcome, number][] = [
        ['stable_low', -2],
        ['volatile_low', -1],
        ['stable_neutral', 0],
        ['volatile_high', 1],
        ['stable_high', 2],
      ];

      conversions.forEach(([outcome, expectedValue]) => {
        expect(eveningOutcomeToNumeric(outcome)).toBe(expectedValue);
      });
    });

    it('should maintain order from lowest to highest', () => {
      const outcomes: EveningOutcome[] = [
        'stable_low',
        'volatile_low',
        'stable_neutral',
        'volatile_high',
        'stable_high',
      ];

      const values = outcomes.map(eveningOutcomeToNumeric);
      
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('generateWaveformPoints', () => {
    it('should generate correct waveform points for complete entry', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: 1,
        midday: -1,
        evening: 'stable_high',
      };

      const points = generateWaveformPoints(entry);

      expect(points).toHaveLength(3);
      expect(points[0]).toEqual({ x: 0, y: 1 });
      expect(points[1]).toEqual({ x: 1, y: -1 });
      expect(points[2]).toEqual({ x: 2, y: 2 }); // stable_high = 2
    });

    it('should handle partial entries', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: 1,
        midday: null,
        evening: 'volatile_low',
      };

      const points = generateWaveformPoints(entry);

      expect(points).toHaveLength(2);
      expect(points[0]).toEqual({ x: 0, y: 1 });
      expect(points[1]).toEqual({ x: 2, y: -1 }); // volatile_low = -1
    });

    it('should handle empty entry', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: null,
        midday: null,
        evening: null,
      };

      const points = generateWaveformPoints(entry);
      expect(points).toHaveLength(0);
    });

    it('should handle single value entries', () => {
      const morningOnlyEntry: LogEntry = {
        date: '2024-01-01',
        morning: 2,
        midday: null,
        evening: null,
      };

      const points = generateWaveformPoints(morningOnlyEntry);
      expect(points).toHaveLength(1);
      expect(points[0]).toEqual({ x: 0, y: 2 });
    });
  });

  describe('generateSmoothWaveform', () => {
    it('should generate smooth waveform with correct resolution', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: -2,
        midday: 0,
        evening: 'stable_high',
      };

      const smoothPoints = generateSmoothWaveform(entry, 5);

      expect(smoothPoints).toHaveLength(5);
      expect(smoothPoints[0].x).toBe(0);
      expect(smoothPoints[4].x).toBe(2);
    });

    it('should return original points when less than 2 points', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: 1,
        midday: null,
        evening: null,
      };

      const smoothPoints = generateSmoothWaveform(entry, 10);
      expect(smoothPoints).toHaveLength(1);
      expect(smoothPoints[0]).toEqual({ x: 0, y: 1 });
    });

    it('should use default resolution when not specified', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: 0,
        midday: 1,
        evening: 'stable_neutral',
      };

      const smoothPoints = generateSmoothWaveform(entry);
      expect(smoothPoints).toHaveLength(10); // default resolution
    });

    it('should interpolate correctly between points', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: 0,
        midday: 2,
        evening: 'stable_neutral',
      };

      const smoothPoints = generateSmoothWaveform(entry, 3);
      
      expect(smoothPoints[0].y).toBe(0); // morning value at x=0
      expect(smoothPoints[1].y).toBe(2); // midday value at x=1 
      expect(smoothPoints[2].y).toBe(0); // evening value (stable_neutral = 0) at x=2
    });
  });

  describe('detectEnergyTrend', () => {
    it('should detect increasing trend', () => {
      const increasingEntries: LogEntry[] = [
        { date: '2024-01-01', morning: -2, midday: null, evening: null },
        { date: '2024-01-02', morning: -1, midday: null, evening: null },
        { date: '2024-01-03', morning: 0, midday: null, evening: null },
        { date: '2024-01-04', morning: 1, midday: null, evening: null },
        { date: '2024-01-05', morning: 2, midday: null, evening: null },
      ];

      const trend = detectEnergyTrend(increasingEntries, 'morning');
      expect(trend).toBe('increasing');
    });

    it('should detect decreasing trend', () => {
      const decreasingEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 2, midday: null, evening: null },
        { date: '2024-01-02', morning: 1, midday: null, evening: null },
        { date: '2024-01-03', morning: 0, midday: null, evening: null },
        { date: '2024-01-04', morning: -1, midday: null, evening: null },
        { date: '2024-01-05', morning: -2, midday: null, evening: null },
      ];

      const trend = detectEnergyTrend(decreasingEntries, 'morning');
      expect(trend).toBe('decreasing');
    });

    it('should detect stable trend', () => {
      const stableEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: null, evening: null },
        { date: '2024-01-02', morning: 0, midday: null, evening: null },
        { date: '2024-01-03', morning: 1, midday: null, evening: null },
        { date: '2024-01-04', morning: 0, midday: null, evening: null },
        { date: '2024-01-05', morning: 1, midday: null, evening: null },
      ];

      const trend = detectEnergyTrend(stableEntries, 'morning');
      expect(trend).toBe('stable');
    });

    it('should return null for insufficient data', () => {
      const twoEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: null, evening: null },
        { date: '2024-01-02', morning: 2, midday: null, evening: null },
      ];

      const trend = detectEnergyTrend(twoEntries, 'morning');
      expect(trend).toBeNull();
    });

    it('should return null for empty array', () => {
      const trend = detectEnergyTrend([], 'morning');
      expect(trend).toBeNull();
    });

    it('should handle entries with null values', () => {
      const entriesWithNulls: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: null, evening: null },
        { date: '2024-01-02', morning: null, midday: null, evening: null },
        { date: '2024-01-03', morning: 2, midday: null, evening: null },
        { date: '2024-01-04', morning: null, midday: null, evening: null },
        { date: '2024-01-05', morning: 2, midday: null, evening: null },
      ];

      // Should only consider non-null entries: 1, 2, 2 (stable - only 50% increasing)
      const trend = detectEnergyTrend(entriesWithNulls, 'morning');
      expect(trend).toBe('stable');
    });

    it('should sort entries by date', () => {
      const unorderedEntries: LogEntry[] = [
        { date: '2024-01-03', morning: 2, midday: null, evening: null },
        { date: '2024-01-01', morning: 0, midday: null, evening: null },
        { date: '2024-01-02', morning: 1, midday: null, evening: null },
      ];

      // When sorted: 0, 1, 2 (increasing)
      const trend = detectEnergyTrend(unorderedEntries, 'morning');
      expect(trend).toBe('increasing');
    });
  });

  describe('calculateCompletionRate', () => {
    it('should calculate completion rates correctly', () => {
      const rates = calculateCompletionRate(mockEntries);

      // mockEntries has 5 total entries
      // Morning: 4/5 = 0.8 (entry 4 is null)
      // Midday: 4/5 = 0.8 (entry 5 is null)  
      // Evening: 4/5 = 0.8 (entry 4 is null)
      // Overall: 12/15 = 0.8

      expect(rates.morning).toBeCloseTo(0.8);
      expect(rates.midday).toBeCloseTo(0.8);
      expect(rates.evening).toBeCloseTo(0.8);
      expect(rates.overall).toBeCloseTo(0.8);
    });

    it('should return zero rates for empty array', () => {
      const rates = calculateCompletionRate([]);

      expect(rates.overall).toBe(0);
      expect(rates.morning).toBe(0);
      expect(rates.midday).toBe(0);
      expect(rates.evening).toBe(0);
    });

    it('should handle 100% completion', () => {
      const completeEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: 0, evening: 'stable_high' },
        { date: '2024-01-02', morning: -1, midday: 1, evening: 'volatile_low' },
      ];

      const rates = calculateCompletionRate(completeEntries);

      expect(rates.overall).toBe(1);
      expect(rates.morning).toBe(1);
      expect(rates.midday).toBe(1);
      expect(rates.evening).toBe(1);
    });

    it('should handle 0% completion', () => {
      const incompleteEntries: LogEntry[] = [
        { date: '2024-01-01', morning: null, midday: null, evening: null },
        { date: '2024-01-02', morning: null, midday: null, evening: null },
      ];

      const rates = calculateCompletionRate(incompleteEntries);

      expect(rates.overall).toBe(0);
      expect(rates.morning).toBe(0);
      expect(rates.midday).toBe(0);
      expect(rates.evening).toBe(0);
    });

    it('should handle partial completion correctly', () => {
      const partialEntries: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: null, evening: null },
        { date: '2024-01-02', morning: null, midday: 1, evening: null },
        { date: '2024-01-03', morning: null, midday: null, evening: 'stable_high' },
      ];

      const rates = calculateCompletionRate(partialEntries);

      expect(rates.morning).toBeCloseTo(1/3);
      expect(rates.midday).toBeCloseTo(1/3);
      expect(rates.evening).toBeCloseTo(1/3);
      expect(rates.overall).toBeCloseTo(3/9); // 3 completed out of 9 total possible
    });

    it('should handle single entry correctly', () => {
      const singleEntry: LogEntry[] = [
        { date: '2024-01-01', morning: 1, midday: -1, evening: null },
      ];

      const rates = calculateCompletionRate(singleEntry);

      expect(rates.morning).toBe(1);
      expect(rates.midday).toBe(1);
      expect(rates.evening).toBe(0);
      expect(rates.overall).toBeCloseTo(2/3);
    });
  });

  describe('integration tests', () => {
    it('should work together for comprehensive data analysis', () => {
      const testEntries: LogEntry[] = [
        { date: '2024-01-01', morning: -2, midday: -1, evening: 'stable_low' },
        { date: '2024-01-02', morning: -1, midday: 0, evening: 'volatile_low' },
        { date: '2024-01-03', morning: 0, midday: 1, evening: 'stable_neutral' },
        { date: '2024-01-04', morning: 1, midday: 2, evening: 'volatile_high' },
        { date: '2024-01-05', morning: 2, midday: 1, evening: 'stable_high' },
      ];

      const morningAverage = calculateAverageEnergy(testEntries, 'morning');
      const middayAverage = calculateAverageEnergy(testEntries, 'midday');
      const morningTrend = detectEnergyTrend(testEntries, 'morning');
      const middayTrend = detectEnergyTrend(testEntries, 'midday');
      const completionRate = calculateCompletionRate(testEntries);
      const eveningCounts = countEveningOutcomes(testEntries);
      const mostCommonEvening = getMostCommonEveningOutcome(testEntries);

      expect(morningAverage).toBe(0); // (-2 + -1 + 0 + 1 + 2) / 5
      expect(middayAverage).toBe(0.6); // (-1 + 0 + 1 + 2 + 1) / 5
      expect(morningTrend).toBe('increasing');
      expect(middayTrend).toBe('increasing');
      expect(completionRate.overall).toBe(1);
      expect(Object.values(eveningCounts).reduce((sum, count) => sum + count, 0)).toBe(5);
      expect(mostCommonEvening).toBeDefined();
    });

    it('should generate consistent waveforms for the same entry', () => {
      const entry: LogEntry = {
        date: '2024-01-01',
        morning: 1,
        midday: -1,
        evening: 'stable_high',
      };

      const basePoints = generateWaveformPoints(entry);
      const smoothPoints = generateSmoothWaveform(entry, 10);

      expect(basePoints).toHaveLength(3);
      expect(smoothPoints).toHaveLength(10);
      expect(smoothPoints[0].y).toBe(1); // Should start with morning value
      expect(smoothPoints[9].y).toBe(2); // Should end with evening value (stable_high = 2)
    });
  });
});