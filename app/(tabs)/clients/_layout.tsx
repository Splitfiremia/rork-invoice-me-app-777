import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '@/src/core/constants/colors';

export default function ClientsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Clients' }} />
      <Stack.Screen name="create" options={{ title: 'New Client', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Client Details' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Client', presentation: 'modal' }} />
    </Stack>
  );
}
