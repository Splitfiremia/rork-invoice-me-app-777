import { Payment } from '@/src/modules/payments/types';
import { usePaymentStore } from '@/src/store/payment.store';

class PaymentService {
  async getAll(): Promise<Payment[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = usePaymentStore.getState();
    return store.payments;
  }

  async getByInvoice(invoiceId: string): Promise<Payment[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const store = usePaymentStore.getState();
    return store.payments.filter((p) => p.invoiceId === invoiceId);
  }

  async create(data: Payment): Promise<Payment> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const store = usePaymentStore.getState();
    store.addPayment(data);
    return data;
  }
}

export const paymentService = new PaymentService();
