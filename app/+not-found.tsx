import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/core/constants/colors';
import { FileQuestion } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <FileQuestion size={48} color={Colors.textTertiary} />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>The page you are looking for does not exist.</Text>
        <Link href={"/" as any} style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 14,
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
