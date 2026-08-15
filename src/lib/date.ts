import { startOfDay, endOfDay } from 'date-fns';

/**
 * Returns the start and end of the day in UTC for a given client date string.
 * This ensures that a target created for "today" in the client's timezone
 * is correctly bounded when queried against UTC timestamps in the database.
 * 
 * @param clientDateString - A date string from the client (e.g. "2023-08-11")
 * @returns { start: Date, end: Date } - The boundaries in UTC
 */
export function getDayBoundaries(clientDateString?: string) {
  // If no date string is provided, use the current server time as a fallback.
  // Ideally, all requests should provide a client timezone offset or date string.
  const date = clientDateString ? new Date(clientDateString) : new Date();
  
  const start = startOfDay(date);
  const end = endOfDay(date);

  return { start, end };
}

/**
 * Normalizes a date to UTC for storage or querying.
 */
export function normalizeDate(date: Date | string): Date {
  return new Date(date);
}
