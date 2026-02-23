import { NetTerm } from '../types'

/**
 * Calculate the due date based on net term and issue date
 * Pure function: same inputs = same output
 * Always returns ISO string or null
 */
export function calculateDueDate(
  issueDate: string,
  netTerm: NetTerm
): string | null {
  if (!netTerm || netTerm.numberOfDays === 0) {
    return null
  }

  const base = new Date(issueDate)
  base.setDate(base.getDate() + netTerm.numberOfDays)
  
  return base.toISOString()
}

/**
 * Check if invoice is overdue (pure, no dependencies on status)
 * Only depends on dueDate
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date() > new Date(dueDate)
}

/**
 * Format net term for display
 * Example: "NET 30 (Due Mar 12, 2026)"
 */
export function formatNetTermDisplay(
  netTerm: NetTerm | null,
  dueDate: string | null
): string {
  if (!netTerm || !dueDate) {
    return 'No Due Date'
  }

  const date = new Date(dueDate)
  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return `${netTerm.description} (Due ${formatted})`
}

/**
 * Get remaining days until due date
 * Negative means overdue
 */
export function getRemainingDays(dueDate: string | null): number | null {
  if (!dueDate) return null

  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}