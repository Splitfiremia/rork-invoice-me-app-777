export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  status: EstimateStatus;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  expiryDate: string;
  lineItems: EstimateLineItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string;
  terms?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateFormData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  expiryDate: string;
  lineItems: EstimateLineItem[];
  notes?: string;
  terms?: string;
  discount: number;
  currency: string;
}

export interface EstimateFilter {
  status?: EstimateStatus;
  search?: string;
}
