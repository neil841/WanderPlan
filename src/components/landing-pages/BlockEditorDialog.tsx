/**
 * Block Editor Dialog
 *
 * Modal dialog for editing different block types
 */

'use client';

import { useState, useEffect } from 'react';
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

import type { LandingPageBlock, LandingPageBlockType } from '@/types/landing-page';

interface BlockEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: LandingPageBlock;
  blockType: LandingPageBlockType;
  onSave: (block: LandingPageBlock) => void;
}

// Validation schemas for different block types
const heroSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  backgroundImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const textSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000),
});

const featuresSchema = z.object({
  items: z.array(z.object({
    icon: z.string().min(1),
    title: z.string().min(1).max(100),
    description: z.string().max(500),
  })).max(6, 'Maximum 6 features'),
});

const gallerySchema = z.object({
  images: z.array(z.object({
    url: z.string().url('Must be a valid URL'),
    alt: z.string().min(1).max(200),
    caption: z.string().max(200).optional(),
  })).max(12, 'Maximum 12 images'),
});

const leadCaptureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  submitText: z.string().min(1, 'Submit button text is required').max(50),
  successMessage: z.string().max(500).optional(),
});

const pricingSchema = z.object({
  plans: z.array(z.object({
    name: z.string().min(1).max(100),
    price: z.number().nonnegative(),
    currency: z.string().length(3),
    features: z.array(z.string()),
    highlighted: z.boolean(),
  })).max(4, 'Maximum 4 pricing plans'),
});

type HeroFormData = z.infer<typeof heroSchema>;
type TextFormData = z.infer<typeof textSchema>;

export function BlockEditorDialog({
  open,
  onOpenChange,
  block,
  blockType,
  onSave,
}: BlockEditorDialogProps) {
  const [error, setError] = useState<string | null>(null);

  // Determine schema based on block type
  const getSchema = () => {
    switch (blockType) {
      case 'hero':
        return heroSchema;
      case 'text':
        return textSchema;
      case 'features':
        return featuresSchema;
      case 'gallery':
        return gallerySchema;
      case 'lead-capture':
        return leadCaptureSchema;
      case 'pricing':
        return pricingSchema;
      default:
        return z.object({});
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: block.data,
  });

  // Reset form when block changes
  useEffect(() => {
    reset(block.data);
  }, [block.data, reset]);

  const onSubmit = async (data: any) => {
    setError(null);

    try {
      const updatedBlock: LandingPageBlock = {
        ...block,
        data,
      };

      onSave(updatedBlock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save block');
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Render form fields based on block type
  const renderFormFields = () => {
    switch (blockType) {
      case 'hero':
        return (
          <>
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Discover Paris"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input
                id="subtitle"
                type="text"
                placeholder="e.g., The City of Light awaits you"
                {...register('subtitle')}
              />
            </div>

            {/* Background Image */}
            <div className="space-y-2">
              <Label htmlFor="backgroundImage">Background Image URL (optional)</Label>
              <Input
                id="backgroundImage"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register('backgroundImage')}
                aria-invalid={!!errors.backgroundImage}
              />
              {errors.backgroundImage && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.backgroundImage.message as string}
                </p>
              )}
            </div>

            {/* CTA Button Text */}
            <div className="space-y-2">
              <Label htmlFor="ctaText">CTA Button Text (optional)</Label>
              <Input
                id="ctaText"
                type="text"
                placeholder="e.g., Book Now"
                {...register('ctaText')}
              />
            </div>

            {/* CTA Button URL */}
            <div className="space-y-2">
              <Label htmlFor="ctaUrl">CTA Button URL (optional)</Label>
              <Input
                id="ctaUrl"
                type="url"
                placeholder="https://example.com/book"
                {...register('ctaUrl')}
                aria-invalid={!!errors.ctaUrl}
              />
              {errors.ctaUrl && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.ctaUrl.message as string}
                </p>
              )}
            </div>
          </>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Enter your text content here..."
              rows={10}
              {...register('content')}
              aria-invalid={!!errors.content}
            />
            <p className="text-xs text-neutral-500">
              Supports plain text. Rich text editor coming soon.
            </p>
            {errors.content && (
              <p className="text-sm text-red-600" role="alert">
                {errors.content.message as string}
              </p>
            )}
          </div>
        );

      case 'features':
      case 'gallery':
      case 'lead-capture':
      case 'pricing':
        return (
          <Alert>
            <AlertDescription>
              {blockType.charAt(0).toUpperCase() + blockType.slice(1)} block editor coming soon in Phase 3.
              This block type is not yet supported.
            </AlertDescription>
          </Alert>
        );

      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    const titles = {
      hero: 'Edit Hero Block',
      text: 'Edit Text Block',
      features: 'Edit Features Block',
      gallery: 'Edit Gallery Block',
      'lead-capture': 'Edit Lead Capture Block',
      pricing: 'Edit Pricing Block',
    };
    return titles[blockType] || 'Edit Block';
  };

  const getDialogDescription = () => {
    const descriptions = {
      hero: 'Large header section with background image and call-to-action button',
      text: 'Rich text content section',
      features: 'Grid of features with icons and descriptions',
      gallery: 'Image gallery with captions',
      'lead-capture': 'Contact form to capture lead information',
      pricing: 'Pricing table with plans and features',
    };
    return descriptions[blockType] || 'Edit block content';
  };

  const canSave = blockType === 'hero' || blockType === 'text';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          {renderFormFields()}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSave}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Block
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
