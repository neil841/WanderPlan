/**
 * Create Expense Dialog Component
 *
 * Dialog for creating a new expense with split functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Info, Check, X, AlertCircle, Percent, DollarSign } from 'lucide-react';
import { ExpenseCategory } from '@/types/expense';
import type { Collaborator } from '@/types/collaborator';
import { createExpenseSchema } from '@/lib/validations/expense';
import { useExpenseSplit, type SplitMode, type CustomSplitMode } from '@/hooks/useExpenseSplit';
import { formatCurrency, calculateAmountFromPercentage } from '@/lib/expenses/split-helpers';
import { cn } from '@/lib/utils';

interface CreateExpenseDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: z.infer<typeof createExpenseSchema>) => Promise<void>;
  events?: Array<{ id: string; title: string }>;
  collaborators?: Collaborator[];
  currentUserId: string;
}

const categoryLabels: Record<ExpenseCategory, string> = {
  ACCOMMODATION: 'Accommodation',
  TRANSPORTATION: 'Transportation',
  FOOD: 'Food & Dining',
  ACTIVITIES: 'Activities',
  SHOPPING: 'Shopping',
  OTHER: 'Other',
};

export function CreateExpenseDialog({
  tripId,
  open,
  onOpenChange,
  onSave,
  events = [],
  collaborators = [],
  currentUserId,
}: CreateExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createExpenseSchema>>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      category: ExpenseCategory.OTHER,
      description: '',
      amount: 0,
      currency: 'USD',
      date: new Date().toISOString(),
      eventId: undefined,
      receiptUrl: undefined,
    },
  });

  const amount = form.watch('amount');
  const currency = form.watch('currency');

  // Use expense split hook
  const {
    splitMode,
    setSplitMode,
    customMode,
    setCustomMode,
    selectedUserIds,
    toggleUser,
    customSplits,
    setCustomSplit,
    removeCustomSplit,
    perPersonAmount,
    validation,
    isValid,
    reset: resetSplit,
    getSplitsForSubmission,
  } = useExpenseSplit(amount, currentUserId);

  // Reset split state when dialog closes
  useEffect(() => {
    if (!open) {
      resetSplit();
    }
  }, [open, resetSplit]);

  const handleSubmit = async (data: z.infer<typeof createExpenseSchema>) => {
    try {
      setIsSubmitting(true);

      // Add split data to submission
      const splitData = getSplitsForSubmission();
      const finalData = {
        ...data,
        ...splitData,
      };

      await onSave(finalData);
      form.reset();
      resetSplit();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for this trip
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hotel accommodation, restaurant meal, taxi, etc."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount and Currency */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="USD"
                        maxLength={3}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
                        field.onChange(date.toISOString());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event (optional) */}
            {events.length > 0 && (
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Event (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No event</SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Receipt URL (placeholder) */}
            <FormField
              control={form.control}
              name="receiptUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/receipt.pdf"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    For now, enter a URL to your receipt. File upload coming soon.
                  </p>
                </FormItem>
              )}
            />

            {/* Split Type Selector */}
            <div className="space-y-3 pt-4 border-t">
              <Label>Split Type</Label>
              <RadioGroup
                value={splitMode}
                onValueChange={(value) => setSplitMode(value as SplitMode)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="NONE" id="split-none" />
                  <Label htmlFor="split-none" className="font-normal cursor-pointer">
                    I paid (no split)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="EQUAL" id="split-equal" />
                  <Label htmlFor="split-equal" className="font-normal cursor-pointer">
                    Split equally
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="CUSTOM" id="split-custom" />
                  <Label htmlFor="split-custom" className="font-normal cursor-pointer">
                    Custom split
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Equal Split Section */}
            {splitMode === 'EQUAL' && collaborators.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2">
                <Label>Split with:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {collaborators
                    .filter((c) => c.status === 'ACCEPTED')
                    .map((collab) => {
                      const isCurrentUser = collab.userId === currentUserId;
                      const displayName = isCurrentUser
                        ? `You (${collab.user.firstName} ${collab.user.lastName})`
                        : `${collab.user.firstName} ${collab.user.lastName}`;

                      return (
                        <div
                          key={collab.userId}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              id={`split-${collab.userId}`}
                              checked={selectedUserIds.includes(collab.userId)}
                              onCheckedChange={(checked) =>
                                toggleUser(collab.userId)
                              }
                              aria-label={`Include ${displayName} in equal split`}
                            />
                            <Label
                              htmlFor={`split-${collab.userId}`}
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={collab.user.avatarUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {collab.user.firstName[0]}
                                  {collab.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {collab.user.email}
                                </p>
                              </div>
                            </Label>
                          </div>
                          {selectedUserIds.includes(collab.userId) && (
                            <span className="text-sm font-medium text-primary">
                              {formatCurrency(perPersonAmount, currency)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md text-sm text-blue-800 dark:text-blue-200">
                  <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>
                    {selectedUserIds.length} {selectedUserIds.length === 1 ? 'person' : 'people'} •{' '}
                    {formatCurrency(perPersonAmount, currency)} each
                  </span>
                </div>
              </div>
            )}

            {/* Custom Split Section */}
            {splitMode === 'CUSTOM' && collaborators.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <Label>Custom Split</Label>
                  <RadioGroup
                    value={customMode}
                    onValueChange={(value) => setCustomMode(value as CustomSplitMode)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="AMOUNT" id="custom-amount" />
                      <Label htmlFor="custom-amount" className="font-normal cursor-pointer text-sm">
                        Amount
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PERCENTAGE" id="custom-percentage" />
                      <Label htmlFor="custom-percentage" className="font-normal cursor-pointer text-sm">
                        Percentage
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {collaborators
                    .filter((c) => c.status === 'ACCEPTED')
                    .map((collab) => {
                      const isCurrentUser = collab.userId === currentUserId;
                      const displayName = isCurrentUser
                        ? `You (${collab.user.firstName} ${collab.user.lastName})`
                        : `${collab.user.firstName} ${collab.user.lastName}`;

                      const split = customSplits.get(collab.userId);
                      const value = customMode === 'AMOUNT' ? split?.amount : split?.percentage;
                      const calculatedAmount =
                        customMode === 'PERCENTAGE' && split?.percentage
                          ? calculateAmountFromPercentage(amount, split.percentage)
                          : split?.amount || 0;

                      return (
                        <div
                          key={collab.userId}
                          className="flex items-center gap-3 p-2 rounded-md bg-background"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={collab.user.avatarUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {collab.user.firstName[0]}
                              {collab.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{displayName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative w-24">
                              <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                step={customMode === 'PERCENTAGE' ? '0.01' : '0.01'}
                                max={customMode === 'PERCENTAGE' ? '100' : amount}
                                value={value || ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (customMode === 'AMOUNT') {
                                    setCustomSplit(collab.userId, { amount: val });
                                  } else {
                                    setCustomSplit(collab.userId, { percentage: val });
                                  }
                                }}
                                className="pr-8"
                                aria-label={`${customMode === 'AMOUNT' ? 'Amount' : 'Percentage'} for ${displayName}`}
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                {customMode === 'AMOUNT' ? (
                                  <DollarSign className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                  <Percent className="h-3 w-3" aria-hidden="true" />
                                )}
                              </div>
                            </div>
                            {customMode === 'PERCENTAGE' && value && value > 0 && (
                              <span className="text-xs text-muted-foreground w-16 text-right">
                                {formatCurrency(calculatedAmount, currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Validation Indicator */}
                <div
                  className={cn(
                    'flex items-start gap-2 p-3 rounded-md border text-sm transition-colors',
                    validation.isValid
                      ? 'bg-green-50 dark:bg-green-950 border-green-500 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-950 border-red-500 text-red-800 dark:text-red-200'
                  )}
                >
                  {validation.isValid ? (
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="flex-1">
                    {validation.isValid ? (
                      <p>
                        {customMode === 'AMOUNT' ? (
                          <>Total: {formatCurrency(amount, currency)}</>
                        ) : (
                          <>Total: 100%</>
                        )}
                      </p>
                    ) : (
                      <p>{validation.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No collaborators warning */}
            {(splitMode === 'EQUAL' || splitMode === 'CUSTOM') && collaborators.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-md border border-orange-500 text-sm text-orange-800 dark:text-orange-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium">No collaborators found</p>
                  <p className="text-xs mt-1">
                    Add collaborators to this trip to split expenses.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (splitMode === 'CUSTOM' && !isValid)}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Expense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
