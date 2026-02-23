import { useShallow } from 'zustand/react/shallow';
import { useInvoiceStore } from '@/src/store/invoice.store';
import { useClientStore } from '@/src/store/client.store';
import { useEstimateStore } from '@/src/store/estimate.store';
import { useExpenseStore } from '@/src/store/expense.store';
import { usePaymentStore } from '@/src/store/payment.store';

export const useInvoiceById = (id: string) =>
  useInvoiceStore(useShallow((s) => s.invoices.find((inv) => inv.id === id)));

export const useClientById = (id: string) =>
  useClientStore(useShallow((s) => s.clients.find((c) => c.id === id)));

export const useEstimateById = (id: string) =>
  useEstimateStore(useShallow((s) => s.estimates.find((est) => est.id === id)));

export const useExpenseById = (id: string) =>
  useExpenseStore(useShallow((s) => s.expenses.find((exp) => exp.id === id)));

export const usePaymentsByInvoice = (invoiceId: string) =>
  usePaymentStore(useShallow((s) => s.payments.filter((p) => p.invoiceId === invoiceId)));
