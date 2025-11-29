/**
 * CreatePollDialog Component
 *
 * Dialog for creating a new poll
 */

'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const createPollSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  options: z
    .array(z.string().min(1, 'Option cannot be empty').max(200))
    .min(2, 'At least 2 options required')
    .max(10, 'Maximum 10 options allowed'),
  allowMultipleVotes: z.boolean(),
  expiresAt: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === '') return null;
      // Convert datetime-local to ISO string
      return new Date(val).toISOString();
    }),
});

type CreatePollForm = z.infer<typeof createPollSchema>;

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePollForm) => Promise<void>;
  isPending?: boolean;
}

export function CreatePollDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: CreatePollDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreatePollForm>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: '',
      options: ['', ''],
      allowMultipleVotes: false,
      expiresAt: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'options',
  });

  const allowMultipleVotes = watch('allowMultipleVotes');

  const handleFormSubmit = async (data: CreatePollForm) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Poll</DialogTitle>
          <DialogDescription>
            Ask your trip collaborators to vote on options
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">
              Question <span className="text-destructive">*</span>
            </Label>
            <Input
              id="question"
              placeholder="Where should we eat dinner?"
              {...register('question')}
              className={cn(errors.question && 'border-destructive')}
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question.message}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>
              Options <span className="text-destructive">*</span>
            </Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  {...register(`options.${index}`)}
                  className={cn(
                    'flex-1',
                    errors.options?.[index] && 'border-destructive'
                  )}
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.options && typeof errors.options.message === 'string' && (
              <p className="text-sm text-destructive">{errors.options.message}</p>
            )}

            {fields.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="allowMultipleVotes"
                {...register('allowMultipleVotes')}
              />
              <Label
                htmlFor="allowMultipleVotes"
                className="text-sm font-normal cursor-pointer"
              >
                Allow multiple choices
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration (optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register('expiresAt')}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Poll
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
