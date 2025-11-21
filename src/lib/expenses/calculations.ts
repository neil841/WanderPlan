/**
 * Expense Calculations
 *
 * Utility functions for expense splitting and settlement calculations.
 */

import { Decimal } from '@prisma/client/runtime/library';

/**
 * Custom split configuration
 */
export interface CustomSplit {
  userId: string;
  amount?: number; // Absolute amount
  percentage?: number; // Percentage of total (0-100)
}

/**
 * Split result
 */
export interface SplitResult {
  userId: string;
  amount: number;
}

/**
 * Settlement result (who owes who)
 */
export interface Settlement {
  from: string; // User ID who owes
  to: string; // User ID who is owed
  amount: number; // Amount owed
}

/**
 * Balance information
 */
interface Balance {
  userId: string;
  balance: number; // Positive = owed money, Negative = owes money
}

/**
 * Calculate equal split among users
 *
 * @param amount - Total amount to split
 * @param userIds - Array of user IDs to split among
 * @returns Array of split results
 */
export function calculateEqualSplit(
  amount: number,
  userIds: string[]
): SplitResult[] {
  if (userIds.length === 0) {
    throw new Error('Cannot split among zero users');
  }

  if (amount < 0) {
    throw new Error('Amount must be non-negative');
  }

  // Split equally (handle rounding)
  const splitAmount = amount / userIds.length;
  const roundedSplitAmount = Math.round(splitAmount * 100) / 100;

  // Calculate remainder due to rounding
  const totalRounded = roundedSplitAmount * userIds.length;
  const remainder = Math.round((amount - totalRounded) * 100) / 100;

  // Distribute splits
  const splits: SplitResult[] = userIds.map((userId, index) => ({
    userId,
    amount: index === 0 ? roundedSplitAmount + remainder : roundedSplitAmount,
  }));

  return splits;
}

/**
 * Calculate custom split (by amount or percentage)
 *
 * @param amount - Total amount to split
 * @param splits - Custom split configuration
 * @returns Array of split results
 * @throws Error if splits don't add up to total amount
 */
export function calculateCustomSplit(
  amount: number,
  splits: CustomSplit[]
): SplitResult[] {
  if (splits.length === 0) {
    throw new Error('No splits provided');
  }

  if (amount < 0) {
    throw new Error('Amount must be non-negative');
  }

  const results: SplitResult[] = [];
  let totalSplitAmount = 0;

  // Process each split
  for (const split of splits) {
    let splitAmount: number;

    if (split.amount !== undefined) {
      // Absolute amount
      splitAmount = split.amount;
    } else if (split.percentage !== undefined) {
      // Percentage of total
      if (split.percentage < 0 || split.percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
      }
      splitAmount = Math.round((amount * split.percentage) / 100 * 100) / 100;
    } else {
      throw new Error('Split must have either amount or percentage');
    }

    if (splitAmount < 0) {
      throw new Error('Split amount must be non-negative');
    }

    results.push({
      userId: split.userId,
      amount: splitAmount,
    });

    totalSplitAmount += splitAmount;
  }

  // Validate total (allow small rounding errors)
  const roundedTotal = Math.round(totalSplitAmount * 100) / 100;
  const roundedAmount = Math.round(amount * 100) / 100;

  if (Math.abs(roundedTotal - roundedAmount) > 0.01) {
    throw new Error(
      `Split amounts (${roundedTotal}) do not add up to total amount (${roundedAmount})`
    );
  }

  // Adjust first split if there's a small rounding error
  if (roundedTotal !== roundedAmount && results.length > 0) {
    results[0].amount = Math.round((results[0].amount + (roundedAmount - roundedTotal)) * 100) / 100;
  }

  return results;
}

/**
 * Calculate settlements (who owes who) from expenses and splits
 *
 * Uses a greedy algorithm to minimize the number of transactions.
 *
 * @param expenses - Array of expense data { paidBy, amount, splits }
 * @returns Array of settlements
 */
export function calculateSettlements(
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>
): Settlement[] {
  if (expenses.length === 0) {
    return [];
  }

  // Step 1: Calculate net balance for each user
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    const { paidBy, amount, splits } = expense;

    // Payer paid the full amount
    const currentBalance = balances.get(paidBy) || 0;
    balances.set(paidBy, currentBalance + amount);

    // Each person owes their split amount
    for (const split of splits) {
      const currentOwed = balances.get(split.userId) || 0;
      balances.set(split.userId, currentOwed - split.amount);
    }
  }

  // Step 2: Convert to array and separate debtors from creditors
  const balanceArray: Balance[] = Array.from(balances.entries()).map(
    ([userId, balance]) => ({
      userId,
      balance: Math.round(balance * 100) / 100,
    })
  );

  // Filter out zero balances (already settled)
  const creditors = balanceArray
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance); // Largest creditors first

  const debtors = balanceArray
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance); // Largest debtors first

  // Step 3: Greedy algorithm to minimize transactions
  const settlements: Settlement[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    // Calculate settlement amount (min of what debtor owes and creditor is owed)
    const settlementAmount = Math.min(
      creditor.balance,
      Math.abs(debtor.balance)
    );

    if (settlementAmount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settlementAmount * 100) / 100,
      });
    }

    // Update balances
    creditor.balance -= settlementAmount;
    debtor.balance += settlementAmount;

    // Move to next creditor/debtor if balance is settled
    if (Math.abs(creditor.balance) < 0.01) {
      creditorIndex++;
    }
    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
}

/**
 * Validate split configuration before creating splits
 *
 * @param amount - Total expense amount
 * @param splits - Split configuration
 * @returns True if valid
 * @throws Error if invalid
 */
export function validateSplits(
  amount: number,
  splits: CustomSplit[] | undefined
): boolean {
  if (!splits || splits.length === 0) {
    return true; // No splits is valid (payer pays full amount)
  }

  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  // Check for duplicate users
  const userIds = splits.map((s) => s.userId);
  const uniqueUserIds = new Set(userIds);
  if (userIds.length !== uniqueUserIds.size) {
    throw new Error('Duplicate users in splits');
  }

  // Validate each split
  for (const split of splits) {
    if (!split.userId) {
      throw new Error('Split must have a userId');
    }

    if (split.amount !== undefined && split.percentage !== undefined) {
      throw new Error('Split cannot have both amount and percentage');
    }

    if (split.amount === undefined && split.percentage === undefined) {
      throw new Error('Split must have either amount or percentage');
    }

    if (split.amount !== undefined && split.amount < 0) {
      throw new Error('Split amount must be non-negative');
    }

    if (
      split.percentage !== undefined &&
      (split.percentage < 0 || split.percentage > 100)
    ) {
      throw new Error('Split percentage must be between 0 and 100');
    }
  }

  // Calculate total and validate
  try {
    calculateCustomSplit(amount, splits);
  } catch (error) {
    throw error;
  }

  return true;
}
