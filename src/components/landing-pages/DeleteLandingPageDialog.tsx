/**
 * Delete Landing Page Dialog
 *
 * Confirmation dialog for deleting a landing page
 */

'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

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

import { useDeleteLandingPage } from '@/hooks/useLandingPages';
import type { LandingPage } from '@/types/landing-page';

interface DeleteLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landingPage: LandingPage;
}

export function DeleteLandingPageDialog({
  open,
  onOpenChange,
  landingPage,
}: DeleteLandingPageDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useDeleteLandingPage();

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(landingPage.slug);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete landing page');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset error when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle>Delete Landing Page</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Confirmation Message */}
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Are you sure you want to delete{' '}
            <strong className="font-semibold">{landingPage.title}</strong>?
          </p>

          {/* Landing Page Details */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Title:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {landingPage.title}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Slug:</span>
              <code className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded font-mono">
                {landingPage.slug}
              </code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {landingPage.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong className="font-semibold">Warning:</strong> This will permanently delete the landing page
              {landingPage.isPublished && ' and make it inaccessible to visitors'}. All associated data will be lost.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Landing Page'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
