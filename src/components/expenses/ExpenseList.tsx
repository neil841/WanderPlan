/**
 * Expense List Component
 *
 * Lists all expenses with filtering and pagination
 */

'use client';

import { useState } from 'react';
import { ExpenseCard } from './ExpenseCard';
import { CreateExpenseDialog } from './CreateExpenseDialog';
import { EditExpenseDialog } from './EditExpenseDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2 } from 'lucide-react';
import type { Expense, ExpenseCategory } from '@/types/expense';

interface ExpenseListProps {
  tripId: string;
  expenses: Expense[];
  isLoading: boolean;
  onRefresh: () => void;
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

export function ExpenseList({
  tripId,
  expenses,
  isLoading,
  onRefresh,
  events = [],
}: ExpenseListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [splitFilter, setSplitFilter] = useState<'all' | 'split' | 'not-split'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = categoryFilter === 'ALL' || expense.category === categoryFilter;
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Split filter
    const matchesSplit =
      splitFilter === 'all' ||
      (splitFilter === 'split' && expense.splits && expense.splits.length > 0) ||
      (splitFilter === 'not-split' && (!expense.splits || expense.splits.length === 0));

    return matchesCategory && matchesSearch && matchesSplit;
  });

  const handleCreateExpense = async (data: any) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create expense');
      }

      onRefresh();
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw error;
    }
  };

  const handleEditExpense = async (data: any) => {
    if (!selectedExpense) return;

    try {
      const response = await fetch(
        `/api/trips/${tripId}/expenses/${selectedExpense.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update expense');
      }

      onRefresh();
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses/${expense.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete expense');
      }

      onRefresh();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search expenses"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as ExpenseCategory | 'ALL')}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={splitFilter} onValueChange={(value) => setSplitFilter(value as 'all' | 'split' | 'not-split')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by split" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expenses</SelectItem>
            <SelectItem value="split">Split Only</SelectItem>
            <SelectItem value="not-split">Not Split</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expense List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {expenses.length === 0
              ? 'No expenses yet. Add your first expense to start tracking.'
              : 'No expenses match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDeleteExpense}
              canEdit={true} // TODO: Check if user is payer or trip owner
            />
          ))}
        </div>
      )}

      {/* Create Expense Dialog */}
      <CreateExpenseDialog
        tripId={tripId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreateExpense}
        events={events}
      />

      {/* Edit Expense Dialog */}
      {selectedExpense && (
        <EditExpenseDialog
          tripId={tripId}
          expense={selectedExpense}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedExpense(null);
          }}
          onSave={handleEditExpense}
          events={events}
        />
      )}
    </div>
  );
}
