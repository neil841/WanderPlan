/**
 * Trip Budget API Routes
 *
 * GET /api/trips/[tripId]/budget - Get trip budget with spending analysis
 * PATCH /api/trips/[tripId]/budget - Update trip budget
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateBudgetSchema } from '@/lib/validations/budget';
import type { BudgetResponse, CategoryBudgets, CategoryBudget } from '@/types/budget';
import { BudgetCategory } from '@/types/budget';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/trips/[tripId]/budget
 *
 * Get trip budget with spending analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = params;

    // Check if user has access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        OR: [
          { createdBy: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
      include: {
        budget: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // If budget doesn't exist, create a default one
    let budget = trip.budget;
    if (!budget) {
      budget = await prisma.budget.create({
        data: {
          tripId,
          totalBudget: new Decimal(0),
          currency: 'USD',
          categoryBudgets: createDefaultCategoryBudgets(),
        },
      });
    }

    // Get all expenses for this trip to calculate spent amounts
    const expenses = await prisma.expense.findMany({
      where: {
        tripId,
      },
      select: {
        amount: true,
        category: true,
      },
    });

    // Calculate spent per category
    const categoryBudgets = budget.categoryBudgets as CategoryBudgets;
    const updatedCategoryBudgets: CategoryBudgets = { ...categoryBudgets };
    let totalSpent = 0;

    // Reset spent amounts
    Object.keys(updatedCategoryBudgets).forEach((category) => {
      updatedCategoryBudgets[category as BudgetCategory].spent = 0;
    });

    // Calculate spent amounts from expenses
    expenses.forEach((expense) => {
      const category = expense.category.toLowerCase() as BudgetCategory;
      const amount = Number(expense.amount);

      if (updatedCategoryBudgets[category]) {
        updatedCategoryBudgets[category].spent += amount;
      } else {
        // If category not found, add to OTHER
        updatedCategoryBudgets[BudgetCategory.OTHER].spent += amount;
      }

      totalSpent += amount;
    });

    // Update remaining amounts
    Object.keys(updatedCategoryBudgets).forEach((category) => {
      const cat = category as BudgetCategory;
      updatedCategoryBudgets[cat].remaining =
        updatedCategoryBudgets[cat].budgeted - updatedCategoryBudgets[cat].spent;
    });

    const totalBudget = Number(budget.totalBudget);
    const totalRemaining = totalBudget - totalSpent;
    const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = totalSpent > totalBudget;

    const response: BudgetResponse = {
      budget: {
        id: budget.id,
        tripId: budget.tripId,
        totalBudget,
        currency: budget.currency,
        categoryBudgets: updatedCategoryBudgets,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      },
      totalSpent,
      totalRemaining,
      percentageSpent,
      isOverBudget,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trips/[tripId]/budget
 *
 * Update trip budget
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateBudgetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { totalBudget, currency, categoryBudgets } = validation.data;

    // Check if user has edit access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        OR: [
          { createdBy: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                status: 'ACCEPTED',
                role: { in: ['OWNER', 'EDITOR'] },
              },
            },
          },
        ],
      },
      include: {
        budget: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Get or create budget
    let budget = trip.budget;
    if (!budget) {
      budget = await prisma.budget.create({
        data: {
          tripId,
          totalBudget: new Decimal(0),
          currency: currency || 'USD',
          categoryBudgets: createDefaultCategoryBudgets(),
        },
      });
    }

    // Update category budgets if provided
    let updatedCategoryBudgets = budget.categoryBudgets as CategoryBudgets;

    if (categoryBudgets) {
      // Merge new category budgets with existing ones
      Object.entries(categoryBudgets).forEach(([category, value]) => {
        if (value && value.budgeted !== undefined) {
          if (!updatedCategoryBudgets[category as BudgetCategory]) {
            updatedCategoryBudgets[category as BudgetCategory] = {
              budgeted: 0,
              spent: 0,
              remaining: 0,
            };
          }
          updatedCategoryBudgets[category as BudgetCategory].budgeted = value.budgeted;
          // Recalculate remaining (spent stays the same)
          updatedCategoryBudgets[category as BudgetCategory].remaining =
            value.budgeted - updatedCategoryBudgets[category as BudgetCategory].spent;
        }
      });
    }

    // Calculate new total budget if not provided
    const newTotalBudget =
      totalBudget !== undefined
        ? totalBudget
        : Object.values(updatedCategoryBudgets).reduce(
            (sum, cat) => sum + cat.budgeted,
            0
          );

    // Update budget
    const updatedBudget = await prisma.budget.update({
      where: { id: budget.id },
      data: {
        totalBudget: new Decimal(newTotalBudget),
        currency: currency || budget.currency,
        categoryBudgets: updatedCategoryBudgets,
      },
    });

    // Get expenses to calculate current spent amounts
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      select: {
        amount: true,
        category: true,
      },
    });

    // Recalculate spent amounts
    const finalCategoryBudgets = { ...updatedCategoryBudgets };
    let totalSpent = 0;

    // Reset spent amounts
    Object.keys(finalCategoryBudgets).forEach((category) => {
      finalCategoryBudgets[category as BudgetCategory].spent = 0;
    });

    // Calculate spent from expenses
    expenses.forEach((expense) => {
      const category = expense.category.toLowerCase() as BudgetCategory;
      const amount = Number(expense.amount);

      if (finalCategoryBudgets[category]) {
        finalCategoryBudgets[category].spent += amount;
      } else {
        finalCategoryBudgets[BudgetCategory.OTHER].spent += amount;
      }

      totalSpent += amount;
    });

    // Update remaining amounts
    Object.keys(finalCategoryBudgets).forEach((category) => {
      const cat = category as BudgetCategory;
      finalCategoryBudgets[cat].remaining =
        finalCategoryBudgets[cat].budgeted - finalCategoryBudgets[cat].spent;
    });

    const totalRemaining = newTotalBudget - totalSpent;
    const percentageSpent = newTotalBudget > 0 ? (totalSpent / newTotalBudget) * 100 : 0;
    const isOverBudget = totalSpent > newTotalBudget;

    const response: BudgetResponse = {
      budget: {
        id: updatedBudget.id,
        tripId: updatedBudget.tripId,
        totalBudget: Number(updatedBudget.totalBudget),
        currency: updatedBudget.currency,
        categoryBudgets: finalCategoryBudgets,
        createdAt: updatedBudget.createdAt,
        updatedAt: updatedBudget.updatedAt,
      },
      totalSpent,
      totalRemaining,
      percentageSpent,
      isOverBudget,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

/**
 * Create default category budgets
 */
function createDefaultCategoryBudgets(): CategoryBudgets {
  const categories = Object.values(BudgetCategory);
  const defaultBudgets: any = {};

  categories.forEach((category) => {
    defaultBudgets[category] = {
      budgeted: 0,
      spent: 0,
      remaining: 0,
    };
  });

  return defaultBudgets as CategoryBudgets;
}
