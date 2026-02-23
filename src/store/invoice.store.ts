import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invoice, InvoiceFilter } from '@/src/modules/invoices/types';
import { MOCK_INVOICES } from '@/src/mocks/invoices';

interface InvoiceStore {
  invoices: Invoice[];
  filter: InvoiceFilter;
  setFilter: (filter: InvoiceFilter) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoices: MOCK_INVOICES,
      filter: {},
      setFilter: (filter) => set({ filter }),
      addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
      updateInvoice: (id, data) =>
        set((state) => ({
          invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)),
        })),
      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),
    }),
    {
      name: 'invoice-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
