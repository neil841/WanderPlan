/**
 * Expense Splitting Calculations
 *
 * Core algorithms for expense splitting and settlement optimization.
 */

/**
 * Custom split input (either amount or percentage)
 */
export interface CustomSplitInput {
  userId: string;
  amount?: number;
  percentage?: number;
}

/**
 * Split result with user ID and calculated amount
 */
export interface SplitResult {
  userId: string;
  amount: number;
}

/**
 * Settlement between two users
 */
export interface Settlement {
  from: string; // userId who owes
  to: string; // userId who should receive
  amount: number;
}

/**
 * Calculate equal split among users
 * Handles decimal rounding by assigning remainder to first split
 *
 * @param amount - Total amount to split
 * @param userIds - Array of user IDs to split among
 * @returns Array of splits with userId and amount
 */
export function calculateEqualSplit(
  amount: number,
  userIds: string[]
): SplitResult[] {
  if (userIds.length === 0) {
    throw new Error('Must have at least one user to split expense');
  }

  // Calculate base amount per person (floor to 2 decimals)
  const baseAmount = Math.floor((amount / userIds.length) * 100) / 100;

  // Calculate remainder (will be added to first person)
  const totalBase = baseAmount * userIds.length;
  const remainder = Math.round((amount - totalBase) * 100) / 100;

  // Create splits
  const splits: SplitResult[] = userIds.map((userId, index) => ({
    userId,
    amount: index === 0 ? baseAmount + remainder : baseAmount,
  }));

  return splits;
}

/**
 * Apply custom splits (by amount or percentage)
 * Validates that splits add up correctly
 *
 * @param amount - Total expense amount
 * @param splits - Array of custom splits
 * @returns Array of splits with calculated amounts
 * @throws Error if splits don't add up or are invalid
 */
export function calculateCustomSplit(
  amount: number,
  splits: CustomSplitInput[]
): SplitResult[] {
  if (splits.length === 0) {
    throw new Error('Must have at least one split');
  }

  // Separate percentage and amount-based splits
  const percentageSplits = splits.filter((s) => s.percentage !== undefined);
  const amountSplits = splits.filter((s) => s.amount !== undefined);

  let results: SplitResult[] = [];

  // Process percentage splits
  if (percentageSplits.length > 0) {
    // Validate percentages sum to 100%
    const totalPercentage = percentageSplits.reduce(
      (sum, s) => sum + (s.percentage || 0),
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(
        `Percentages must sum to 100%, got ${totalPercentage.toFixed(2)}%`
      );
    }

    // Calculate amounts from percentages
    const percentageResults = percentageSplits.map((split) => {
      const splitAmount =
        Math.round((amount * (split.percentage || 0)) / 100 * 100) / 100;
      return {
        userId: split.userId,
        amount: splitAmount,
      };
    });

    // Handle rounding error - add/subtract from first split
    const totalCalculated = percentageResults.reduce(
      (sum, r) => sum + r.amount,
      0
    );
    const roundingError = Math.round((amount - totalCalculated) * 100) / 100;
    if (roundingError !== 0 && percentageResults.length > 0) {
      percentageResults[0].amount =
        Math.round((percentageResults[0].amount + roundingError) * 100) / 100;
    }

    results = [...results, ...percentageResults];
  }

  // Process amount splits
  if (amountSplits.length > 0) {
    // Validate amounts sum to total
    const totalAmount = amountSplits.reduce(
      (sum, s) => sum + (s.amount || 0),
      0
    );

    if (Math.abs(totalAmount - amount) > 0.01) {
      throw new Error(
        `Split amounts must sum to ${amount.toFixed(
          2
        )}, got ${totalAmount.toFixed(2)}`
      );
    }

    const amountResults = amountSplits.map((split) => ({
      userId: split.userId,
      amount: split.amount || 0,
    }));

    results = [...results, ...amountResults];
  }

  // Validate no duplicate users
  const userIds = results.map((r) => r.userId);
  const uniqueUserIds = new Set(userIds);
  if (userIds.length !== uniqueUserIds.size) {
    throw new Error('Cannot have duplicate users in split');
  }

  return results;
}

/**
 * Validate split configuration before applying
 *
 * @param amount - Total expense amount
 * @param splits - Array of custom splits
 * @throws Error if splits are invalid
 */
export function validateSplits(
  amount: number,
  splits: CustomSplitInput[]
): void {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  if (splits.length === 0) {
    throw new Error('Must have at least one split');
  }

  // Check each split has either amount or percentage, not both
  for (const split of splits) {
    if (split.amount !== undefined && split.percentage !== undefined) {
      throw new Error(
        `Split for user ${split.userId} cannot have both amount and percentage`
      );
    }

    if (split.amount === undefined && split.percentage === undefined) {
      throw new Error(
        `Split for user ${split.userId} must have either amount or percentage`
      );
    }

    if (split.amount !== undefined && split.amount <= 0) {
      throw new Error(`Split amount for user ${split.userId} must be positive`);
    }

    if (
      split.percentage !== undefined &&
      (split.percentage < 0 || split.percentage > 100)
    ) {
      throw new Error(
        `Split percentage for user ${split.userId} must be between 0 and 100`
      );
    }
  }

  // Check all splits are same type
  const hasAmounts = splits.some((s) => s.amount !== undefined);
  const hasPercentages = splits.some((s) => s.percentage !== undefined);

  if (hasAmounts && hasPercentages) {
    throw new Error('Cannot mix amount and percentage splits');
  }

  // Try to calculate to validate sums
  calculateCustomSplit(amount, splits);
}

/**
 * Calculate net balance for each user
 * Net balance = (amount paid) - (amount owed)
 *
 * @param expenses - Array of expenses with splits
 * @returns Map of userId to net balance
 */
function calculateNetBalances(
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits?: Array<{ userId: string; amount: number }>;
  }>
): Map<string, number> {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    // Add amount paid
    const paidAmount = balances.get(expense.paidBy) || 0;
    balances.set(expense.paidBy, paidAmount + expense.amount);

    // Subtract amount owed (if splits exist)
    if (expense.splits && expense.splits.length > 0) {
      for (const split of expense.splits) {
        const owedAmount = balances.get(split.userId) || 0;
        balances.set(split.userId, owedAmount - split.amount);
      }
    }
  }

  return balances;
}

/**
 * Calculate settlements using greedy algorithm
 * Minimizes number of transactions
 *
 * @param expenses - Array of expenses with splits and payer info
 * @returns Optimized array of settlements
 */
export function calculateSettlements(
  expenses: Array<{
    paidBy: string;
    amount: number;
    splits?: Array<{ userId: string; amount: number }>;
  }>
): Settlement[] {
  // Calculate net balances
  const balances = calculateNetBalances(expenses);

  // Separate debtors (negative balance) and creditors (positive balance)
  const debtors: Array<{ userId: string; amount: number }> = [];
  const creditors: Array<{ userId: string; amount: number }> = [];

  balances.forEach((balance, userId) => {
    if (balance < -0.01) {
      // Owes money (negative balance)
      debtors.push({ userId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      // Is owed money (positive balance)
      creditors.push({ userId, amount: balance });
    }
  });

  // Sort by amount (largest first) for greedy algorithm
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Greedy match: largest debtor pays largest creditor
  const settlements: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    // Calculate settlement amount (minimum of what's owed and what's owed to)
    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    if (settlementAmount > 0.01) {
      // Only create settlement if amount is significant
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settlementAmount * 100) / 100,
      });
    }

    // Update balances
    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    // Move to next debtor/creditor if current one is settled
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
  }

  return settlements;
}
