'use client';

/**
 * CostInput Component
 *
 * Input component for cost with currency selector.
 * Features number validation, decimal places, and common currency support.
 *
 * @component
 */

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EventCost } from '@/types/event';
import { DollarSign } from 'lucide-react';

interface CostInputProps {
  value?: EventCost | null;
  onChange: (cost: EventCost | null) => void;
  label?: string;
  disabled?: boolean;
}

const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
];

/**
 * Cost input component with currency selector
 *
 * Features:
 * - Number input with 2 decimal places
 * - Currency selector with common currencies
 * - Clear button
 * - Validation
 *
 * @example
 * <CostInput
 *   value={cost}
 *   onChange={setCost}
 *   label="Cost"
 * />
 */
export function CostInput({
  value,
  onChange,
  label = 'Cost',
  disabled = false,
}: CostInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value);

    if (e.target.value === '') {
      onChange(null);
      return;
    }

    if (isNaN(amount) || amount < 0) {
      return;
    }

    onChange({
      amount,
      currency: value?.currency || 'USD',
    });
  };

  const handleCurrencyChange = (currency: string) => {
    onChange({
      amount: value?.amount || 0,
      currency,
    });
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="cost-amount">
          {label}
          <span className="text-muted-foreground ml-1">(optional)</span>
        </Label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="cost-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={value?.amount ?? ''}
            onChange={handleAmountChange}
            disabled={disabled}
            className="pl-9"
          />
        </div>
        <Select
          value={value?.currency || 'USD'}
          onValueChange={handleCurrencyChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {COMMON_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {value && value.amount > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          disabled={disabled}
        >
          Clear cost
        </button>
      )}
    </div>
  );
}
