/**
 * Delete Client Dialog Component
 *
 * Confirmation dialog for deleting a client
 */

'use client';

import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useDeleteClient } from '@/hooks/useClients';
import type { Client } from '@/types/crm';

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onSuccess?: () => void;
}

export function DeleteClientDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: DeleteClientDialogProps) {
  const deleteMutation = useDeleteClient();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(client.id);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
            Delete Client
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Are you sure you want to delete this client?</p>

            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">
                {client.firstName} {client.lastName}
              </p>
              <p className="text-muted-foreground">{client.email}</p>
            </div>

            <p className="text-destructive font-medium">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Client'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
