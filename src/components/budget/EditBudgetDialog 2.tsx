/**
 * Edit Budget Dialog Component
 *
 * Dialog for editing trip budget and category allocations
 */

'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Budget, BudgetCategory } from '@/types/budget';
import { updateBudgetSchema } from '@/lib/validations/budget';

interface EditBudgetDialogProps {
  budget: Budget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: z.infer<typeof updateBudgetSchema>) => Promise<void>;
}

const categoryLabels: Record<string, string> = {
  accommodation: 'Accommodation',
  food: 'Food & Dining',
  activities: 'Activities',
  transport: 'Transportation',
  shopping: 'Shopping',
  other: 'Other',
};

export function EditBudgetDialog({
  budget,
  open,
  onOpenChange,
  onSave,
}: EditBudgetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof updateBudgetSchema>>({
    resolver: zodResolver(updateBudgetSchema),
    defaultValues: {
      totalBudget: budget.totalBudget,
      currency: budget.currency,
      categoryBudgets: Object.entries(budget.categoryBudgets).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: { budgeted: value.budgeted },
        }),
        {}
      ),
    },
  });

  const handleSubmit = async (data: z.infer<typeof updateBudgetSchema>) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total from categories
  const watchedCategories = form.watch('categoryBudgets');
  const calculatedTotal = Object.values(watchedCategories || {}).reduce(
    (sum, cat: any) => sum + (cat?.budgeted || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update your trip budget and category allocations
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Total Budget */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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

            {/* Category Budgets */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Category Budgets</h3>

              <div className="grid grid-cols-2 gap-4">
                {Object.keys(budget.categoryBudgets).map((categoryKey) => (
                  <FormField
                    key={categoryKey}
                    control={form.control}
                    name={`categoryBudgets.${categoryKey}.budgeted` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {categoryLabels[categoryKey] || categoryKey}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
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
                ))}
              </div>

              {/* Category total display */}
              <div className="flex items-center justify-between text-sm border-t pt-4">
                <span className="text-muted-foreground">Sum of categories:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: form.watch('currency') || 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(calculatedTotal)}
                </span>
              </div>

              {calculatedTotal !== form.watch('totalBudget') && (
                <p className="text-xs text-yellow-600">
                  ⚠️ Category total doesn't match total budget
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
