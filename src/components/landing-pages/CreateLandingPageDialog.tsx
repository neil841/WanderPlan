/**
 * Create Landing Page Dialog
 *
 * Modal dialog for creating a new landing page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

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
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useCreateLandingPage } from '@/hooks/useLandingPages';
import type { CreateLandingPageRequest } from '@/types/landing-page';

/**
 * Form validation schema
 */
const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

type FormData = z.infer<typeof formSchema>;

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

interface CreateLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLandingPageDialog({
  open,
  onOpenChange,
}: CreateLandingPageDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
    },
  });

  const createMutation = useCreateLandingPage();

  // Watch title to auto-generate slug
  const titleValue = watch('title');
  const [slugTouched, setSlugTouched] = useState(false);

  // Auto-generate slug from title (if slug not manually edited)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (!slugTouched) {
      setValue('slug', generateSlug(newTitle));
    }
  };

  // Mark slug as manually touched
  const handleSlugFocus = () => {
    setSlugTouched(true);
  };

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      // Create landing page with empty content
      const requestData: CreateLandingPageRequest = {
        title: data.title,
        slug: data.slug,
        description: data.description || undefined,
        content: { blocks: [] }, // Start with empty blocks
        isPublished: false, // Start as draft
      };

      const response = await createMutation.mutateAsync(requestData);

      // Close dialog and navigate to editor
      onOpenChange(false);
      reset();
      setSlugTouched(false);
      router.push(`/crm/landing-pages/${response.data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create landing page');
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
      setSlugTouched(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Landing Page</DialogTitle>
          <DialogDescription>
            Create a new landing page to capture leads. You'll be able to add content blocks after creating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Paris Adventure 2025"
              {...register('title')}
              onChange={(e) => {
                register('title').onChange(e);
                handleTitleChange(e);
              }}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                /p/
              </span>
              <Input
                id="slug"
                type="text"
                placeholder="e.g., paris-adventure-2025"
                className="pl-10 font-mono text-sm"
                {...register('slug')}
                onFocus={handleSlugFocus}
                aria-invalid={!!errors.slug}
                aria-describedby={errors.slug ? 'slug-error' : undefined}
              />
            </div>
            <p className="text-xs text-neutral-500">
              URL-friendly version of the title. Only lowercase letters, numbers, and hyphens.
            </p>
            {errors.slug && (
              <p id="slug-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.slug.message}
              </p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description for SEO and social sharing..."
              rows={3}
              {...register('description')}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create & Edit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
