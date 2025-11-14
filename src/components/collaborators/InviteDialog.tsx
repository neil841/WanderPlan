/**
 * Invite Collaborator Dialog
 *
 * Dialog for inviting a new collaborator to a trip.
 *
 * Features:
 * - Email input with validation
 * - Role selector (VIEWER, EDITOR, ADMIN)
 * - Optional personal message
 * - Form validation
 * - Success/error feedback
 *
 * @component
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CollaboratorRole } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInviteCollaborator } from '@/hooks/useCollaborators';
import { Loader2 } from 'lucide-react';
import { getRoleDisplayName } from '@/types/collaborator';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canInviteAdmin: boolean;
}

export function InviteDialog({
  tripId,
  open,
  onOpenChange,
  canInviteAdmin,
}: InviteDialogProps) {
  const inviteMutation = useInviteCollaborator(tripId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'EDITOR',
      message: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: InviteFormData) => {
    await inviteMutation.mutateAsync(data);
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Invite someone to collaborate on this trip. They'll receive an email with an invitation link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              {...register('email')}
              disabled={inviteMutation.isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              They must already have a WanderPlan account.
            </p>
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as CollaboratorRole)}
              disabled={inviteMutation.isPending}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{getRoleDisplayName('VIEWER')}</span>
                    <span className="text-xs text-muted-foreground">
                      Can view trip details and itinerary
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="EDITOR">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{getRoleDisplayName('EDITOR')}</span>
                    <span className="text-xs text-muted-foreground">
                      Can edit trip, create events, and manage budget
                    </span>
                  </div>
                </SelectItem>
                {canInviteAdmin && (
                  <SelectItem value="ADMIN">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{getRoleDisplayName('ADMIN')}</span>
                      <span className="text-xs text-muted-foreground">
                        Full access including managing collaborators
                      </span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal note to your invitation..."
              rows={3}
              {...register('message')}
              disabled={inviteMutation.isPending}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watch('message')?.length || 0} / 500 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
