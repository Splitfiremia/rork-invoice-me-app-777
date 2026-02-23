import { InvoiceLineItem, Invoice } from '../types';
import { Estimate } from '../../estimates/types';

export function calculateLineItemAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateSubtotal(items: InvoiceLineItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100;
}

export function calculateTotal(subtotal: number, taxAmount: number, discount: number): number {
  return Math.round((subtotal + taxAmount - discount) * 100) / 100;
}

export function calculateAmountDue(total: number, amountPaid: number): number {
  return Math.round((total - amountPaid) * 100) / 100;
}

// Parse existing invoice numbers to find max, preventing collisions after deletions
// DO NOT simplify to use .length - that will reintroduce the collision bug
export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
  const year = new Date().getFullYear();
  
  // Extract numeric parts from existing invoice numbers for current year
  const currentYearNumbers = existingInvoices
    .map(inv => {
      const match = inv.invoiceNumber.match(/^INV-(\d{4})-(\d{4})$/);
      if (match && match[1] === String(year)) {
        return parseInt(match[2], 10);
      }
      return 0;
    })
    .filter(num => num > 0);
  
  // Find max and increment, or start at 1
  const maxNum = currentYearNumbers.length > 0 ? Math.max(...currentYearNumbers) : 0;
  const nextNum = String(maxNum + 1).padStart(4, '0');
  return `INV-${year}-${nextNum}`;
}

// Parse existing estimate numbers to find max, preventing collisions after deletions
// DO NOT simplify to use .length - that will reintroduce the collision bug
export function generateEstimateNumber(existingEstimates: Estimate[]): string {
  const year = new Date().getFullYear();
  
  // Extract numeric parts from existing estimate numbers for current year
  const currentYearNumbers = existingEstimates
    .map(est => {
      const match = est.estimateNumber.match(/^EST-(\d{4})-(\d{4})$/);
      if (match && match[1] === String(year)) {
        return parseInt(match[2], 10);
      }
      return 0;
    })
    .filter(num => num > 0);
  
  // Find max and increment, or start at 1
  const maxNum = currentYearNumbers.length > 0 ? Math.max(...currentYearNumbers) : 0;
  const nextNum = String(maxNum + 1).padStart(4, '0');
  return `EST-${year}-${nextNum}`;
}

export function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
