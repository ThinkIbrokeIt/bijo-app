---
description: Repository Information Overview
alwaysApply: true
---

# Bijo App Information

## Summary
Bijo (Binary Journal) is a minimalist, local-first mobile application that allows users to log their daily energy levels and visualize the resulting waveform of their emotional patterns. The app follows a philosophy of data ownership, where all user data is stored locally on the device.

## Structure
- **app/**: Expo Router application screens and layouts
  - **index.tsx**: Main home screen
  - **_layout.tsx**: Root layout configuration
- **src/**: Core application code
  - **components/**: UI components (EnergyButton, etc.)
  - **store/**: State management using Zustand
  - **types/**: TypeScript type definitions
  - **utils/**: Utility functions
- **assets/**: Application images and icons
- **.expo/**: Expo configuration files

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript ~5.8.3
**Framework**: React Native (Expo ~53.0.22) with Expo Router
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- expo: ~53.0.22
- expo-router: ~4.0.0
- react: 19.0.0
- react-native: 0.79.6
- react-native-mmkv: ^3.3.0
- react-native-safe-area-context: 5.4.0
- react-native-svg: 15.11.2
- zustand: ^5.0.8
- expo-dev-client: ~5.2.4

**Development Dependencies**:
- @babel/core: ^7.25.2
- @babel/plugin-proposal-export-namespace-from: ^7.18.9
- @types/react: ~19.0.10
- typescript: ~5.8.3

## Build & Installation
```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on web
npx expo start --web
```

## Application Structure
**Entry Point**: expo-router/entry (app/index.tsx)
**Navigation**: Expo Router file-based routing
**State Management**: Zustand with MMKV storage
**Data Model**:
- EnergyLevel: Numeric values (-2 to 2) representing energy levels
- EveningOutcome: String values representing end-of-day outcomes
- LogEntry: Daily record with morning, midday, and evening data points
- BijoData: Main data structure with user ID and entries

## Features
- Morning, midday, and evening energy level tracking
- Local data storage using MMKV
- Data visualization (waveform representation)
- Data export functionality
- No external dependencies or cloud storage

## Mobile Configuration
**Platforms**: iOS, Android, Web
**Orientation**: Portrait
**Adaptive Icons**: Configured for Android
**Tablet Support**: Enabled for iOS