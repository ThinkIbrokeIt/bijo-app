import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LogEntry, BijoData, EnergyLevel, EveningOutcome } from '../types';
import { MMKV } from 'react-native-mmkv';

// Create a new MMKV instance
const storage = new MMKV();

// Zustand middleware to use MMKV as the storage engine
const zustandMMKStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

interface AppState {
  // The core data object
  data: BijoData | null;
  // Actions
  initializeNewUser: () => void;
  logMorning: (date: string, value: EnergyLevel) => void;
  logMidday: (date: string, value: EnergyLevel) => void;
  logEvening: (date: string, value: EveningOutcome) => void;
  getTodaysEntry: () => LogEntry | null;
  exportData: () => string;
}

// This store will be persisted to MMKV
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      data: null,

      initializeNewUser: () => {
        const newData: BijoData = {
          user: { 
            id: Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15) // Simple unique ID
          },
          entries: {},
        };
        set({ data: newData });
      },

      logMorning: (date, value) => {
        const currentData = get().data;
        if (!currentData) return;
        
        const currentEntry = currentData.entries[date] || { date };
        
        set({
          data: {
            ...currentData,
            entries: {
              ...currentData.entries,
              [date]: { ...currentEntry, morning: value },
            },
          },
        });
      },

      logMidday: (date, value) => {
        const currentData = get().data;
        if (!currentData) return;
        
        const currentEntry = currentData.entries[date] || { date };
        
        set({
          data: {
            ...currentData,
            entries: {
              ...currentData.entries,
              [date]: { ...currentEntry, midday: value },
            },
          },
        });
      },

      logEvening: (date, value) => {
        const currentData = get().data;
        if (!currentData) return;
        
        const currentEntry = currentData.entries[date] || { date };
        
        set({
          data: {
            ...currentData,
            entries: {
              ...currentData.entries,
              [date]: { ...currentEntry, evening: value },
            },
          },
        });
      },

      getTodaysEntry: () => {
        const currentData = get().data;
        if (!currentData) return null;
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return currentData.entries[today] || null;
      },

      exportData: () => {
        const currentData = get().data;
        return JSON.stringify(currentData, null, 2);
      },
    }),
    {
      name: 'bijo-storage',
      storage: createJSONStorage(() => zustandMMKStorage),
    }
  )
);