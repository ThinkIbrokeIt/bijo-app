/**
 * Utility functions for analyzing Bijo energy data
 */

import { LogEntry, EnergyLevel, EveningOutcome, WaveformPoint } from '../types';

/**
 * Calculate average energy level for a given time period
 */
export const calculateAverageEnergy = (entries: LogEntry[], timeOfDay: 'morning' | 'midday'): number | null => {
  const validEntries = entries.filter(entry => entry[timeOfDay] !== null);
  
  if (validEntries.length === 0) return null;
  
  const sum = validEntries.reduce((acc, entry) => acc + (entry[timeOfDay] as number), 0);
  return sum / validEntries.length;
};

/**
 * Count occurrences of each evening outcome
 */
export const countEveningOutcomes = (entries: LogEntry[]): Record<EveningOutcome, number> => {
  const counts: Record<EveningOutcome, number> = {
    volatile_high: 0,
    stable_high: 0,
    stable_neutral: 0,
    volatile_low: 0,
    stable_low: 0,
  };

  entries.forEach(entry => {
    if (entry.evening) {
      counts[entry.evening]++;
    }
  });

  return counts;
};

/**
 * Get the most common evening outcome
 */
export const getMostCommonEveningOutcome = (entries: LogEntry[]): EveningOutcome | null => {
  const counts = countEveningOutcomes(entries);
  let maxCount = 0;
  let mostCommon: EveningOutcome | null = null;

  Object.entries(counts).forEach(([outcome, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = outcome as EveningOutcome;
    }
  });

  return maxCount > 0 ? mostCommon : null;
};

/**
 * Calculate energy variance for a time period
 */
export const calculateEnergyVariance = (entries: LogEntry[], timeOfDay: 'morning' | 'midday'): number | null => {
  const validEntries = entries.filter(entry => entry[timeOfDay] !== null);
  
  if (validEntries.length < 2) return null;
  
  const average = calculateAverageEnergy(entries, timeOfDay);
  if (average === null) return null;

  const squaredDifferences = validEntries.map(entry => {
    const value = entry[timeOfDay] as number;
    return Math.pow(value - average, 2);
  });

  return squaredDifferences.reduce((acc, val) => acc + val, 0) / validEntries.length;
};

/**
 * Generate waveform points for visualization
 */
export const generateWaveformPoints = (entry: LogEntry): WaveformPoint[] => {
  const points: WaveformPoint[] = [];

  if (entry.morning !== null) {
    points.push({ x: 0, y: entry.morning });
  }

  if (entry.midday !== null) {
    points.push({ x: 1, y: entry.midday });
  }

  // For evening, we need to convert outcome to numeric value
  if (entry.evening !== null) {
    const eveningValue = eveningOutcomeToNumeric(entry.evening);
    points.push({ x: 2, y: eveningValue });
  }

  return points;
};

/**
 * Convert evening outcome to numeric value for visualization
 */
export const eveningOutcomeToNumeric = (outcome: EveningOutcome): number => {
  const mapping: Record<EveningOutcome, number> = {
    stable_low: -2,
    volatile_low: -1,
    stable_neutral: 0,
    volatile_high: 1,
    stable_high: 2,
  };

  return mapping[outcome];
};

/**
 * Generate smooth waveform with interpolation
 */
export const generateSmoothWaveform = (entry: LogEntry, resolution: number = 10): WaveformPoint[] => {
  const basePoints = generateWaveformPoints(entry);
  
  if (basePoints.length < 2) return basePoints;

  const smoothPoints: WaveformPoint[] = [];
  const step = 2 / (resolution - 1); // Total range is 0 to 2

  for (let i = 0; i < resolution; i++) {
    const x = i * step;
    const y = interpolateY(basePoints, x);
    smoothPoints.push({ x, y });
  }

  return smoothPoints;
};

/**
 * Linear interpolation helper
 */
const interpolateY = (points: WaveformPoint[], targetX: number): number => {
  // Find the two points that bracket targetX
  let leftPoint: WaveformPoint | null = null;
  let rightPoint: WaveformPoint | null = null;

  for (const point of points) {
    if (point.x <= targetX && (leftPoint === null || point.x > leftPoint.x)) {
      leftPoint = point;
    }
    if (point.x >= targetX && (rightPoint === null || point.x < rightPoint.x)) {
      rightPoint = point;
    }
  }

  // Handle edge cases
  if (leftPoint === null) return rightPoint?.y ?? 0;
  if (rightPoint === null) return leftPoint.y;
  if (leftPoint.x === rightPoint.x) return leftPoint.y;

  // Linear interpolation
  const t = (targetX - leftPoint.x) / (rightPoint.x - leftPoint.x);
  return leftPoint.y + t * (rightPoint.y - leftPoint.y);
};

/**
 * Detect energy trends over time
 */
export const detectEnergyTrend = (entries: LogEntry[], timeOfDay: 'morning' | 'midday'): 'increasing' | 'decreasing' | 'stable' | null => {
  const validEntries = entries
    .filter(entry => entry[timeOfDay] !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (validEntries.length < 3) return null;

  let increasingCount = 0;
  let decreasingCount = 0;

  for (let i = 1; i < validEntries.length; i++) {
    const current = validEntries[i][timeOfDay] as number;
    const previous = validEntries[i - 1][timeOfDay] as number;

    if (current > previous) increasingCount++;
    else if (current < previous) decreasingCount++;
  }

  const threshold = validEntries.length * 0.6; // 60% of comparisons

  if (increasingCount >= threshold) return 'increasing';
  if (decreasingCount >= threshold) return 'decreasing';
  return 'stable';
};

/**
 * Calculate completion rate for entries
 */
export const calculateCompletionRate = (entries: LogEntry[]): {
  overall: number;
  morning: number;
  midday: number;
  evening: number;
} => {
  if (entries.length === 0) {
    return { overall: 0, morning: 0, midday: 0, evening: 0 };
  }

  const morningComplete = entries.filter(e => e.morning !== null).length;
  const middayComplete = entries.filter(e => e.midday !== null).length;
  const eveningComplete = entries.filter(e => e.evening !== null).length;

  const totalPossible = entries.length;
  const totalCompleted = morningComplete + middayComplete + eveningComplete;
  const totalPossibleAll = totalPossible * 3; // 3 entries per day

  return {
    overall: totalPossibleAll > 0 ? totalCompleted / totalPossibleAll : 0,
    morning: morningComplete / totalPossible,
    midday: middayComplete / totalPossible,
    evening: eveningComplete / totalPossible,
  };
};