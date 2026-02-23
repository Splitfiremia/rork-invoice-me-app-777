import { useMemo } from 'react';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { useClientStore } from '@/src/store/client.store';
import { DashboardStats } from '@/src/modules/dashboard/types';

export function useDashboardStats(): DashboardStats {
  const invoices = useInvoiceStore((s) => s.invoices);
  const clients = useClientStore((s) => s.clients);

  return useMemo(() => {
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === 'sent' || inv.status === 'partial'
    );

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalRevenue,
      totalOutstanding,
      totalOverdue,
      invoiceCount: invoices.length,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      overdueCount: overdueInvoices.length,
      clientCount: clients.length,
    };
  }, [invoices, clients]);
}
