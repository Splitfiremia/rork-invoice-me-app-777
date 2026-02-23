export type ExpenseCategory =
  | 'travel'
  | 'office'
  | 'software'
  | 'marketing'
  | 'meals'
  | 'utilities'
  | 'equipment'
  | 'professional'
  | 'insurance'
  | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  taxAmount: number;
  date: string;
  clientId?: string;
  clientName?: string;
  receiptUrl?: string;
  notes?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  category: ExpenseCategory;
  description: string;
  amount: string;
  taxAmount: string;
  date: string;
  clientId?: string;
  clientName?: string;
  notes?: string;
}

export interface ExpenseFilter {
  category?: ExpenseCategory;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; icon: string }[] = [
  { key: 'travel', label: 'Travel', icon: 'Plane' },
  { key: 'office', label: 'Office Supplies', icon: 'Briefcase' },
  { key: 'software', label: 'Software', icon: 'Monitor' },
  { key: 'marketing', label: 'Marketing', icon: 'Megaphone' },
  { key: 'meals', label: 'Meals', icon: 'UtensilsCrossed' },
  { key: 'utilities', label: 'Utilities', icon: 'Zap' },
  { key: 'equipment', label: 'Equipment', icon: 'Wrench' },
  { key: 'professional', label: 'Professional Services', icon: 'GraduationCap' },
  { key: 'insurance', label: 'Insurance', icon: 'Shield' },
  { key: 'other', label: 'Other', icon: 'MoreHorizontal' },
];
