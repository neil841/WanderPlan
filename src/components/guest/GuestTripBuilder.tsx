'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, Loader2, CheckCircle2, AlertCircle, MapPin, Tag, X, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/trips/DateRangePicker';
import { createGuestTrip } from '@/lib/guest-mode';

/**
 * Validation schema for guest trip creation
 */
const guestTripSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Trip name is required')
      .max(200, 'Trip name must be less than 200 characters'),
    description: z
      .string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional(),
    startDate: z.date({
      message: 'Start date is required',
    }),
    endDate: z.date({
      message: 'End date is required',
    }),
    destinations: z.array(z.string()),
    tags: z.array(z.string()),
    visibility: z.enum(['private', 'shared', 'public']),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  });

type GuestTripFormData = z.infer<typeof guestTripSchema>;

/**
 * GuestTripBuilder Component
 *
 * Guest-friendly trip creation form that:
 * - Saves to localStorage (no signup required)
 * - Shows benefits of signing up
 * - Has identical UX to authenticated form
 * - Prompts signup at strategic moments
 *
 * @component
 * @example
 * <GuestTripBuilder />
 */
export function GuestTripBuilder() {
  const router = useRouter();

  const [destinationInput, setDestinationInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GuestTripFormData>({
    resolver: zodResolver(guestTripSchema),
    defaultValues: {
      name: '',
      description: '',
      destinations: [],
      tags: [],
      visibility: 'private',
    },
  });

  const destinations = form.watch('destinations');
  const tags = form.watch('tags');

  const handleAddDestination = () => {
    const trimmed = destinationInput.trim();
    if (trimmed && !destinations.includes(trimmed)) {
      form.setValue('destinations', [...destinations, trimmed]);
      setDestinationInput('');
    }
  };

  const handleRemoveDestination = (destination: string) => {
    form.setValue(
      'destinations',
      destinations.filter((d) => d !== destination)
    );
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      form.setValue('tags', [...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tag)
    );
  };

  const onSubmit = async (data: GuestTripFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create guest trip in localStorage
      const trip = createGuestTrip({
        name: data.name,
        description: data.description || undefined,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        destinations: data.destinations,
        tags: data.tags,
        visibility: data.visibility,
      });

      // Simulate brief loading for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to guest trip view (we'll create this next)
      router.push(`/plan/${trip.id}`);
    } catch (err) {
      console.error('Failed to create guest trip:', err);
      setError('Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-4xl mx-auto"
    >
      {/* Guest Mode Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Start Planning - No Signup Required!</h3>
            <p className="mt-1 text-sm text-gray-600">
              Create your trip now. You can sign up later to save it permanently and collaborate
              with others.
            </p>
          </div>
        </div>
      </motion.div>

      <Card className="shadow-lg border-neutral-200 dark:border-neutral-800">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Create Your Trip
          </CardTitle>
          <CardDescription className="text-base text-neutral-600 dark:text-neutral-400">
            Start planning your next adventure. Fill in the details below to create your trip.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Trip Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Trip Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Summer Europe Adventure"
                        disabled={isLoading}
                        className="transition-all duration-200"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your trip... What are you planning to do? Who's coming along?"
                        disabled={isLoading}
                        className="min-h-[100px] resize-y transition-all duration-200"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Optional. Share more details about your trip.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Trip Dates <span className="text-destructive">*</span>
                </Label>
                <DateRangePicker
                  startDate={form.watch('startDate')}
                  endDate={form.watch('endDate')}
                  onStartDateChange={(date) => form.setValue('startDate', date)}
                  onEndDateChange={(date) => form.setValue('endDate', date)}
                  disabled={isLoading}
                />
                {(form.formState.errors.startDate || form.formState.errors.endDate) && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.startDate?.message ||
                      form.formState.errors.endDate?.message}
                  </p>
                )}
              </div>

              {/* Destinations */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Destinations</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDestination();
                        }
                      }}
                      placeholder="e.g., Paris, Tokyo, New York"
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDestination}
                    disabled={isLoading || !destinationInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {/* Destination Tags */}
                {destinations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap gap-2"
                  >
                    {destinations.map((destination) => (
                      <motion.div
                        key={destination}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="secondary"
                          className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                        >
                          <MapPin className="h-3 w-3" />
                          {destination}
                          <button
                            type="button"
                            onClick={() => handleRemoveDestination(destination)}
                            disabled={isLoading}
                            className="ml-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 p-0.5 transition-colors"
                            aria-label={`Remove ${destination}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional. Add places you'll be visiting.
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Tags</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g., Family, Adventure, Beach"
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={isLoading || !tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {/* Tag Badges */}
                {tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap gap-2"
                  >
                    {tags.map((tag) => (
                      <motion.div
                        key={tag}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="default"
                          className="gap-1 pr-1 cursor-pointer hover:bg-primary/80 transition-colors"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            disabled={isLoading}
                            className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors"
                            aria-label={`Remove ${tag} tag`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional. Organize your trip with tags for easy filtering.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={isLoading}
                  className="transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 transition-all duration-200 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Trip...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Start Planning</span>
                      </>
                    )}
                  </motion.div>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Benefits Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-sm text-gray-600"
      >
        <p>
          Want to save your trip permanently?{' '}
          <button
            onClick={() => router.push('/register')}
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Create a free account
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}
