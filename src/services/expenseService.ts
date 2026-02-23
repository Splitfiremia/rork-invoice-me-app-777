import { Expense } from '@/src/modules/expenses/types';
import { useExpenseStore } from '@/src/store/expense.store';

class ExpenseService {
  async getAll(): Promise<Expense[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useExpenseStore.getState();
    return store.expenses;
  }

  async getById(id: string): Promise<Expense | undefined> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const store = useExpenseStore.getState();
    return store.expenses.find((exp) => exp.id === id);
  }

  async create(data: Expense): Promise<Expense> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const store = useExpenseStore.getState();
    store.addExpense(data);
    return data;
  }

  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const store = useExpenseStore.getState();
    store.updateExpense(id, data);

    const updated = store.expenses.find((exp) => exp.id === id);
    if (!updated) {
      throw new Error(`Expense with id ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useExpenseStore.getState();
    store.deleteExpense(id);
  }
}

export const expenseService = new ExpenseService();
