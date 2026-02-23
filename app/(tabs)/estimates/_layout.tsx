import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '@/src/core/constants/colors';

export default function EstimatesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Estimates' }} />
      <Stack.Screen name="create" options={{ title: 'New Estimate', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Estimate Details' }} />
    </Stack>
  );
}
