import { clsx, type ClassValue } from 'clsx'
import { format, isSameDay, formatDistanceToNow } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isCurrentDay = (lastCompletedAt: number | null) => {
  if (!lastCompletedAt || isNaN(lastCompletedAt) || lastCompletedAt === null) return false

  const completedDate = new Date(lastCompletedAt)
  const completedBdTime = new Date(
    completedDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })
  )

  const now = new Date()
  const bdNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))

  return isSameDay(completedBdTime, bdNow)
}

export const formatDateTime = (
  dateInput: string | Date,
  formatType: 'date' | 'datetime' | 'full' = 'datetime'
): string => {
  if (!dateInput) return 'Invalid date'

  const date = new Date(dateInput)

  switch (formatType) {
    case 'date':
      return format(date, 'PPP')
    case 'datetime':
      return format(date, 'PPp')
    case 'full':
      return format(date, 'PPpp')
    default:
      return format(date, 'PPp')
  }
}

export function formatTimeAgo(timestamp: number | null): string {
  if (!timestamp) return 'Never'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  if (diffMs < 30000) {
    return 'Just now'
  }
  
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatNumber(num: number, decimals: number = 1): string {
  if (num < 1000) return num.toString()

  const units = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ]

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = (num / unit.value).toFixed(decimals)
      return parseFloat(formatted) + unit.suffix
    }
  }

  return num.toString()
}
