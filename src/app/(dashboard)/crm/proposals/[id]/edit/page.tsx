/**
 * Edit Proposal Page
 *
 * Edit existing proposal (reuses create form with pre-populated data)
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CalendarIcon,
  Plus,
  X,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { updateProposalSchema } from '@/lib/validations/proposal';
import { useProposal, useUpdateProposal } from '@/hooks/useProposals';
import { CURRENCIES, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { UpdateProposalInput } from '@/lib/validations/proposal';

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const { data, isLoading: isLoadingProposal, error } = useProposal(proposalId);
  const proposal = data?.proposal;
  const updateProposalMutation = useUpdateProposal();

  // Check if proposal can be edited
  const canEdit = proposal?.status === 'DRAFT';

  // Form setup
  const form = useForm<UpdateProposalInput>({
    resolver: zodResolver(updateProposalSchema),
    defaultValues: {
      title: '',
      description: undefined,
      lineItems: [],
      tax: 0,
      discount: 0,
      validUntil: undefined,
      notes: undefined,
      terms: undefined,
    },
  });

  // Initialize form when proposal loads
  useEffect(() => {
    if (proposal) {
      form.reset({
        title: proposal.title,
        description: proposal.description || undefined,
        lineItems: proposal.lineItems,
        tax: proposal.tax,
        discount: proposal.discount,
        validUntil: proposal.validUntil || undefined,
        notes: proposal.notes || undefined,
        terms: proposal.terms || undefined,
      });
    }
  }, [proposal, form]);

  // Line items field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  // Watch form values for calculations
  const lineItems = form.watch('lineItems') || [];
  const tax = form.watch('tax') || 0;
  const discount = form.watch('discount') || 0;
  const currency = proposal?.currency || 'USD';

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return sum + itemTotal;
    }, 0);
  }, [lineItems]);

  // Calculate total
  const total = useMemo(() => {
    return subtotal + tax - discount;
  }, [subtotal, tax, discount]);

  // Update line item totals when quantity or price changes
  useEffect(() => {
    lineItems.forEach((item, index) => {
      const calculatedTotal = (item.quantity || 0) * (item.unitPrice || 0);
      if (item.total !== undefined && Math.abs(item.total - calculatedTotal) > 0.01) {
        form.setValue(`lineItems.${index}.total`, calculatedTotal, {
          shouldValidate: false,
        });
      }
    });
  }, [lineItems, form]);

  // Add line item
  const handleAddLineItem = () => {
    append({
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  };

  // Remove line item
  const handleRemoveLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Form submission
  const onSubmit = async (data: UpdateProposalInput) => {
    try {
      await updateProposalMutation.mutateAsync({
        id: proposalId,
        data,
      });
      router.push(`/crm/proposals/${proposalId}`);
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const isSubmitting = updateProposalMutation.isPending;

  // Loading state
  if (isLoadingProposal) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Error state
  if (error || !proposal) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load proposal'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Cannot edit
  if (!canEdit) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cannot edit proposals with status {proposal.status}. Only DRAFT proposals can be edited.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href={`/crm/proposals/${proposalId}`}>View Proposal</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/crm/proposals/${proposalId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Proposal</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(proposal.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <p className="text-sm text-muted-foreground">
                Update the proposal title and details
              </p>
            </div>

            <Separator />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Bali Adventure Package"
                      maxLength={200}
                      aria-required="true"
                    />
                  </FormControl>
                  {field.value && field.value.length > 150 && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {field.value.length}/200
                      </span>
                    </div>
                  )}
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Describe this proposal..."
                      maxLength={2000}
                      rows={4}
                    />
                  </FormControl>
                  {field.value && field.value.length > 1800 && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {field.value.length}/2000
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid Until */}
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5" />
                    Proposal validity period for client
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 2: Line Items (same as create) */}
          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Line Items</h2>
              <p className="text-sm text-muted-foreground">
                Update services and products
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border bg-muted/50"
                >
                  <div className="md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={500} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormLabel>Total</FormLabel>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted font-medium flex items-center">
                      {formatCurrency(lineItems[index]?.total || 0, currency)}
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLineItem(index)}
                      disabled={fields.length === 1}
                      aria-label={`Remove line item ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddLineItem}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>

              <div className="flex justify-end">
                <div className="text-right space-y-1">
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(subtotal, currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Summary (same as create) */}
          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Financial Summary</h2>
              <p className="text-sm text-muted-foreground">
                Update tax and discount
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="text-xl font-semibold">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>

              <FormField
                control={form.control}
                name="tax"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Tax</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-32 text-right"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-32 text-right"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg">
                <span className="text-xl font-bold">TOTAL</span>
                <span className="text-3xl font-bold">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Additional Details (same as create) */}
          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Additional Details</h2>
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      maxLength={2000}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription className="flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5" />
                    Not visible to client
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      maxLength={5000}
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription className="flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5" />
                    Will appear on proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/crm/proposals/${proposalId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Proposal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
