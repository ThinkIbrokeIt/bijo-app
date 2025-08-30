// Define the possible values for each log entry
export type EnergyLevel = -2 | -1 | 0 | 1 | 2;
export type EveningOutcome = 'volatile_high' | 'stable_high' | 'stable_neutral' | 'volatile_low' | 'stable_low';

// The core data structure for a single day's log
export interface LogEntry {
  date: string; // ISO string (e.g., "2023-10-27")
  morning: EnergyLevel | null;
  midday: EnergyLevel | null;
  evening: EveningOutcome | null;
}

// The structure of our entire app's stored data
export interface BijoData {
  user: {
    id: string; // A locally-generated UUID v4
  };
  entries: {
    [date: string]: LogEntry; // A dictionary of LogEntries keyed by date string
  };
}

// This type will be used by our waveform generator
export interface WaveformPoint {
  x: number; // Represents time (0: Morning, 1: Midday, 2: Evening)
  y: number; // The energy level (-2 to 2)
}
