// src/modules/invoices/types.ts

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'partial' | 'cancelled';

export interface StatusEvent {
  id: string;
  invoiceId: string;
  status: string;
  createdAt: string;
}

export interface NetTerm {
  numberOfDays: number;
  description: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  terms?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  lastSentVia?: 'email' | 'link' | 'pdf';
  statusHistory?: StatusEvent[];
  paidAt?: string;
  viewedAt?: string;
}

export interface InvoiceFilter {
  status?: InvoiceStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}