export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
}
