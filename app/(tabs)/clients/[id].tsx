import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Trash2,
  Pencil,
} from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { useClientStore } from '@/src/store/client.store';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { InvoiceCard } from '@/src/modules/invoices/components/InvoiceCard';
import { formatCurrency } from '@/src/shared/utils/currency';
import { Button } from '@/src/shared/components/Button';
import { useClientById } from '@/src/hooks/useStoreSelectors';
import * as Haptics from 'expo-haptics';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const client = useClientById(id as string);
  const deleteClient = useClientStore((s) => s.deleteClient);
  const invoices = useInvoiceStore((s) => s.invoices);

  const clientInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.clientId === id);
  }, [invoices, id]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Client', 'Are you sure you want to delete this client?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          if (id) deleteClient(id);
          router.back();
        },
      },
    ]);
  }, [id, deleteClient, router]);

  const handleEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(tabs)/clients/edit', params: { clientId: id } } as any);
  }, [id, router]);

  if (!client) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Client not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  const initials = client.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarColors = ['#0EA5E9', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];
  const colorIndex = client.name.charCodeAt(0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <>
      <Stack.Screen
        options={{
          title: client.name,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEdit} style={{ padding: 4 }}>
                <Pencil size={20} color={Colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{client.name}</Text>
          {client.company && <Text style={styles.company}>{client.company}</Text>}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(client.totalInvoiced)}</Text>
            <Text style={styles.statLabel}>Invoiced</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {formatCurrency(client.totalPaid)}
            </Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statValue,
                { color: client.totalOutstanding > 0 ? Colors.warning : Colors.text },
              ]}
            >
              {formatCurrency(client.totalOutstanding)}
            </Text>
            <Text style={styles.statLabel}>Outstanding</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          <InfoRow icon={<Mail size={16} color={Colors.accent} />} value={client.email} />
          {client.phone && (
            <InfoRow icon={<Phone size={16} color={Colors.success} />} value={client.phone} />
          )}
          {client.address && (
            <InfoRow
              icon={<MapPin size={16} color={Colors.error} />}
              value={[client.address, client.city, client.state, client.zip]
                .filter(Boolean)
                .join(', ')}
            />
          )}
        </View>

        {client.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{client.notes}</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Invoices ({clientInvoices.length})
          </Text>
        </View>

        {clientInvoices.length > 0 ? (
          clientInvoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onPress={(invId) => router.push(`/(tabs)/invoices/${invId}` as any)}
            />
          ))
        ) : (
          <View style={styles.noInvoices}>
            <FileText size={24} color={Colors.textTertiary} />
            <Text style={styles.noInvoicesText}>No invoices for this client</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View style={infoStyles.row}>
      {icon}
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.massive },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: Spacing.lg },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  profileHeader: { alignItems: 'center', paddingVertical: Spacing.xxl },
  avatar: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 26, fontWeight: '700' as const, color: Colors.textInverse },
  name: { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  company: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg, padding: Spacing.lg, marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: {
    fontSize: 13, fontWeight: '600' as const, color: Colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: Spacing.sm,
  },
  notesText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  sectionHeader: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  sectionTitle: { fontSize: 17, fontWeight: '600' as const, color: Colors.text },
  noInvoices: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  noInvoicesText: { fontSize: 14, color: Colors.textTertiary },
});
