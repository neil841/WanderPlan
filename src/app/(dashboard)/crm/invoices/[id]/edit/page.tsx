/**
 * Edit Invoice Page
 *
 * Edit existing invoice (reuses create form with pre-populated data)
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
import { updateInvoiceSchema } from '@/lib/validations/invoice';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { CURRENCIES, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { UpdateInvoiceInput } from '@/lib/validations/invoice';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data, isLoading: isLoadingInvoice, error } = useInvoice(invoiceId);
  const invoice = data?.invoice;
  const updateInvoiceMutation = useUpdateInvoice();

  // Check if invoice can be edited
  const canEdit = invoice?.status === 'DRAFT';

  // Form setup
  const form = useForm<UpdateInvoiceInput>({
    resolver: zodResolver(updateInvoiceSchema),
    defaultValues: {
      title: '',
      description: undefined,
      lineItems: [],
      tax: 0,
      discount: 0,
      issueDate: undefined,
      dueDate: undefined,
      notes: undefined,
      terms: undefined,
    },
  });

  // Initialize form when invoice loads
  useEffect(() => {
    if (invoice) {
      form.reset({
        title: invoice.title,
        description: invoice.description || undefined,
        lineItems: invoice.lineItems,
        tax: invoice.tax,
        discount: invoice.discount,
        issueDate: invoice.issueDate || undefined,
        dueDate: invoice.dueDate || undefined,
        notes: invoice.notes || undefined,
        terms: invoice.terms || undefined,
      });
    }
  }, [invoice, form]);

  // Line items field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  // Watch form values for calculations
  const lineItems = form.watch('lineItems') || [];
  const tax = form.watch('tax') || 0;
  const discount = form.watch('discount') || 0;
  const currency = invoice?.currency || 'USD';

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
  const onSubmit = async (data: UpdateInvoiceInput) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        id: invoiceId,
        data,
      });
      router.push(`/crm/invoices/${invoiceId}`);
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const isSubmitting = updateInvoiceMutation.isPending;

  // Loading state
  if (isLoadingInvoice) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Error state
  if (error || !invoice) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load invoice'}
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
            Cannot edit invoices with status {invoice.status}. Only DRAFT invoices can be edited.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href={`/crm/invoices/${invoiceId}`}>View Invoice</Link>
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
            <Link href={`/crm/invoices/${invoiceId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Invoice</h1>
            <p className="text-sm text-muted-foreground">
              {invoice.invoiceNumber} • Last updated: {new Date(invoice.updatedAt).toLocaleString()}
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
                Update the invoice title and details
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
                      placeholder="Bali Adventure Package - Invoice"
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
                      placeholder="Describe this invoice..."
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

            {/* Issue Date */}
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5" />
                    Date when the invoice is issued
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
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
                        disabled={(date) => {
                          const issueDate = form.getValues('issueDate');
                          return issueDate ? date < new Date(issueDate) : false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5" />
                    Payment due date (must be on or after issue date)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 2: Line Items */}
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

          {/* Section 3: Financial Summary */}
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

          {/* Section 4: Additional Details */}
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
                  <FormLabel>Payment Terms</FormLabel>
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
                    Will appear on invoice
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
              onClick={() => router.push(`/crm/invoices/${invoiceId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Invoice
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
