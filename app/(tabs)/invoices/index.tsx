import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Plus, Search, FileText, ClipboardList } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { InvoiceCard } from '@/src/modules/invoices/components/InvoiceCard';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { InvoiceStatus, Invoice } from '@/src/modules/invoices/types';
import * as Haptics from 'expo-haptics';

const STATUS_FILTERS: { key: InvoiceStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'partial', label: 'Partial' },
];

export default function InvoicesListScreen() {
  const router = useRouter();
  const invoices = useInvoiceStore((s) => s.invoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | 'all'>('all');

  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (activeFilter !== 'all') {
      result = result.filter((inv) => inv.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [invoices, activeFilter, searchQuery]);

  const handleInvoicePress = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(tabs)/invoices/${id}` as any);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/invoices/create' as any);
  }, [router]);

  const handleEstimatesPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/estimates' as any);
  }, [router]);

  const handleFilterPress = useCallback((key: InvoiceStatus | 'all') => {
    Haptics.selectionAsync();
    setActiveFilter(key);
  }, []);

  const renderInvoice = useCallback(
    ({ item }: { item: Invoice }) => (
      <InvoiceCard invoice={item} onPress={handleInvoicePress} />
    ),
    [handleInvoicePress]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerButtonContainer}>
              <TouchableOpacity 
                onPress={handleEstimatesPress} 
                style={styles.headerButton}
                accessibilityLabel="View estimates"
                accessibilityRole="button"
              >
                <ClipboardList size={22} color={Colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCreatePress} 
                style={styles.headerButton}
                accessibilityLabel="Create new invoice"
                accessibilityRole="button"
              >
                <Plus size={22} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search invoices..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="invoice-search"
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
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoice}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<FileText size={36} color={Colors.textTertiary} />}
              title="No invoices found"
              description={
                activeFilter !== 'all'
                  ? `No ${activeFilter} invoices. Try a different filter.`
                  : 'Create your first invoice to get started.'
              }
              actionLabel="Create Invoice"
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
  headerButtonContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
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
    fontWeight: '500',
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
