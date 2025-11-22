/**
 * DeleteInvoiceDialog Component
 *
 * Confirmation dialog for deleting an invoice
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteInvoice } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/formatters';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import type { Invoice } from '@/types/invoice';

interface DeleteInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSuccess?: () => void;
}

export function DeleteInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: DeleteInvoiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deleteInvoiceMutation = useDeleteInvoice();

  const canDelete = invoice.status !== 'PAID';
  const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteInvoiceMutation.mutateAsync(invoice.id);

      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              Are you sure you want to delete this invoice?
            </p>

            {/* Invoice Details */}
            <div className="rounded-lg border p-3 space-y-1 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span>{clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>

            <p className="text-sm text-destructive font-medium">
              This action cannot be undone.
            </p>
          </div>

          {/* Warning for PAID invoices */}
          {!canDelete && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You cannot delete invoices with PAID status.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || !canDelete}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Deleting...' : 'Delete Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
