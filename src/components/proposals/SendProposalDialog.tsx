/**
 * SendProposalDialog Component
 *
 * Confirmation dialog for sending a proposal to client via email
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
import { Info, Loader2 } from 'lucide-react';
import { useSendProposal } from '@/hooks/useProposals';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Proposal } from '@/types/proposal';

interface SendProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  onSuccess?: () => void;
}

export function SendProposalDialog({
  open,
  onOpenChange,
  proposal,
  onSuccess,
}: SendProposalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sendProposalMutation = useSendProposal();

  const handleSend = async () => {
    try {
      setIsSubmitting(true);
      await sendProposalMutation.mutateAsync(proposal.id);

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

  const clientName = `${proposal.client.firstName} ${proposal.client.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Proposal to Client</DialogTitle>
          <DialogDescription>
            You are about to send this proposal to your client via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Proposal Summary */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Proposal:</span>
              <span className="font-medium">{proposal.title}</span>

              <span className="font-medium text-muted-foreground">Client:</span>
              <span>{clientName}</span>

              <span className="font-medium text-muted-foreground">Email:</span>
              <span>{proposal.client.email}</span>

              <span className="font-medium text-muted-foreground">Total:</span>
              <span className="font-semibold text-lg">
                {formatCurrency(proposal.total, proposal.currency)}
              </span>
            </div>
          </div>

          {/* Email Preview */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Email Preview:</h4>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3 text-sm">
              <div>
                <span className="font-medium">Subject:</span> Your Travel Proposal
              </div>

              <div className="space-y-2 text-muted-foreground">
                <p>Dear {proposal.client.firstName},</p>

                <p>
                  Please find attached your personalized travel proposal for{' '}
                  <span className="font-medium text-foreground">{proposal.title}</span>.
                </p>

                <div className="my-2 space-y-1">
                  <p className="font-medium text-foreground">
                    Total: {formatCurrency(proposal.total, proposal.currency)}
                  </p>
                  {proposal.validUntil && (
                    <p>Valid Until: {formatDate(proposal.validUntil, 'medium')}</p>
                  )}
                </div>

                <p className="text-center my-3">
                  <Button variant="outline" size="sm" disabled className="pointer-events-none">
                    View Proposal
                  </Button>
                </p>

                <p>Best regards,</p>
                <p className="font-medium text-foreground">[Your Name]</p>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Client will receive an email with a link to view the proposal.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm and Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
