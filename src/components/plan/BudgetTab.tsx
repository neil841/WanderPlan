'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DollarSign, TrendingUp, PieChart, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseForm } from './ExpenseForm';
import {
  getGuestExpenses,
  addGuestExpense,
  updateGuestExpense,
  deleteGuestExpense,
  getTripTotalExpenses,
  getExpensesByCategory,
  type GuestExpense,
} from '@/lib/guest-mode';
import { Expense, ExpensesResponse } from '@/types/expense';

interface BudgetTabProps {
  tripId: string;
}

/**
 * BudgetTab Component
 *
 * Premium budget tracking interface with expense management and visualizations.
 * Features category breakdown, totals, and analytics.
 * Supports both Guest (localStorage) and Authenticated (DB) modes.
 *
 * @component
 */
export function BudgetTab({ tripId }: BudgetTabProps) {
  const queryClient = useQueryClient();
  const isGuestTrip = tripId.startsWith('guest-');

  // Guest State
  const [guestExpenses, setGuestExpenses] = useState<GuestExpense[]>([]);
  const [guestTotalSpent, setGuestTotalSpent] = useState(0);
  const [guestExpensesByCategory, setGuestExpensesByCategory] = useState<Record<string, number>>({});

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GuestExpense | null>(null);

  // --- Authenticated Data Fetching ---
  const { data: authExpensesData, isLoading: isAuthLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}/expenses`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json() as Promise<ExpensesResponse>;
    },
    enabled: !isGuestTrip
  });

  // --- Authenticated Mutations ---
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create expense');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); // Update trip totals
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/trips/${tripId}/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update expense');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trips/${tripId}/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete expense');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    }
  });

  // --- Guest Data Loading ---
  useEffect(() => {
    if (isGuestTrip) {
      loadGuestData();

      // Listen for storage changes
      const handleStorageChange = () => loadGuestData();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [tripId, isGuestTrip]);

  const loadGuestData = () => {
    const expensesData = getGuestExpenses(tripId);
    const total = getTripTotalExpenses(tripId);
    const byCategory = getExpensesByCategory(tripId);

    setGuestExpenses(expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setGuestTotalSpent(total);
    setGuestExpensesByCategory(byCategory);
  };

  // --- Data Unification ---
  const mapAuthToGuestExpense = (expense: Expense): GuestExpense => ({
    id: expense.id,
    tripId: expense.tripId,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category.toLowerCase(), // Map enum to string
    date: new Date(expense.date).toISOString(),
    paidBy: expense.paidBy, // ID of payer
    eventId: expense.eventId || undefined,
    createdAt: new Date(expense.createdAt).toISOString(),
    updatedAt: new Date(expense.updatedAt).toISOString(),
  });

  const expenses: GuestExpense[] = isGuestTrip
    ? guestExpenses
    : (authExpensesData?.expenses?.map(mapAuthToGuestExpense) || []);

  const totalSpent = isGuestTrip
    ? guestTotalSpent
    : (authExpensesData?.summary?.totalAmount || 0);

  const expensesByCategory = isGuestTrip
    ? guestExpensesByCategory
    : (authExpensesData?.summary?.byCategory
      ? Object.entries(authExpensesData.summary.byCategory).reduce((acc, [k, v]) => ({
        ...acc,
        [k.toLowerCase()]: v
      }), {} as Record<string, number>)
      : {});

  const isLoading = !isGuestTrip && isAuthLoading;

  // --- Handlers ---
  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: GuestExpense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      if (isGuestTrip) {
        deleteGuestExpense(tripId, expenseId);
        loadGuestData();
      } else {
        await deleteExpenseMutation.mutateAsync(expenseId);
      }
    }
  };

  const handleSubmitExpense = async (expenseData: Partial<GuestExpense>) => {
    if (isGuestTrip) {
      if (editingExpense) {
        updateGuestExpense(tripId, editingExpense.id, expenseData);
      } else {
        addGuestExpense(tripId, expenseData as Omit<GuestExpense, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>);
      }
      loadGuestData();
    } else {
      // Map back to API format
      const apiData = {
        ...expenseData,
        category: expenseData.category?.toUpperCase(), // Map back to enum
        date: expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString(),
      };

      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({ id: editingExpense.id, data: apiData });
      } else {
        await createExpenseMutation.mutateAsync(apiData);
      }
    }
  };

  // Calculate average expense
  const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

  if (isLoading) {
    return (
      <TabsContent value="budget" className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TabsContent>
    );
  }

  return (
    <>
      <TabsContent value="budget" className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Budget Tracker</h2>
            <p className="text-gray-600 mt-1">
              Track all your expenses and manage your trip budget
            </p>
          </div>
          <Button
            onClick={handleAddExpense}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Success Tip */}
        {expenses.length === 0 && (
          <Alert className="border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Start tracking!</strong> Add your first expense to keep your budget organized.
              Track accommodation, food, transport, and more.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        {expenses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Spent
                  </CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    ${totalSpent.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Across {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Average Expense
                  </CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    ${avgExpense.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Per expense
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Categories
                  </CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {Object.keys(expensesByCategory).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Expense categories
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Category Breakdown */}
        {Object.keys(expensesByCategory).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expensesByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount], index) => {
                      const percentage = (amount / totalSpent) * 100;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700 capitalize flex items-center gap-2">
                              {category}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                              <span className="font-semibold text-gray-900 min-w-[80px] text-right">
                                ${amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Expenses List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Expenses</h3>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No expenses tracked yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start tracking your spending to manage your budget effectively
                </p>
                <Button
                  variant="outline"
                  onClick={handleAddExpense}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Expense
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      {/* Expense Form Modal */}
      <ExpenseForm
        open={showExpenseForm}
        onOpenChange={setShowExpenseForm}
        onSubmit={handleSubmitExpense}
        expense={editingExpense}
      />
    </>
  );
}
