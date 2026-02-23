import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Plus, Search, ClipboardList } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { EstimateCard } from '@/src/modules/estimates/components/EstimateCard';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { useEstimateStore } from '@/src/store/estimate.store';
import { EstimateStatus, Estimate } from '@/src/modules/estimates/types';
import * as Haptics from 'expo-haptics';

const STATUS_FILTERS: { key: EstimateStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'expired', label: 'Expired' },
];

export default function EstimatesListScreen() {
  const router = useRouter();
  const estimates = useEstimateStore((s) => s.estimates);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<EstimateStatus | 'all'>('all');

  const filteredEstimates = useMemo(() => {
    let result = estimates;
    if (activeFilter !== 'all') {
      result = result.filter((est) => est.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (est) =>
          est.estimateNumber.toLowerCase().includes(q) ||
          est.clientName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [estimates, activeFilter, searchQuery]);

  const handleEstimatePress = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(tabs)/estimates/${id}` as any);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/estimates/create' as any);
  }, [router]);

  const handleFilterPress = useCallback((key: EstimateStatus | 'all') => {
    Haptics.selectionAsync();
    setActiveFilter(key);
  }, []);

  const renderEstimate = useCallback(
    ({ item }: { item: Estimate }) => (
      <EstimateCard estimate={item} onPress={handleEstimatePress} />
    ),
    [handleEstimatePress]
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
              placeholder="Search estimates..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="estimate-search"
            />
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={STATUS_FILTERS}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === item.key && styles.filterChipActive,
                ]}
                onPress={() => handleFilterPress(item.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === item.key && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <FlatList
          data={filteredEstimates}
          keyExtractor={(item) => item.id}
          renderItem={renderEstimate}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<ClipboardList size={36} color={Colors.textTertiary} />}
              title="No estimates found"
              description={
                activeFilter !== 'all'
                  ? `No ${activeFilter} estimates. Try a different filter.`
                  : 'Create your first estimate to get started.'
              }
              actionLabel="Create Estimate"
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
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.massive,
  },
});
