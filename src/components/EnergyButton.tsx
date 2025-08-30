import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { EnergyLevel, EveningOutcome } from '../types';

interface EnergyButtonProps {
  label: string;
  value: EnergyLevel | EveningOutcome;
  isSelected: boolean;
  onPress: (value: any) => void;
}

export const EnergyButton: React.FC<EnergyButtonProps> = ({ 
  label, 
  value, 
  isSelected, 
  onPress 
}) => (
  <TouchableOpacity
    onPress={() => onPress(value)}
    style={{
      padding: 12,
      margin: 4,
      borderRadius: 8,
      backgroundColor: isSelected ? '#6366F1' : '#F3F4F6',
      minWidth: 80,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: isSelected ? 'white' : '#4B5563', fontWeight: '500' }}>
      {label}
    </Text>
  </TouchableOpacity>
);