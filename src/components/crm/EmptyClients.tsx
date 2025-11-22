/**
 * EmptyClients Component
 *
 * Displays an empty state when there are no clients in the CRM.
 * Includes a call-to-action to add the first client.
 *
 * @component
 * @example
 * <EmptyClients onAddClient={() => setShowClientDialog(true)} />
 */

'use client';

import { Users2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface EmptyClientsProps {
  onAddClient?: () => void;
}

export function EmptyClients({ onAddClient }: EmptyClientsProps) {
  return (
    <EmptyState
      icon={Users2}
      title="No clients yet"
      description="Start building your client list to manage contacts, create proposals, and send invoices all in one place."
      action={
        onAddClient
          ? {
              label: 'Add First Client',
              onClick: onAddClient,
            }
          : undefined
      }
    />
  );
}

/**
 * EmptyClientsFiltered Component
 *
 * Displays when no clients match the current filter/search.
 */
export function EmptyClientsFiltered() {
  return (
    <EmptyState
      icon={Users2}
      title="No clients found"
      description="Try adjusting your search or filters to find the client you're looking for."
    />
  );
}
