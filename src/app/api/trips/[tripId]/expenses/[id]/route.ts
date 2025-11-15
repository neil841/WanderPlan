/**
 * Individual Expense API Routes
 *
 * GET /api/trips/[tripId]/expenses/[id] - Get expense details
 * PATCH /api/trips/[tripId]/expenses/[id] - Update expense
 * DELETE /api/trips/[tripId]/expenses/[id] - Delete expense
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateExpenseSchema } from '@/lib/validations/expense';
import type { ExpenseResponse } from '@/types/expense';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/trips/[tripId]/expenses/[id]
 *
 * Get expense details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, id } = params;

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
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Get expense
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tripId,
      },
      include: {
        payer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Transform for response
    const expenseResponse = {
      ...expense,
      amount: Number(expense.amount),
      splits: expense.splits.map((split) => ({
        ...split,
        amount: Number(split.amount),
      })),
    };

    const response: ExpenseResponse = {
      expense: expenseResponse,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trips/[tripId]/expenses/[id]
 *
 * Update expense
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, id } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateExpenseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { eventId, category, description, amount, currency, date, receiptUrl } =
      validation.data;

    // Get existing expense
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        tripId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if user is the one who paid (only payer can edit)
    if (existingExpense.paidBy !== session.user.id) {
      // Also allow trip owner to edit
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          createdBy: session.user.id,
        },
      });

      if (!trip) {
        return NextResponse.json(
          { error: 'Only the payer or trip owner can update this expense' },
          { status: 403 }
        );
      }
    }

    // If eventId provided, verify it belongs to this trip
    if (eventId !== undefined && eventId !== null) {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          tripId,
        },
      });

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found or does not belong to this trip' },
          { status: 404 }
        );
      }
    }

    // Build update data
    const updateData: any = {};

    if (eventId !== undefined) {
      updateData.eventId = eventId;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (amount !== undefined) {
      updateData.amount = new Decimal(amount);
    }
    if (currency !== undefined) {
      updateData.currency = currency;
    }
    if (date !== undefined) {
      updateData.date = new Date(date);
    }
    if (receiptUrl !== undefined) {
      updateData.receiptUrl = receiptUrl;
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        payer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Transform for response
    const expenseResponse = {
      ...updatedExpense,
      amount: Number(updatedExpense.amount),
    };

    return NextResponse.json(
      {
        expense: expenseResponse,
        message: 'Expense updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/expenses/[id]
 *
 * Delete expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, id } = params;

    // Get existing expense
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        tripId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if user is the one who paid (only payer can delete)
    if (existingExpense.paidBy !== session.user.id) {
      // Also allow trip owner to delete
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          createdBy: session.user.id,
        },
      });

      if (!trip) {
        return NextResponse.json(
          { error: 'Only the payer or trip owner can delete this expense' },
          { status: 403 }
        );
      }
    }

    // Delete expense (cascades to splits)
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
