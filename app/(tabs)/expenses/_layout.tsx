import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '@/src/core/constants/colors';

export default function ExpensesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Expenses' }} />
      <Stack.Screen name="create" options={{ title: 'New Expense', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Expense Details' }} />
    </Stack>
  );
}
