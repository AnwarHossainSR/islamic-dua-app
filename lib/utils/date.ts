// Get current Bangladesh date string (YYYY-MM-DD)
export function getBangladeshDateString(): string {
  return new Date().toLocaleDateString('en-CA') // ISO format YYYY-MM-DD
}

// Get Bangladesh date string from any date
export function toBangladeshDateString(date: Date): string {
  return date.toLocaleDateString('en-CA') // ISO format YYYY-MM-DD
}