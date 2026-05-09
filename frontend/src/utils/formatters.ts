import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, 'MMM dd, yyyy') : '-'
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, 'MMM dd, yyyy HH:mm') : '-'
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '-'
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatQuantity(qty: number, unit?: string): string {
  const formatted = Number.isInteger(qty) ? String(qty) : qty.toFixed(2)
  return unit ? `${formatted} ${unit}` : formatted
}
