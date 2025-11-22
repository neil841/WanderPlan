/**
 * Invoice Number Generation
 *
 * Generates unique invoice numbers with format: INV-YYYYMMDD-XXXX
 * Example: INV-20251122-0001
 */

import { prisma } from '@/lib/db';

/**
 * Generate next invoice number for today
 *
 * Format: INV-YYYYMMDD-XXXX
 * - INV: Prefix
 * - YYYYMMDD: Current date
 * - XXXX: 4-digit sequence number (increments within each day)
 *
 * @returns Promise resolving to unique invoice number
 *
 * @example
 * const invoiceNumber = await generateInvoiceNumber();
 * // Returns: "INV-20251122-0001"
 */
export async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();

  // Format date as YYYYMMDD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = `INV-${dateStr}-`;

  // Find max invoice number for today
  // Using raw SQL for better performance with string operations
  const result = await prisma.$queryRaw<Array<{ invoice_number: string }>>`
    SELECT invoice_number
    FROM invoices
    WHERE invoice_number LIKE ${prefix + '%'}
    ORDER BY invoice_number DESC
    LIMIT 1
  `;

  let sequence = 1;

  if (result && result.length > 0) {
    const lastInvoiceNumber = result[0].invoice_number;
    // Extract sequence number (last 4 digits)
    const lastSequence = lastInvoiceNumber.split('-')[2];
    if (lastSequence) {
      sequence = parseInt(lastSequence, 10) + 1;
    }
  }

  // Format sequence as 4-digit number with leading zeros
  const sequenceStr = String(sequence).padStart(4, '0');

  return `${prefix}${sequenceStr}`;
}

/**
 * Validate invoice number format
 *
 * @param invoiceNumber - Invoice number to validate
 * @returns true if valid format, false otherwise
 *
 * @example
 * isValidInvoiceNumber("INV-20251122-0001"); // true
 * isValidInvoiceNumber("INVALID"); // false
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // Format: INV-YYYYMMDD-XXXX
  const pattern = /^INV-\d{8}-\d{4}$/;

  // Check basic format first
  if (!pattern.test(invoiceNumber)) {
    return false;
  }

  // Extract date portion (YYYYMMDD) and validate it's a real date
  const datePart = invoiceNumber.split('-')[1];
  const year = parseInt(datePart.substring(0, 4), 10);
  const month = parseInt(datePart.substring(4, 6), 10);
  const day = parseInt(datePart.substring(6, 8), 10);

  // Validate month (01-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // Validate day (01-31, with month-specific limits)
  // Get actual number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  return true;
}
