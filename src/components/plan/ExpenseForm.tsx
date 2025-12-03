'use client';

import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type GuestExpense } from '@/lib/guest-mode';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: Partial<GuestExpense>) => void;
  expense?: GuestExpense | null;
}

const categories = [
  { value: 'accommodation', label: '🏨 Accommodation', emoji: '🏨' },
  { value: 'food', label: '🍜 Food & Dining', emoji: '🍜' },
  { value: 'transport', label: '🚇 Transport', emoji: '🚇' },
  { value: 'activities', label: '🎭 Activities', emoji: '🎭' },
  { value: 'shopping', label: '🛍️ Shopping', emoji: '🛍️' },
  { value: 'other', label: '📌 Other', emoji: '📌' },
];

/**
 * ExpenseForm Component
 *
 * Premium modal form for creating/editing trip expenses.
 * Features validation and category selection.
 *
 * @component
 */
export function ExpenseForm({ open, onOpenChange, onSubmit, expense }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'USD',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    paidBy: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount.toString() || '',
        currency: expense.currency || 'USD',
        category: expense.category || 'other',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paidBy: expense.paidBy || '',
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        currency: 'USD',
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        paidBy: '',
      });
    }
    setErrors({});
  }, [expense, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const expenseData: Partial<GuestExpense> = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      date: formData.date,
      paidBy: formData.paidBy.trim() || undefined,
    };

    try {
      await onSubmit(expenseData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? 'Update the details of your expense'
              : 'Track your spending by adding a new expense'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Dinner at Sushi Restaurant"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Amount & Currency Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Paid By (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By (Optional)</Label>
            <Input
              id="paidBy"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              placeholder="e.g., John, Sarah"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </span>
              ) : (
                <span>{expense ? 'Update Expense' : 'Add Expense'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
