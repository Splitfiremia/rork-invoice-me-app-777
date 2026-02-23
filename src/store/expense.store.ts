import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, ExpenseFilter } from '@/src/modules/expenses/types';
import { MOCK_EXPENSES } from '@/src/mocks/expenses';

interface ExpenseStore {
  expenses: Expense[];
  filter: ExpenseFilter;
  setFilter: (filter: ExpenseFilter) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: MOCK_EXPENSES,
      filter: {},
      setFilter: (filter) => set({ filter }),
      addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((exp) => (exp.id === id ? { ...exp, ...data } : exp)),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((exp) => exp.id !== id),
        })),
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
