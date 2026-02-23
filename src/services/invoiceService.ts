import { Invoice } from '@/src/modules/invoices/types';
import { useInvoiceStore } from '@/src/store/invoice.store';

class InvoiceService {
  async getAll(): Promise<Invoice[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useInvoiceStore.getState();
    return store.invoices;
  }

  async getById(id: string): Promise<Invoice | undefined> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const store = useInvoiceStore.getState();
    return store.invoices.find((inv) => inv.id === id);
  }

  async create(data: Invoice): Promise<Invoice> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const store = useInvoiceStore.getState();
    store.addInvoice(data);
    return data;
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const store = useInvoiceStore.getState();
    store.updateInvoice(id, data);

    const updated = store.invoices.find((inv) => inv.id === id);
    if (!updated) {
      throw new Error(`Invoice with id ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useInvoiceStore.getState();
    store.deleteInvoice(id);
  }
}

export const invoiceService = new InvoiceService();
