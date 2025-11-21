/**
 * Create Expense Dialog Component
 *
 * Dialog for creating a new expense with split functionality
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Users, DollarSign, Percent, X } from 'lucide-react';
import { ExpenseCategory, SplitType, CustomSplitInput } from '@/types/expense';
import { createExpenseWithSplitsSchema } from '@/lib/validations/expense';
import { useCollaborators } from '@/hooks/useCollaborators';

interface CreateExpenseDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: z.infer<typeof createExpenseWithSplitsSchema>) => Promise<void>;
  events?: Array<{ id: string; title: string }>;
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
}: CreateExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [splitType, setSplitType] = useState<'NONE' | SplitType>('NONE');
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Map<string, CustomSplitInput>>(new Map());
  const [customSplitMode, setCustomSplitMode] = useState<'AMOUNT' | 'PERCENTAGE'>('AMOUNT');

  // Fetch collaborators
  const { data: collaboratorsData, isLoading: loadingCollaborators } = useCollaborators(tripId, 'accepted');

  const collaborators = useMemo(() => {
    if (!collaboratorsData) return [];
    // Include owner and accepted collaborators
    const allMembers = [
      ...(collaboratorsData.owner ? [{
        id: collaboratorsData.owner.id,
        user: {
          id: collaboratorsData.owner.id,
          firstName: collaboratorsData.owner.firstName,
          lastName: collaboratorsData.owner.lastName,
          email: collaboratorsData.owner.email,
          avatarUrl: (collaboratorsData.owner as any).profilePicture || null,
        },
      }] : []),
      ...collaboratorsData.collaborators,
    ];
    return allMembers;
  }, [collaboratorsData]);

  const form = useForm<z.infer<typeof createExpenseWithSplitsSchema>>({
    resolver: zodResolver(createExpenseWithSplitsSchema),
    defaultValues: {
      category: ExpenseCategory.OTHER,
      description: '',
      amount: 0,
      currency: 'USD',
      date: new Date().toISOString(),
      eventId: undefined,
      receiptUrl: undefined,
      splitType: undefined,
      splits: undefined,
      splitWithUserIds: undefined,
    },
  });

  const amount = form.watch('amount');

  // Reset splits when split type changes
  useEffect(() => {
    if (splitType === 'NONE') {
      setSelectedCollaborators([]);
      setCustomSplits(new Map());
    } else if (splitType === 'EQUAL') {
      setCustomSplits(new Map());
    } else if (splitType === 'CUSTOM') {
      // Initialize custom splits for selected collaborators
      const newSplits = new Map(customSplits);
      selectedCollaborators.forEach(userId => {
        if (!newSplits.has(userId)) {
          newSplits.set(userId, { userId, amount: 0 });
        }
      });
      setCustomSplits(newSplits);
    }
  }, [splitType]);

  // Calculate per-person amount for equal split
  const perPersonAmount = useMemo(() => {
    if (splitType !== 'EQUAL' || selectedCollaborators.length === 0) return 0;
    return amount / selectedCollaborators.length;
  }, [splitType, amount, selectedCollaborators.length]);

  // Calculate total allocated for custom split
  const totalAllocated = useMemo(() => {
    if (splitType !== 'CUSTOM') return 0;
    let total = 0;
    customSplits.forEach(split => {
      if (customSplitMode === 'AMOUNT') {
        total += split.amount || 0;
      } else {
        total += ((split.percentage || 0) / 100) * amount;
      }
    });
    return total;
  }, [splitType, customSplits, customSplitMode, amount]);

  const totalPercentage = useMemo(() => {
    if (splitType !== 'CUSTOM' || customSplitMode !== 'PERCENTAGE') return 0;
    let total = 0;
    customSplits.forEach(split => {
      total += split.percentage || 0;
    });
    return total;
  }, [splitType, customSplitMode, customSplits]);

  const isValidSplit = useMemo(() => {
    if (splitType === 'NONE') return true;
    if (splitType === 'EQUAL') return selectedCollaborators.length > 0;
    if (splitType === 'CUSTOM') {
      if (customSplitMode === 'AMOUNT') {
        return Math.abs(totalAllocated - amount) < 0.01;
      } else {
        return Math.abs(totalPercentage - 100) < 0.01;
      }
    }
    return false;
  }, [splitType, selectedCollaborators, customSplitMode, totalAllocated, totalPercentage, amount]);

  const handleSubmit = async (data: z.infer<typeof createExpenseWithSplitsSchema>) => {
    try {
      setIsSubmitting(true);

      // Prepare data based on split type
      const submitData = { ...data };

      if (splitType === 'EQUAL' && selectedCollaborators.length > 0) {
        submitData.splitType = 'EQUAL';
        submitData.splitWithUserIds = selectedCollaborators;
      } else if (splitType === 'CUSTOM' && customSplits.size > 0) {
        submitData.splitType = 'CUSTOM';
        submitData.splits = Array.from(customSplits.values());
      }

      await onSave(submitData);

      // Reset form and state
      form.reset();
      setSplitType('NONE');
      setSelectedCollaborators([]);
      setCustomSplits(new Map());
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCollaborator = (userId: string) => {
    setSelectedCollaborators(prev => {
      if (prev.includes(userId)) {
        // Remove
        const newSelected = prev.filter(id => id !== userId);
        if (splitType === 'CUSTOM') {
          const newSplits = new Map(customSplits);
          newSplits.delete(userId);
          setCustomSplits(newSplits);
        }
        return newSelected;
      } else {
        // Add
        const newSelected = [...prev, userId];
        if (splitType === 'CUSTOM') {
          const newSplits = new Map(customSplits);
          newSplits.set(userId, { userId, amount: 0 });
          setCustomSplits(newSplits);
        }
        return newSelected;
      }
    });
  };

  const updateCustomSplit = (userId: string, value: number) => {
    const newSplits = new Map(customSplits);
    const existing = newSplits.get(userId) || { userId };

    if (customSplitMode === 'AMOUNT') {
      newSplits.set(userId, { ...existing, amount: value, percentage: undefined });
    } else {
      newSplits.set(userId, { ...existing, percentage: value, amount: undefined });
    }

    setCustomSplits(newSplits);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for this trip
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
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

              {/* Category and Date */}
              <div className="grid grid-cols-2 gap-4">
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
                            date.setHours(12, 0, 0, 0);
                            field.onChange(date.toISOString());
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    <FormDescription className="text-xs">
                      For now, enter a URL to your receipt. File upload coming soon.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Split Expense Section */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base">Split Expense</FormLabel>
                <FormDescription>
                  Choose how to split this expense among trip members
                </FormDescription>
              </div>

              {/* Split Type Selection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="split-none"
                    name="splitType"
                    checked={splitType === 'NONE'}
                    onChange={() => setSplitType('NONE')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="split-none" className="text-sm font-medium cursor-pointer">
                    I paid for myself
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="split-equal"
                    name="splitType"
                    checked={splitType === 'EQUAL'}
                    onChange={() => setSplitType('EQUAL')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="split-equal" className="text-sm font-medium cursor-pointer">
                    Split equally with group
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="split-custom"
                    name="splitType"
                    checked={splitType === 'CUSTOM'}
                    onChange={() => setSplitType('CUSTOM')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="split-custom" className="text-sm font-medium cursor-pointer">
                    Custom split amounts
                  </label>
                </div>
              </div>

              {/* Collaborator Selection (for EQUAL or CUSTOM) */}
              {(splitType === 'EQUAL' || splitType === 'CUSTOM') && (
                <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Select People to Split With
                    </label>
                    {loadingCollaborators && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {collaborators.length === 0 && !loadingCollaborators ? (
                    <p className="text-sm text-muted-foreground">
                      No collaborators found. Only you are on this trip.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {collaborators.map((collab) => {
                        const user = collab.user;
                        return (
                          <div
                            key={user.id}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => toggleCollaborator(user.id)}
                          >
                            <Checkbox
                              checked={selectedCollaborators.includes(user.id)}
                              onCheckedChange={() => toggleCollaborator(user.id)}
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Equal Split Preview */}
                  {splitType === 'EQUAL' && selectedCollaborators.length > 0 && (
                    <div className="mt-3 p-3 bg-background rounded-md border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Each person owes:</span>
                        <span className="text-lg font-bold text-primary">
                          {form.watch('currency')} {perPersonAmount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedCollaborators.length} {selectedCollaborators.length === 1 ? 'person' : 'people'} selected
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Split UI */}
              {splitType === 'CUSTOM' && selectedCollaborators.length > 0 && (
                <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Specify Amounts</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={customSplitMode === 'AMOUNT' ? 'default' : 'outline'}
                        onClick={() => setCustomSplitMode('AMOUNT')}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Amount
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={customSplitMode === 'PERCENTAGE' ? 'default' : 'outline'}
                        onClick={() => setCustomSplitMode('PERCENTAGE')}
                      >
                        <Percent className="h-3 w-3 mr-1" />
                        Percentage
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {selectedCollaborators.map((userId) => {
                      const collab = collaborators.find(c => c.user.id === userId);
                      if (!collab) return null;
                      const user = collab.user;
                      const split = customSplits.get(userId);

                      return (
                        <div key={userId} className="flex items-center gap-3 p-2 bg-background rounded-md border">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step={customSplitMode === 'PERCENTAGE' ? '1' : '0.01'}
                              max={customSplitMode === 'PERCENTAGE' ? '100' : undefined}
                              placeholder={customSplitMode === 'PERCENTAGE' ? '0' : '0.00'}
                              className="w-24 h-8"
                              value={customSplitMode === 'AMOUNT' ? (split?.amount || 0) : (split?.percentage || 0)}
                              onChange={(e) => updateCustomSplit(userId, parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-sm text-muted-foreground w-8">
                              {customSplitMode === 'PERCENTAGE' ? '%' : form.watch('currency')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Validation Summary */}
                  <div className="mt-3 p-3 bg-background rounded-md border">
                    {customSplitMode === 'AMOUNT' ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Allocated:</span>
                          <span className="font-medium">
                            {form.watch('currency')} {totalAllocated.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span>Remaining:</span>
                          <span className={`font-medium ${Math.abs(amount - totalAllocated) < 0.01 ? 'text-green-600' : 'text-destructive'}`}>
                            {form.watch('currency')} {(amount - totalAllocated).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Percentage:</span>
                        <span className={`font-medium ${Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-destructive'}`}>
                          {totalPercentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {!isValidSplit && splitType === 'CUSTOM' && (
                      <p className="text-xs text-destructive mt-2">
                        {customSplitMode === 'AMOUNT'
                          ? 'Total allocated must equal the expense amount'
                          : 'Total percentage must equal 100%'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
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
                disabled={isSubmitting || (splitType !== 'NONE' && !isValidSplit)}
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
