/**
 * Trip Expense Settlements API
 *
 * GET /api/trips/[tripId]/expenses/settlements - Calculate settlements (who owes who)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateSettlements } from '@/lib/expenses/calculations';
import type { SettlementsResponse, UserBasic } from '@/types/expense';

/**
 * GET /api/trips/[tripId]/expenses/settlements
 *
 * Calculate expense settlements for a trip
 * Returns optimized list of who owes who to minimize transactions
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
      where: {
        tripId,
      },
      include: {
        splits: {
          select: {
            userId: true,
            amount: true,
          },
        },
      },
    });

    // Transform expenses for settlement calculation
    const expensesForCalculation = expenses.map((expense) => ({
      paidBy: expense.paidBy,
      amount: Number(expense.amount),
      splits: expense.splits?.map((split) => ({
        userId: split.userId,
        amount: Number(split.amount),
      })),
    }));

    // Calculate settlements
    const rawSettlements = calculateSettlements(expensesForCalculation);

    // Get unique user IDs from settlements
    const userIds = new Set<string>();
    rawSettlements.forEach((settlement) => {
      userIds.add(settlement.from);
      userIds.add(settlement.to);
    });

    // Fetch user details for all participants
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: Array.from(userIds),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
    });

    // Create user map for quick lookup
    const userMap = new Map<string, UserBasic>();
    users.forEach((user) => {
      userMap.set(user.id, user);
    });

    // Add user details to settlements
    const settlementsWithUsers = rawSettlements.map((settlement) => {
      const fromUser = userMap.get(settlement.from);
      const toUser = userMap.get(settlement.to);

      if (!fromUser || !toUser) {
        throw new Error('User not found for settlement');
      }

      return {
        from: settlement.from,
        to: settlement.to,
        amount: settlement.amount,
        fromUser,
        toUser,
      };
    });

    // Calculate summary
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0
    );

    // Get all unique participants (who paid or owe)
    const participants = new Set<string>();
    expenses.forEach((exp) => {
      participants.add(exp.paidBy);
      exp.splits?.forEach((split) => participants.add(split.userId));
    });

    const response: SettlementsResponse = {
      settlements: settlementsWithUsers,
      summary: {
        totalExpenses,
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
