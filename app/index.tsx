import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/core/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    // If already hydrated (e.g., hot reload)
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/dashboard' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
