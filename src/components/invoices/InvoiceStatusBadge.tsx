/**
 * InvoiceStatusBadge Component
 *
 * Displays a status badge for invoices with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { getInvoiceStatusDisplay } from '@/lib/formatters';
import type { InvoiceStatus } from '@/types/invoice';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const display = getInvoiceStatusDisplay(status);

  return (
    <Badge
      className={`${display.className} ${className || ''}`}
      aria-label={`Status: ${display.label}`}
    >
      <span className="mr-1" aria-hidden="true">{display.icon}</span>
      {display.label}
    </Badge>
  );
}
