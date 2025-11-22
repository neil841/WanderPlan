/**
 * Lead Capture Form
 *
 * Public form component for capturing leads on landing pages
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useSubmitLead } from '@/hooks/useLandingPages';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().max(1000).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureFormProps {
  landingPageSlug: string;
  config: {
    title: string;
    subtitle?: string;
    submitText: string;
    fields: {
      firstName: boolean;
      lastName: boolean;
      email: boolean;
      phone: boolean;
      message: boolean;
    };
  };
}

export function LeadCaptureForm({ landingPageSlug, config }: LeadCaptureFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const submitMutation = useSubmitLead(landingPageSlug);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      await submitMutation.mutateAsync(data);
      setIsSuccess(true);
      reset();
    } catch (error) {
      console.error('Failed to submit lead:', error);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-16 md:py-24 bg-primary-50 dark:bg-primary-900/10">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 md:p-12 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Thank You!
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              We've received your request and will contact you within 24 hours.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Check your email for confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 bg-primary-50 dark:bg-primary-900/10">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {config.title}
          </h2>
          {config.subtitle && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {config.subtitle}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 md:p-12 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            {(config.fields.firstName || config.fields.lastName) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.fields.firstName && (
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      aria-required="true"
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600" role="alert">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                )}
                {config.fields.lastName && (
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      aria-required="true"
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600" role="alert">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            {config.fields.email && (
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            )}

            {/* Phone */}
            {config.fields.phone && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" {...register('phone')} />
              </div>
            )}

            {/* Message */}
            {config.fields.message && (
              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  rows={4}
                  {...register('message')}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {config.submitText}
            </Button>

            {/* Trust Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Your information is secure and will never be shared</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
