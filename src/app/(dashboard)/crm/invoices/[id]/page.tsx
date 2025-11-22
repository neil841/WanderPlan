/**
 * Invoice View Page
 *
 * Professional printable invoice preview
 */

'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  AlertCircle,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { useInvoice } from '@/hooks/useInvoices';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { MarkAsPaidDialog } from '@/components/invoices/MarkAsPaidDialog';
import { DeleteInvoiceDialog } from '@/components/invoices/DeleteInvoiceDialog';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Invoice } from '@/types/invoice';

/**
 * Helper to calculate effective invoice status (including OVERDUE)
 */
function getEffectiveStatus(invoice: Invoice) {
  const isOverdue =
    invoice.status === 'SENT' &&
    new Date(invoice.dueDate) < new Date() &&
    !invoice.paidAt;
  return isOverdue ? 'OVERDUE' : invoice.status;
}

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data, isLoading, error } = useInvoice(invoiceId);
  const invoice = data?.invoice;

  // Dialog state
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const canEdit = invoice?.status === 'DRAFT';
  const canMarkPaid = invoice && (invoice.status === 'SENT' || getEffectiveStatus(invoice) === 'OVERDUE');
  const canDelete = invoice?.status !== 'PAID';

  const effectiveStatus = invoice ? getEffectiveStatus(invoice) : undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load invoice'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* Action Bar (not printed) */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crm/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/crm/invoices/${invoice.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canMarkPaid && (
            <Button variant="outline" onClick={() => setMarkPaidDialogOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-8 md:p-12 space-y-8 print:border-0 print:p-0">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground uppercase tracking-wide">
            Invoice
          </div>
          <h1 className="text-4xl font-bold">{invoice.title}</h1>

          <div className="flex flex-col items-center gap-3 text-sm">
            {/* Invoice Number */}
            <div className="text-xl font-mono font-semibold">
              {invoice.invoiceNumber}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <InvoiceStatusBadge status={effectiveStatus!} />
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <span className="text-muted-foreground">Issued:</span>{' '}
                {formatDate(invoice.issueDate, 'medium')}
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <span className="text-muted-foreground">Due:</span>{' '}
                {formatDate(invoice.dueDate, 'medium')}
              </div>
            </div>

            {/* Paid Date */}
            {invoice.paidAt && (
              <div className="text-green-600 dark:text-green-400 font-medium">
                Paid on {formatDate(invoice.paidAt, 'medium')}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Client Information */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Bill To</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{' '}
              <span className="font-medium">{clientName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{' '}
              <span className="font-medium">{invoice.client.email}</span>
            </div>
          </div>
        </div>

        {/* Trip Information */}
        {invoice.trip && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">Related Trip</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Trip:</span>{' '}
                  <span className="font-medium">{invoice.trip.name}</span>
                </div>
                {invoice.trip.startDate && invoice.trip.endDate && (
                  <div>
                    <span className="text-muted-foreground">Dates:</span>{' '}
                    {formatDate(invoice.trip.startDate, 'medium')} -{' '}
                    {formatDate(invoice.trip.endDate, 'medium')}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Description */}
        {invoice.description && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-sm whitespace-pre-wrap">{invoice.description}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Services/Items */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center w-20">Qty</TableHead>
                  <TableHead className="text-right w-32">Unit Price</TableHead>
                  <TableHead className="text-right w-32">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total, invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 space-y-2 max-w-md ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>

            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">
                  +{formatCurrency(invoice.tax, invoice.currency)}
                </span>
              </div>
            )}

            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium">
                  -{formatCurrency(invoice.discount, invoice.currency)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center py-3 px-4 bg-primary/10 rounded-lg">
              <span className="text-lg font-bold">TOTAL DUE:</span>
              <span className="text-2xl md:text-3xl font-bold">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        {invoice.terms && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">Payment Terms</h2>
              <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                {invoice.terms}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-8 text-center text-xs text-muted-foreground print:block">
          <Separator className="mb-4" />
          <p>
            Invoice issued on {formatDate(invoice.issueDate, 'long')}
            {invoice.updatedAt && invoice.updatedAt !== invoice.createdAt && (
              <> • Last updated {formatDate(invoice.updatedAt, 'long')}</>
            )}
          </p>
          <p className="mt-2">
            Payment due by {formatDate(invoice.dueDate, 'long')}
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <MarkAsPaidDialog
        open={markPaidDialogOpen}
        onOpenChange={setMarkPaidDialogOpen}
        invoice={invoice}
        onSuccess={() => setMarkPaidDialogOpen(false)}
      />
      <DeleteInvoiceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        invoice={invoice}
        onSuccess={() => router.push('/crm/invoices')}
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          @page {
            margin: 2cm;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .print\\:border-0 {
            border: none !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
