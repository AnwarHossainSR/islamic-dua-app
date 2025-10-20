import { clsx, type ClassValue } from 'clsx'
import { isSameDay } from 'date-fns'
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
