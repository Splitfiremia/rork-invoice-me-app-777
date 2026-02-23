import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { Spacing, BorderRadius } from '@/src/core/constants/spacing';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { useClientStore } from '@/src/store/client.store';
import { Client } from '@/src/modules/clients/types';
import { isValidEmail } from '@/src/shared/utils/validators';
import * as Haptics from 'expo-haptics';

export default function CreateClientScreen() {
  const router = useRouter();
  const addClient = useClientStore((s) => s.addClient);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!isValidEmail(email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      zip: zip.trim() || undefined,
      country: 'US',
      notes: notes.trim() || undefined,
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      invoiceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addClient(newClient);
    Alert.alert('Success', 'Client added successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [validate, name, email, phone, company, address, city, state, zip, notes, addClient, router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <X size={22} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <View style={styles.card}>
              <Input
                label="Full Name"
                placeholder="Client name"
                value={name}
                onChangeText={setName}
                error={errors.name}
                testID="client-name"
              />
              <Input
                label="Email"
                placeholder="client@example.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="client-email"
              />
              <Input
                label="Phone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Company"
                placeholder="Company name"
                value={company}
                onChangeText={setCompany}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.card}>
              <Input
                label="Street Address"
                placeholder="123 Main St"
                value={address}
                onChangeText={setAddress}
              />
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Input
                    label="City"
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={styles.halfField}>
                  <Input
                    label="State"
                    placeholder="State"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>
              <Input
                label="ZIP Code"
                placeholder="00000"
                value={zip}
                onChangeText={setZip}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.card}>
              <Input
                label="Notes"
                placeholder="Additional notes about this client..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button title="Save Client" onPress={handleSave} size="lg" testID="save-client" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.massive,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
  },
});
