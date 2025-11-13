import { clsx, type ClassValue } from 'clsx'
import { format, isSameDay } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isCurrentDay = (lastCompletedAt: number | null) => {
  if (!lastCompletedAt) return false
  
  // Convert UTC timestamp to Bangladesh time
  const completedDate = new Date(lastCompletedAt)
  const completedBdTime = new Date(completedDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
  
  // Get current Bangladesh time
  const now = new Date()
  const bdNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
  
  return isSameDay(completedBdTime, bdNow)
}

/**
 * Format date into human-readable formats.
 * Database timestamps are already in Bangladesh time.
 */
export const formatDateTime = (
  dateInput: string | Date,
  formatType: 'date' | 'datetime' | 'full' = 'datetime'
): string => {
  if (!dateInput) return 'Invalid date'

  const date = new Date(dateInput)

  switch (formatType) {
    case 'date':
      return format(date, 'PPP') // Oct 22, 2025
    case 'datetime':
      return format(date, 'PPp') // Oct 22, 2025, 10:45 PM
    case 'full':
      return format(date, 'PPpp') // Wednesday, October 22, 2025 at 10:45:30 PM
    default:
      return format(date, 'PPp')
  }
}

/**
 * Sort challenges to prioritize incomplete ones (not completed today) at the top
 */
export function sortChallengesByCompletion<T extends { last_completed_at?: number | null }>(
  challenges: T[]
): T[] {
  return challenges.sort((a, b) => {
    const aCompletedToday = isCurrentDay(a.last_completed_at || null)
    const bCompletedToday = isCurrentDay(b.last_completed_at || null)

    // Not completed today should come first (return -1 means 'a' comes before 'b')
    if (!aCompletedToday && bCompletedToday) return -1
    // Completed today should come last (return 1 means 'a' comes after 'b')
    if (aCompletedToday && !bCompletedToday) return 1

    // If both have same completion status, maintain original order
    return 0
  })
}

/**
 * Format large numbers with K, M, B suffixes
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., 1.2K, 3.4M, 5.6B)
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num < 1000) return num.toString()
  
  const units = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ]
  
  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = (num / unit.value).toFixed(decimals)
      // Remove trailing zeros and decimal point if not needed
      return parseFloat(formatted) + unit.suffix
    }
  }
  
  return num.toString()
}
