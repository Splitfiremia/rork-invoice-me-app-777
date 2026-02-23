import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Plus, Search, Users } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { ClientCard } from '@/src/modules/clients/components/ClientCard';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { useClientStore } from '@/src/store/client.store';
import { Client } from '@/src/modules/clients/types';
import * as Haptics from 'expo-haptics';

export default function ClientsListScreen() {
  const router = useRouter();
  const clients = useClientStore((s) => s.clients);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  const handleClientPress = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(tabs)/clients/${id}` as any);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/clients/create' as any);
  }, [router]);

  const renderClient = useCallback(
    ({ item }: { item: Client }) => (
      <ClientCard client={item} onPress={handleClientPress} />
    ),
    [handleClientPress]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleCreatePress} style={styles.headerButton}>
              <Plus size={22} color={Colors.accent} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="client-search"
            />
          </View>
        </View>

        <View style={styles.countRow}>
          <Text style={styles.countText}>{filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}</Text>
        </View>

        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={renderClient}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Users size={36} color={Colors.textTertiary} />}
              title="No clients yet"
              description="Add your first client to start invoicing."
              actionLabel="Add Client"
              onAction={handleCreatePress}
            />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    fontSize: 15,
    color: Colors.text,
  },
  countRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  countText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.massive,
  },
});
