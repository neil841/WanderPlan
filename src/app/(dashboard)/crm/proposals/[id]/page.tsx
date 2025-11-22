/**
 * Proposal View Page
 *
 * Professional printable proposal preview
 */

'use client';

import { useState } from 'react';
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
  Send,
  Download,
  Trash2,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { useProposal } from '@/hooks/useProposals';
import { ProposalStatusBadge } from '@/components/proposals/ProposalStatusBadge';
import { SendProposalDialog } from '@/components/proposals/SendProposalDialog';
import { DeleteProposalDialog } from '@/components/proposals/DeleteProposalDialog';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function ProposalViewPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const { data, isLoading, error } = useProposal(proposalId);
  const proposal = data?.proposal;

  // Dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const canEdit = proposal?.status === 'DRAFT';
  const canSend = proposal?.status === 'DRAFT';
  const canDelete = proposal?.status !== 'ACCEPTED';

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load proposal'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const clientName = `${proposal.client.firstName} ${proposal.client.lastName}`;

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* Action Bar (not printed) */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crm/proposals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/crm/proposals/${proposal.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canSend && (
            <Button variant="outline" onClick={() => setSendDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Send to Client
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

      {/* Proposal Document */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-8 md:p-12 space-y-8 print:border-0 print:p-0">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground uppercase tracking-wide">
            Travel Proposal
          </div>
          <h1 className="text-4xl font-bold">{proposal.title}</h1>

          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <ProposalStatusBadge status={proposal.status} />
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <span className="text-muted-foreground">Created:</span>{' '}
              {formatDate(proposal.createdAt, 'medium')}
            </div>
            {proposal.validUntil && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <span className="text-muted-foreground">Valid Until:</span>{' '}
                  {formatDate(proposal.validUntil, 'medium')}
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Client Information */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{' '}
              <span className="font-medium">{clientName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{' '}
              <span className="font-medium">{proposal.client.email}</span>
            </div>
          </div>
        </div>

        {/* Trip Information */}
        {proposal.trip && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">Trip Information</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Trip:</span>{' '}
                  <span className="font-medium">{proposal.trip.name}</span>
                </div>
                {proposal.trip.startDate && proposal.trip.endDate && (
                  <div>
                    <span className="text-muted-foreground">Dates:</span>{' '}
                    {formatDate(proposal.trip.startDate, 'medium')} -{' '}
                    {formatDate(proposal.trip.endDate, 'medium')}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Description */}
        {proposal.description && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-sm whitespace-pre-wrap">{proposal.description}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Proposed Services */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Proposed Services</h2>
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
                {proposal.lineItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice, proposal.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total, proposal.currency)}
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
                {formatCurrency(proposal.subtotal, proposal.currency)}
              </span>
            </div>

            {proposal.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">
                  +{formatCurrency(proposal.tax, proposal.currency)}
                </span>
              </div>
            )}

            {proposal.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium">
                  -{formatCurrency(proposal.discount, proposal.currency)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center py-3 px-4 bg-primary/10 rounded-lg">
              <span className="text-lg font-bold">TOTAL:</span>
              <span className="text-2xl md:text-3xl font-bold">
                {formatCurrency(proposal.total, proposal.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        {proposal.terms && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">Terms and Conditions</h2>
              <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                {proposal.terms}
              </div>
              {proposal.validUntil && (
                <p className="mt-4 text-sm text-muted-foreground italic">
                  This proposal is valid until {formatDate(proposal.validUntil, 'long')}.
                </p>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-8 text-center text-xs text-muted-foreground print:block">
          <Separator className="mb-4" />
          <p>
            Created on {formatDate(proposal.createdAt, 'long')}
            {proposal.updatedAt && proposal.updatedAt !== proposal.createdAt && (
              <> • Last updated {formatDate(proposal.updatedAt, 'long')}</>
            )}
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <SendProposalDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        proposal={proposal}
        onSuccess={() => setSendDialogOpen(false)}
      />
      <DeleteProposalDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        proposal={proposal}
        onSuccess={() => router.push('/crm/proposals')}
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
