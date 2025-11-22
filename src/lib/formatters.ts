/**
 * Formatting Utilities
 *
 * Functions for formatting currency, dates, and other values
 */

/**
 * Currency information
 */
export interface CurrencyInfo {
  value: string; // ISO code (USD, EUR, GBP, etc.)
  label: string; // Display name
  symbol: string; // Currency symbol
}

/**
 * Available currencies
 */
export const CURRENCIES: CurrencyInfo[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'AU$' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
];

/**
 * Format currency amount
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyInfo = CURRENCIES.find((c) => c.value === currency);
  const symbol = currencyInfo?.symbol || '$';

  // Format with thousands separators and 2 decimal places
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${symbol}${formatted}`;
}

/**
 * Format date to readable string
 *
 * @param date - Date to format
 * @param format - Format style (default: 'medium')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formats = {
    short: {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  } as const;

  return new Intl.DateTimeFormat('en-US', formats[format]).format(dateObj);
}

/**
 * Format date for input field (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns ISO date string for input
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get status display information
 *
 * @param status - Proposal status
 * @returns Status display info
 */
export function getStatusDisplay(status: string) {
  const displays = {
    DRAFT: {
      label: 'Draft',
      icon: '📝',
      className: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    },
    SENT: {
      label: 'Sent',
      icon: '🟢',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    },
    ACCEPTED: {
      label: 'Accepted',
      icon: '✅',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    },
    REJECTED: {
      label: 'Rejected',
      icon: '❌',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    },
  };

  return displays[status as keyof typeof displays] || displays.DRAFT;
}

/**
 * Get invoice status display information
 *
 * @param status - Invoice status (including OVERDUE)
 * @returns Status display info
 */
export function getInvoiceStatusDisplay(status: string) {
  const displays = {
    DRAFT: {
      label: 'Draft',
      icon: '📝',
      className: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    },
    SENT: {
      label: 'Sent',
      icon: '📤',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    },
    PAID: {
      label: 'Paid',
      icon: '✅',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    },
    OVERDUE: {
      label: 'Overdue',
      icon: '⚠️',
      className: 'bg-red-100 text-red-700 font-semibold dark:bg-red-900/20 dark:text-red-300',
    },
  };

  return displays[status as keyof typeof displays] || displays.DRAFT;
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
