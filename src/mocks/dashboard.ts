import { DashboardStats, RecentActivity } from '@/src/modules/dashboard/types';

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 18307.5,
  totalOutstanding: 32178.5,
  totalOverdue: 4665.5,
  invoiceCount: 6,
  paidCount: 2,
  pendingCount: 2,
  overdueCount: 1,
  clientCount: 5,
};

export const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: 'act-1',
    type: 'invoice_created',
    title: 'Invoice Created',
    description: 'INV-2026-0004 for Skyline Media',
    amount: 3038,
    timestamp: '2026-02-05T08:00:00Z',
  },
  {
    id: 'act-2',
    type: 'payment_received',
    title: 'Payment Received',
    description: 'Partial payment from Bloom & Co.',
    amount: 8000,
    timestamp: '2026-01-20T16:00:00Z',
  },
  {
    id: 'act-3',
    type: 'invoice_sent',
    title: 'Invoice Sent',
    description: 'INV-2026-0002 sent to TechStart Inc.',
    amount: 19030,
    timestamp: '2026-01-28T09:00:00Z',
  },
  {
    id: 'act-4',
    type: 'invoice_paid',
    title: 'Invoice Paid',
    description: 'INV-2026-0001 fully paid by Acme Corp',
    amount: 7052.5,
    timestamp: '2026-02-01T14:30:00Z',
  },
  {
    id: 'act-5',
    type: 'client_added',
    title: 'New Client',
    description: 'Skyline Media added',
    timestamp: '2025-11-01T00:00:00Z',
  },
];
