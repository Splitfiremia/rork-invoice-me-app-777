import { Invoice, StatusEvent } from '../types'
import { isOverdue } from './dueDate'

export function deriveInvoiceStatus(
  invoice: Invoice,
  now: Date = new Date()
): string {
  if (invoice.amountPaid && invoice.total && 
      invoice.amountPaid >= invoice.total && invoice.total > 0) {
    return 'paid'
  }

  if (invoice.amountPaid && invoice.total &&
      invoice.amountPaid > 0 && invoice.amountPaid < invoice.total) {
    return 'partial'
  }

  if (invoice.dueDate && isOverdue(invoice.dueDate)) {
    return 'overdue'
  }

  if (invoice.sentAt) {
    return 'sent'
  }

  return 'draft'
}

export function markInvoiceSent(
  invoice: Invoice,
  channel: 'email' | 'link' | 'pdf'
): Invoice {
  const now = new Date().toISOString()
  
  const statusEvent: StatusEvent = {
    id: Math.random().toString(36).substring(7),
    invoiceId: invoice.id,
    status: 'sent',
    createdAt: now,
  }

  return {
    ...invoice,
    sentAt: now,
    lastSentVia: channel,
    statusHistory: [...(invoice.statusHistory || []), statusEvent],
    updatedAt: new Date().toISOString(),
  }
}

export function recordPayment(
  invoice: Invoice,
  amount: number
): Invoice {
  if (amount <= 0) return invoice

  const newAmountPaid = Math.min(
    (invoice.amountPaid || 0) + amount,
    invoice.total || 0
  )

  const now = new Date().toISOString()
  const updatedInvoice = { ...invoice, amountPaid: newAmountPaid }
  const newStatus = deriveInvoiceStatus(updatedInvoice)

  const statusEvent: StatusEvent = {
    id: Math.random().toString(36).substring(7),
    invoiceId: invoice.id,
    status: newStatus,
    createdAt: now,
  }

  return {
    ...updatedInvoice,
    paidAt: newAmountPaid >= (invoice.total || 0) ? now : invoice.paidAt,
    statusHistory: [...(invoice.statusHistory || []), statusEvent],
    updatedAt: new Date().toISOString(),
  }
}

export function markInvoiceViewed(invoice: Invoice): Invoice {
  if (invoice.viewedAt) return invoice

  return {
    ...invoice,
    viewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function getInvoiceStatusDisplay(invoice: Invoice): {
  status: string
  color: string
  icon: string
  description: string
} {
  const status = deriveInvoiceStatus(invoice)

  const statusMap: Record<string, { color: string; icon: string; description: string }> = {
    draft: {
      color: '#9CA3AF',
      icon: 'file-text',
      description: 'Awaiting to be sent',
    },
    sent: {
      color: '#3B82F6',
      icon: 'send',
      description: 'Invoice sent',
    },
    overdue: {
      color: '#EF4444',
      icon: 'alert-circle',
      description: 'Payment overdue',
    },
    partial: {
      color: '#F59E0B',
      icon: 'clock',
      description: 'Partial payment received',
    },
    paid: {
      color: '#10B981',
      icon: 'check-circle',
      description: 'Payment received',
    },
  }

  const entry = statusMap[status] ?? {
    color: '#6B7280',
    icon: 'file-text',
    description: 'Unknown status',
  };

  return {
    status,
    ...entry,
  }
}