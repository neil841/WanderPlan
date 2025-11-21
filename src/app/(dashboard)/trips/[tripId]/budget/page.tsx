/**
 * Trip Budget Page
 *
 * Budget management page for trip planning with category breakdown
 *
 * Features:
 * - Total budget overview
 * - Category-wise budget breakdown
 * - Budget vs spent visualization
 * - Edit budget dialog
 * - Over-budget warnings
 * - Multi-currency support
 * - WCAG 2.1 AA compliant
 *
 * @page
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { CategoryBreakdown } from '@/components/budget/CategoryBreakdown';
import { EditBudgetDialog } from '@/components/budget/EditBudgetDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, Edit, ArrowLeft } from 'lucide-react';
import type { BudgetResponse } from '@/types/budget';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function TripBudgetPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch budget data
  const {
    data: budgetData,
    isLoading,
    isError,
    error,
  } = useQuery<BudgetResponse>({
    queryKey: ['trip-budget', tripId],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/budget`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch budget');
      }
      return response.json();
    },
    enabled: !!tripId,
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/trips/${tripId}/budget`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update budget');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['trip-budget', tripId], data);
      toast({
        title: 'Budget updated',
        description: 'Your budget has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const is404 = errorMessage.includes('not found') || errorMessage.includes('404');
    const is403 = errorMessage.includes('Forbidden') || errorMessage.includes('403');

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>
              {is404 ? 'Trip Not Found' : is403 ? 'Access Denied' : 'Error'}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>{errorMessage}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/trips">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Trips
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  if (!budgetData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/trips/${tripId}`}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to trip</span>
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Trip Budget</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your trip budget and track expenses
            </p>
          </div>

          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Budget
          </Button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Budget Overview (Left column) */}
          <div className="lg:col-span-1">
            <BudgetOverview budgetData={budgetData} />
          </div>

          {/* Category Breakdown (Right column) */}
          <div className="lg:col-span-2">
            <CategoryBreakdown
              categoryBudgets={budgetData.budget.categoryBudgets}
              currency={budgetData.budget.currency}
            />
          </div>
        </motion.div>

        {/* Edit Budget Dialog */}
        <EditBudgetDialog
          budget={budgetData.budget}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={(data) => updateBudgetMutation.mutateAsync(data)}
        />
      </div>
    </div>
  );
}
