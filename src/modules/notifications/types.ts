export type NotificationType =
  | 'invoice_paid'
  | 'invoice_viewed'
  | 'invoice_overdue'
  | 'payment_received'
  | 'estimate_accepted'
  | 'estimate_rejected'
  | 'reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  timestamp: string;
}
