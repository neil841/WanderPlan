/**
 * Create Invoice Page
 *
 * Multi-section form for creating new invoices
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  ArrowLeft,
  CalendarIcon,
  Plus,
  X,
  Info,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { createInvoiceSchema } from '@/lib/validations/invoice';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { CURRENCIES, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CreateInvoiceInput } from '@/lib/validations/invoice';

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoiceMutation = useCreateInvoice();

  // Form setup
  const form = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      title: '',
      clientId: '',
      tripId: undefined,
      description: undefined,
      lineItems: [
        {
          id: crypto.randomUUID(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
      tax: 0,
      discount: 0,
      currency: 'USD',
      issueDate: new Date().toISOString(),
      dueDate: undefined,
      notes: undefined,
      terms: undefined,
    },
  });

  // Line items field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  // Watch form values for calculations
  const lineItems = form.watch('lineItems');
  const tax = form.watch('tax') || 0;
  const discount = form.watch('discount') || 0;
  const currency = form.watch('currency') || 'USD';

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
      if (Math.abs(item.total - calculatedTotal) > 0.01) {
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
  const onSubmit = async (data: CreateInvoiceInput) => {
    try {
      await createInvoiceMutation.mutateAsync(data);
      // Navigation handled by mutation onSuccess
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const isSubmitting = createInvoiceMutation.isPending;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/crm/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Invoice</h1>
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
                Enter the invoice title and client details
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
                  <div className="flex justify-between">
                    <FormDescription>
                      A descriptive title for this invoice
                    </FormDescription>
                    {field.value && field.value.length > 150 && (
                      <span className="text-xs text-muted-foreground">
                        {field.value.length}/200
                      </span>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Client ID - For now, using input. Should be autocomplete */}
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Client ID <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter client ID"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormDescription>
                    Search for a client from your CRM
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trip ID - Optional */}
            <FormField
              control={form.control}
              name="tripId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter trip ID"
                    />
                  </FormControl>
                  <FormDescription>
                    Link this invoice to an existing trip
                  </FormDescription>
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
                  <FormLabel>
                    Issue Date <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Due Date <span className="text-destructive">*</span>
                  </FormLabel>
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
                Add services and products to include in this invoice
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border bg-muted/50"
                >
                  {/* Description */}
                  <div className="md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Round trip flights"
                              maxLength={500}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quantity */}
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
                              step="1"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Unit Price */}
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

                  {/* Total (read-only) */}
                  <div className="md:col-span-2">
                    <FormLabel>Total</FormLabel>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted font-medium flex items-center">
                      {formatCurrency(lineItems[index]?.total || 0, currency)}
                    </div>
                  </div>

                  {/* Remove button */}
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
                Add tax and discount, select currency
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              {/* Subtotal (read-only) */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal (auto-calculated)</span>
                <span className="text-xl font-semibold">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>

              {/* Tax */}
              <FormField
                control={form.control}
                name="tax"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Tax (optional)</FormLabel>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">+</span>
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount */}
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Discount (optional)</FormLabel>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">-</span>
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr.value} value={curr.value}>
                            {curr.symbol} {curr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Total */}
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
              <p className="text-sm text-muted-foreground">
                Internal notes and client-facing terms
              </p>
            </div>

            <Separator />

            {/* Internal Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Add internal notes..."
                      maxLength={2000}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription className="flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5" />
                    These notes are not visible to the client
                  </FormDescription>
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

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter payment terms and conditions..."
                      maxLength={5000}
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription className="flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5" />
                    These terms will appear on the invoice
                  </FormDescription>
                  {field.value && field.value.length > 4500 && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {field.value.length}/5000
                      </span>
                    </div>
                  )}
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
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
