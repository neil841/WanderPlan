/**
 * Trip Expenses API Routes
 *
 * POST /api/trips/[tripId]/expenses - Create a new expense
 * GET /api/trips/[tripId]/expenses - List expenses with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createExpenseSchema } from '@/lib/validations/expense';
import type { ExpensesResponse, ExpenseCategory } from '@/types/expense';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * POST /api/trips/[tripId]/expenses
 *
 * Create a new expense for a trip
 */
export async function POST(
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
    const validation = createExpenseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { eventId, category, description, amount, currency, date, receiptUrl } =
      validation.data;

    // Check if user has access to this trip (must be collaborator or owner)
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

    // If eventId provided, verify it belongs to this trip
    if (eventId) {
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

    // Create expense (paidBy is the current user)
    const expense = await prisma.expense.create({
      data: {
        tripId,
        eventId: eventId || null,
        category,
        description,
        amount: new Decimal(amount),
        currency,
        date: new Date(date),
        paidBy: session.user.id,
        receiptUrl: receiptUrl || null,
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
      },
    });

    // Transform for response
    const expenseResponse = {
      ...expense,
      amount: Number(expense.amount),
    };

    return NextResponse.json(
      {
        expense: expenseResponse,
        message: 'Expense created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[tripId]/expenses
 *
 * List all expenses for a trip with filtering and pagination
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
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Filters
    const category = searchParams.get('category') as ExpenseCategory | null;
    const eventId = searchParams.get('eventId');
    const paidBy = searchParams.get('paidBy');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Build where clause
    const where: any = { tripId };

    if (category) {
      where.category = category;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (paidBy) {
      where.paidBy = paidBy;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get total count
    const totalCount = await prisma.expense.count({ where });

    // Get expenses with pagination
    const expenses = await prisma.expense.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
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

    // Calculate summary
    const allExpenses = await prisma.expense.findMany({
      where: { tripId },
      select: {
        amount: true,
        category: true,
      },
    });

    const totalAmount = allExpenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0
    );

    const byCategory: { [key in ExpenseCategory]: number } = {
      ACCOMMODATION: 0,
      TRANSPORTATION: 0,
      FOOD: 0,
      ACTIVITIES: 0,
      SHOPPING: 0,
      OTHER: 0,
    };

    allExpenses.forEach((exp) => {
      byCategory[exp.category as ExpenseCategory] += Number(exp.amount);
    });

    // Transform for response
    const expensesResponse = expenses.map((exp) => ({
      ...exp,
      amount: Number(exp.amount),
    }));

    const response: ExpensesResponse = {
      expenses: expensesResponse,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      summary: {
        totalAmount,
        byCategory,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
