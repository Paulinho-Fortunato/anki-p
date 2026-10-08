/**
 * Date utilities - local-time aware helpers
 *
 * SQLite stores timestamps as ISO-8601 UTC strings. Comparing them with the
 * user's "today" requires converting to LOCAL calendar dates first, otherwise
 * users in negative UTC offsets (e.g. Brazil, -03:00) see their stats/streak
 * flip at 03:00 local time instead of midnight.
 */

/** Returns the local calendar date of `date` as 'YYYY-MM-DD'. */
export function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns today's local calendar date as 'YYYY-MM-DD'. */
export function getTodayLocal(): string {
  return getLocalDateStr(new Date());
}

/**
 * Converts an ISO timestamp (UTC) to its LOCAL calendar date string,
 * applying an optional day offset (negative = days in the past).
 */
export function isoToLocalDateStr(iso: string, dayOffset: number = 0): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  if (dayOffset !== 0) d.setDate(d.getDate() + dayOffset);
  return getLocalDateStr(d);
}

/**
 * Local 'YYYY-MM-DD' -> start-of-day UTC ISO instant.
 * Useful as a lower bound for SQL comparisons on UTC timestamps.
 */
export function localDateToUtcIsoStart(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0)).toISOString();
}

/**
 * Local 'YYYY-MM-DD' -> end-of-day UTC ISO instant (inclusive upper bound).
 */
export function localDateToUtcIsoEnd(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999)).toISOString();
}
