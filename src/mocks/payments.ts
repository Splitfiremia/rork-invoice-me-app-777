import { Payment } from '@/src/modules/payments/types';

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    invoiceId: 'inv-001',
    invoiceNumber: 'INV-2026-0001',
    clientName: 'Acme Corporation',
    amount: 7052.5,
    method: 'bank_transfer',
    date: '2026-02-01',
    notes: 'Full payment received',
    currency: 'USD',
    createdAt: '2026-02-01T14:30:00Z',
  },
  {
    id: 'pay-002',
    invoiceId: 'inv-005',
    invoiceNumber: 'INV-2026-0005',
    clientName: 'Bloom & Co.',
    amount: 8000,
    method: 'card',
    date: '2026-01-20',
    notes: '50% upfront payment',
    currency: 'USD',
    createdAt: '2026-01-20T16:00:00Z',
  },
  {
    id: 'pay-003',
    invoiceId: 'inv-006',
    invoiceNumber: 'INV-2026-0006',
    clientName: 'Acme Corporation',
    amount: 3255,
    method: 'bank_transfer',
    date: '2025-12-15',
    currency: 'USD',
    createdAt: '2025-12-15T10:00:00Z',
  },
];
