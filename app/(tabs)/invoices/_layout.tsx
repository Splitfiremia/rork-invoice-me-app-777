import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '@/src/core/constants/colors';

export default function InvoicesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Invoices' }} />
      <Stack.Screen name="create" options={{ title: 'New Invoice', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Invoice Details' }} />
    </Stack>
  );
}
