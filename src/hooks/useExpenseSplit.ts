/**
 * useExpenseSplit Hook
 *
 * Custom hook for managing expense split state and calculations.
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { CustomSplitInput } from '@/types/expense';
import {
  calculatePerPersonAmount,
  validateSplitAmounts,
  convertPercentagesToAmounts,
  type ValidationResult,
} from '@/lib/expenses/split-helpers';

/**
 * Split mode type
 */
export type SplitMode = 'NONE' | 'EQUAL' | 'CUSTOM';

/**
 * Custom split mode type (amount or percentage)
 */
export type CustomSplitMode = 'AMOUNT' | 'PERCENTAGE';

/**
 * Hook return type
 */
export interface UseExpenseSplitReturn {
  // State
  splitMode: SplitMode;
  customMode: CustomSplitMode;
  selectedUserIds: string[];
  customSplits: Map<string, CustomSplitInput>;

  // Setters
  setSplitMode: (mode: SplitMode) => void;
  setCustomMode: (mode: CustomSplitMode) => void;
  toggleUser: (userId: string) => void;
  setCustomSplit: (userId: string, split: Partial<CustomSplitInput>) => void;
  removeCustomSplit: (userId: string) => void;

  // Computed values
  perPersonAmount: number;
  validation: ValidationResult;
  isValid: boolean;

  // Utilities
  reset: () => void;
  getSplitsForSubmission: () => {
    splitType?: 'EQUAL' | 'CUSTOM';
    splitWithUserIds?: string[];
    splits?: CustomSplitInput[];
  };
}

/**
 * Hook for managing expense split state
 */
export function useExpenseSplit(
  amount: number,
  currentUserId: string
): UseExpenseSplitReturn {
  const [splitMode, setSplitMode] = useState<SplitMode>('NONE');
  const [customMode, setCustomMode] = useState<CustomSplitMode>('AMOUNT');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([currentUserId]);
  const [customSplits, setCustomSplits] = useState<Map<string, CustomSplitInput>>(
    new Map()
  );

  // Calculate per-person amount for equal split
  const perPersonAmount = useMemo(() => {
    if (splitMode !== 'EQUAL') return 0;
    return calculatePerPersonAmount(amount, selectedUserIds.length);
  }, [splitMode, amount, selectedUserIds.length]);

  // Validate custom splits
  const validation = useMemo((): ValidationResult => {
    if (splitMode !== 'CUSTOM') {
      return { isValid: true };
    }

    const splits = Array.from(customSplits.values());
    return validateSplitAmounts(amount, splits);
  }, [splitMode, amount, customSplits]);

  const isValid = validation.isValid;

  // Toggle user in equal split
  const toggleUser = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  // Set custom split for a user
  const setCustomSplit = useCallback(
    (userId: string, split: Partial<CustomSplitInput>) => {
      setCustomSplits((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(userId) || { userId };
        newMap.set(userId, { ...existing, ...split });
        return newMap;
      });
    },
    []
  );

  // Remove custom split
  const removeCustomSplit = useCallback((userId: string) => {
    setCustomSplits((prev) => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setSplitMode('NONE');
    setCustomMode('AMOUNT');
    setSelectedUserIds([currentUserId]);
    setCustomSplits(new Map());
  }, [currentUserId]);

  // Get splits formatted for API submission
  const getSplitsForSubmission = useCallback(() => {
    if (splitMode === 'NONE') {
      return {};
    }

    if (splitMode === 'EQUAL') {
      return {
        splitType: 'EQUAL' as const,
        splitWithUserIds: selectedUserIds,
      };
    }

    if (splitMode === 'CUSTOM') {
      const splits = Array.from(customSplits.values());
      // Convert percentages to amounts if needed
      const finalSplits = convertPercentagesToAmounts(amount, splits);
      return {
        splitType: 'CUSTOM' as const,
        splits: finalSplits,
      };
    }

    return {};
  }, [splitMode, selectedUserIds, customSplits, amount]);

  return {
    // State
    splitMode,
    customMode,
    selectedUserIds,
    customSplits,

    // Setters
    setSplitMode,
    setCustomMode,
    toggleUser,
    setCustomSplit,
    removeCustomSplit,

    // Computed
    perPersonAmount,
    validation,
    isValid,

    // Utilities
    reset,
    getSplitsForSubmission,
  };
}
