/**
 * EmptyInvoices Component
 *
 * Displays an empty state when there are no invoices.
 * Includes a call-to-action to create the first invoice.
 *
 * @component
 * @example
 * <EmptyInvoices onCreateInvoice={() => navigate('/crm/invoices/new')} />
 */

'use client';

import { Receipt } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyInvoicesProps {
  onCreateInvoice?: () => void;
}

export function EmptyInvoices({ onCreateInvoice }: EmptyInvoicesProps) {
  return (
    <EmptyState
      icon={Receipt}
      title="No invoices yet"
      description="Create and send professional invoices to your clients. Track payments and manage your billing all in one place."
      action={
        onCreateInvoice
          ? {
              label: 'Create First Invoice',
              onClick: onCreateInvoice,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyInvoicesFiltered Component
 *
 * Displays when no invoices match the current filter.
 */
export function EmptyInvoicesFiltered() {
  return (
    <EmptyState
      icon={Receipt}
      title="No invoices found"
      description="Try adjusting your filters to see more invoices."
    />
  );
}

/**
 * EmptyUnpaidInvoices Component
 *
 * Displays when there are no unpaid invoices.
 */
export function EmptyUnpaidInvoices() {
  return (
    <EmptyState
      icon={Receipt}
      title="All caught up!"
      description="You have no unpaid invoices. All your invoices have been paid or marked as paid."
    />
  );
}
