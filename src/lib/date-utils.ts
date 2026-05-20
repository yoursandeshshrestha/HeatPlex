/**
 * Date formatting utilities
 * Centralized date/time formatting for consistent display across the platform
 */

/**
 * Format date as "8 May 2026"
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "8 May 2026")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format time as "2:30 PM"
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date and time as "8 May 2026, 2:30 PM"
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return `${formatDate(d)}, ${formatTime(d)}`;
}

/**
 * Format date as short format "8 May" (without year)
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "8 May")
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
}
