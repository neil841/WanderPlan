/**
 * Trip Expense Settlements API Routes
 *
 * GET /api/trips/[tripId]/expenses/settlements - Calculate settlements (who owes who)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateSettlements } from '@/lib/expenses/calculations';
import type { SettlementsResponse } from '@/types/expense';

/**
 * GET /api/trips/[tripId]/expenses/settlements
 *
 * Calculate expense settlements for a trip (who owes who)
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
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch all expenses with splits for this trip
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      include: {
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

    // If no expenses, return empty settlements
    if (expenses.length === 0) {
      return NextResponse.json({
        settlements: [],
        summary: {
          totalExpenses: 0,
          totalAmount: 0,
          participantCount: 0,
        },
      });
    }

    // Transform expenses for calculation
    const expensesForCalculation = expenses.map((expense) => ({
      paidBy: expense.paidBy,
      amount: Number(expense.amount),
      splits: expense.splits.map((split) => ({
        userId: split.userId,
        amount: Number(split.amount),
      })),
    }));

    // Calculate settlements
    const settlements = calculateSettlements(expensesForCalculation);

    // Fetch user details for settlements
    const userIds = Array.from(
      new Set([...settlements.map((s) => s.from), ...settlements.map((s) => s.to)])
    );

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    // Enrich settlements with user details
    const enrichedSettlements = settlements.map((settlement) => ({
      ...settlement,
      fromUser: userMap.get(settlement.from),
      toUser: userMap.get(settlement.to),
    }));

    // Calculate summary
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // Get unique participants (anyone who paid or has a split)
    const participants = new Set<string>();
    expenses.forEach((expense) => {
      participants.add(expense.paidBy);
      expense.splits.forEach((split) => participants.add(split.userId));
    });

    const response: SettlementsResponse = {
      settlements: enrichedSettlements,
      summary: {
        totalExpenses: expenses.length,
        totalAmount,
        participantCount: participants.size,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error calculating settlements:', error);
    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    );
  }
}
