import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/src/core/constants/colors';
import { useAuthStore } from '@/src/store/auth.store';
import { ThemeProvider } from '@/src/core/theme';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="reports"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="settings/profile"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="settings/business"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="settings/tax"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="settings/currency"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="settings/appearance"
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      // Wait for auth store hydration
      if (!useAuthStore.persist.hasHydrated()) {
        await new Promise<void>((resolve) => {
          const unsub = useAuthStore.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
          // Double-check in case hydration completed between initial check and listener setup
          if (useAuthStore.persist.hasHydrated()) {
            unsub();
            resolve();
          }
        });
      }
      await SplashScreen.hideAsync();
      setIsReady(true);
    };
    prepare();
  }, []);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
