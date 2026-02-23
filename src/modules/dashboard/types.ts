export interface DashboardStats {
  totalRevenue: number;
  totalOutstanding: number;
  totalOverdue: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  clientCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice_created' | 'invoice_paid' | 'invoice_sent' | 'client_added' | 'payment_received';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}
