/**
 * MarkAsPaidDialog Component
 *
 * Confirmation dialog for marking an invoice as paid
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
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useMarkInvoiceAsPaid } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/formatters';
import type { Invoice } from '@/types/invoice';

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSuccess?: () => void;
}

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: MarkAsPaidDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const markAsPaidMutation = useMarkInvoiceAsPaid();

  const handleMarkPaid = async () => {
    try {
      setIsSubmitting(true);
      await markAsPaidMutation.mutateAsync(invoice.id);

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

  const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Mark Invoice as Paid</DialogTitle>
          <DialogDescription>
            Confirm payment received for this invoice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              Are you sure you want to mark this invoice as paid?
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
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                This will record the current date and time as the payment date.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleMarkPaid} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Marking as Paid...' : 'Mark as Paid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
