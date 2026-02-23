export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'other';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  currency: string;
  createdAt: string;
}

export interface PaymentFormData {
  invoiceId: string;
  amount: string;
  method: PaymentMethod;
  date: string;
  notes?: string;
}

export const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'cash', label: 'Cash' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
  { key: 'card', label: 'Credit/Debit Card' },
  { key: 'other', label: 'Other' },
];
