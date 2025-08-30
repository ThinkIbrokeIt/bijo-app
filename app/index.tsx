import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { EnergyLevel, EveningOutcome } from '../src/types';
import { EnergyButton } from '../src/components';

export default function HomeScreen() {
  const { data, initializeNewUser, logMorning, logMidday, logEvening, getTodaysEntry } = useStore();
  const [selectedMorning, setSelectedMorning] = useState<EnergyLevel | null>(null);
  const [selectedMidday, setSelectedMidday] = useState<EnergyLevel | null>(null);
  const [selectedEvening, setSelectedEvening] = useState<EveningOutcome | null>(null);

  // Initialize user if not exists
  useEffect(() => {
    if (!data) {
      initializeNewUser();
    }
  }, [data, initializeNewUser]);

  // Load today's entry when component mounts or data changes
  useEffect(() => {
    const todayEntry = getTodaysEntry();
    if (todayEntry) {
      setSelectedMorning(todayEntry.morning);
      setSelectedMidday(todayEntry.midday);
      setSelectedEvening(todayEntry.evening);
    }
  }, [data, getTodaysEntry]);

  const handleLogMorning = (value: EnergyLevel) => {
    const today = new Date().toISOString().split('T')[0];
    logMorning(today, value);
    setSelectedMorning(value);
  };

  const handleLogMidday = (value: EnergyLevel) => {
    const today = new Date().toISOString().split('T')[0];
    logMidday(today, value);
    setSelectedMidday(value);
  };

  const handleLogEvening = (value: EveningOutcome) => {
    const today = new Date().toISOString().split('T')[0];
    logEvening(today, value);
    setSelectedEvening(value);
  };

  const morningOptions: { label: string; value: EnergyLevel }[] = [
    { label: '--', value: -2 },
    { label: '-', value: -1 },
    { label: '0', value: 0 },
    { label: '+', value: 1 },
    { label: '++', value: 2 },
  ];

  const middayOptions: { label: string; value: EnergyLevel }[] = [
    { label: '--', value: -2 },
    { label: '-', value: -1 },
    { label: '0', value: 0 },
    { label: '+', value: 1 },
    { label: '++', value: 2 },
  ];

  const eveningOptions: { label: string; value: EveningOutcome }[] = [
    { label: 'Volatile ↑', value: 'volatile_high' },
    { label: 'Stable ++', value: 'stable_high' },
    { label: 'Stable 0', value: 'stable_neutral' },
    { label: 'Volatile ↓', value: 'volatile_low' },
    { label: 'Stable --', value: 'stable_low' },
  ];

  const allLogged = selectedMorning !== null && selectedMidday !== null && selectedEvening !== null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
          bijo
        </Text>

        {/* Morning Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Morning Signal
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {morningOptions.map((option) => (
              <EnergyButton
                key={option.value}
                label={option.label}
                value={option.value}
                isSelected={selectedMorning === option.value}
                onPress={handleLogMorning}
              />
            ))}
          </View>
        </View>

        {/* Midday Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Mid-day Signal
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {middayOptions.map((option) => (
              <EnergyButton
                key={option.value}
                label={option.label}
                value={option.value}
                isSelected={selectedMidday === option.value}
                onPress={handleLogMidday}
              />
            ))}
          </View>
        </View>

        {/* Evening Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            End of Day
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {eveningOptions.map((option) => (
              <EnergyButton
                key={option.value}
                label={option.label}
                value={option.value}
                isSelected={selectedEvening === option.value}
                onPress={handleLogEvening}
              />
            ))}
          </View>
        </View>

        {/* Waveform Placeholder */}
        {allLogged && (
          <View style={{ 
            marginTop: 24, 
            padding: 16, 
            backgroundColor: '#F8FAFC', 
            borderRadius: 12,
            alignItems: 'center',
            minHeight: 200 
          }}>
            <Text style={{ fontSize: 16, color: '#64748B', marginBottom: 16 }}>
              Waveform Visualization
            </Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center' }}>
              Your personalized energy waveform will appear here once we implement the visualization component.
            </Text>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity
          style={{
            padding: 16,
            backgroundColor: '#6366F1',
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 24,
          }}
          onPress={() => Alert.alert('Export', 'Export functionality will be implemented soon.')}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Export Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}