import { useMemo } from 'react';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { useClientStore } from '@/src/store/client.store';
import { usePaymentStore } from '@/src/store/payment.store';
import { RecentActivity } from '@/src/modules/dashboard/types';

export function useRecentActivity(): RecentActivity[] {
  const invoices = useInvoiceStore((s) => s.invoices);
  const clients = useClientStore((s) => s.clients);
  const payments = usePaymentStore((s) => s.payments);

  return useMemo(() => {
    const activities: RecentActivity[] = [];

    // Add invoice activities
    invoices.forEach((invoice) => {
      // Invoice created
      activities.push({
        id: `inv-created-${invoice.id}`,
        type: 'invoice_created',
        title: 'Invoice Created',
        description: `${invoice.invoiceNumber} for ${invoice.clientName}`,
        amount: invoice.total,
        timestamp: invoice.createdAt,
      });

      // Invoice sent (if status is sent, paid, or partial)
      if (invoice.status === 'sent' || invoice.status === 'paid' || invoice.status === 'partial') {
        activities.push({
          id: `inv-sent-${invoice.id}`,
          type: 'invoice_sent',
          title: 'Invoice Sent',
          description: `${invoice.invoiceNumber} sent to ${invoice.clientName}`,
          amount: invoice.total,
          timestamp: invoice.updatedAt,
        });
      }

      // Invoice paid (if fully paid)
      if (invoice.status === 'paid') {
        activities.push({
          id: `inv-paid-${invoice.id}`,
          type: 'invoice_paid',
          title: 'Invoice Paid',
          description: `${invoice.invoiceNumber} fully paid by ${invoice.clientName}`,
          amount: invoice.total,
          timestamp: invoice.updatedAt,
        });
      }
    });

    // Add payment activities
    payments.forEach((payment) => {
      const invoice = invoices.find((inv) => inv.id === payment.invoiceId);
      if (invoice) {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment_received',
          title: 'Payment Received',
          description: `Payment from ${invoice.clientName}`,
          amount: payment.amount,
          timestamp: payment.date,
        });
      }
    });

    // Add client activities
    clients.forEach((client) => {
      activities.push({
        id: `client-${client.id}`,
        type: 'client_added',
        title: 'New Client',
        description: `${client.name} added`,
        timestamp: client.createdAt,
      });
    });

    // Sort by timestamp (most recent first) and take top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [invoices, clients, payments]);
}
