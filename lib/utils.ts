import { clsx, type ClassValue } from 'clsx'
import { format, isSameDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isCurrentDay = (lastCompletedAt: string | null) => {
  if (!lastCompletedAt) return false
  const timeZone = 'Asia/Dhaka'
  const utcDate = new Date(lastCompletedAt)
  const date = toZonedTime(utcDate, timeZone)
  const nowInDhaka = toZonedTime(new Date(), timeZone)
  const completedToday = isSameDay(date, nowInDhaka)
  return completedToday
}

/**
 * Format date into human-readable or specific formats.
 *
 * @param dateInput - The input date string (UTC or local)
 * @param options - {
 *   formatType: 'human' | 'date' | 'datetime' | 'full' (default: 'human')
 *   source: 'utc' | 'local' (default: 'utc')
 *   locale: 'Asia/Dhaka' | 'UTC' (default: 'Asia/Dhaka')
 * }
 *
 * @returns string - Formatted date
 */
export const formatDateTime = (
  dateInput: string | Date,
  options?: {
    formatType?: 'human' | 'date' | 'datetime' | 'full'
    source?: 'utc' | 'local'
    locale?: 'Asia/Dhaka' | 'UTC'
  }
): string => {
  if (!dateInput) return 'Invalid date'

  const { formatType = 'human', source = 'utc', locale = 'Asia/Dhaka' } = options || {}

  // Convert to Date object
  const utcDate = source === 'utc' ? new Date(dateInput) : new Date(dateInput)
  const dateInZone = toZonedTime(utcDate, locale)

  let pattern = ''
  switch (formatType) {
    case 'date':
      pattern = 'PPP' // e.g., Oct 22, 2025
      break
    case 'datetime':
      pattern = 'PPp' // e.g., Oct 22, 2025, 10:45 PM
      break
    case 'full':
      pattern = 'PPpp' // e.g., Wednesday, October 22, 2025 at 10:45:30 PM
      break
    default:
      pattern = 'PPpp' // fallback human-readable
  }

  return format(dateInZone, pattern)
}
