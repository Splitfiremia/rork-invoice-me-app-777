import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment } from '@/src/modules/payments/types';
import { MOCK_PAYMENTS } from '@/src/mocks/payments';

interface PaymentStore {
  payments: Payment[];
  addPayment: (payment: Payment) => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      payments: MOCK_PAYMENTS,
      addPayment: (payment) => set((state) => ({ payments: [payment, ...state.payments] })),
    }),
    {
      name: 'payment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
