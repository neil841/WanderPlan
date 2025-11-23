/**
 * E2E Tests: Budget Management
 * Tests budget creation, expense tracking, and expense splitting
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser } from './utils/auth';
import { generateTestTrip, createTrip } from './utils/trips';

test.describe('Budget Management', () => {
  test.beforeEach(async ({ page }) => {
    // Create and login a test user before each test
    const user = generateTestUser();
    await registerUser(page, user);

    // Create a test trip
    const trip = generateTestTrip();
    await createTrip(page, trip);

    // Navigate to budget tab
    await page.click('a[href*="/budget"]');
  });

  test.describe('Budget Setup', () => {
    test('should set overall trip budget', async ({ page }) => {
      // Click edit budget button
      await page.click('button:has-text("Edit Budget")');

      // Wait for budget dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Set budget
      await page.fill('input[name="totalBudget"]', '2000');
      await page.selectOption('select[name="currency"]', 'EUR');

      // Submit
      await page.click('button[type="submit"]:has-text("Save")');

      // Verify budget is displayed
      await expect(page.locator('text=/€2,000/i')).toBeVisible({ timeout: 5000 });
    });

    test('should set category budgets', async ({ page }) => {
      // Click edit budget button
      await page.click('button:has-text("Edit Budget")');

      // Set category budgets
      await page.fill('input[name="accommodationBudget"]', '500');
      await page.fill('input[name="foodBudget"]', '400');
      await page.fill('input[name="activitiesBudget"]', '600');
      await page.fill('input[name="transportBudget"]', '300');

      // Submit
      await page.click('button[type="submit"]:has-text("Save")');

      // Verify category budgets are displayed
      await expect(page.locator('text=/accommodation.*€500/i')).toBeVisible();
      await expect(page.locator('text=/food.*€400/i')).toBeVisible();
    });

    test('should show validation error for invalid budget', async ({ page }) => {
      await page.click('button:has-text("Edit Budget")');

      // Enter negative budget
      await page.fill('input[name="totalBudget"]', '-100');
      await page.click('button[type="submit"]:has-text("Save")');

      // Should show validation error
      await expect(page.locator('text=/budget.*positive/i')).toBeVisible();
    });
  });

  test.describe('Expense Tracking', () => {
    test('should add an expense', async ({ page }) => {
      // Click add expense button
      await page.click('button:has-text("Add Expense")');

      // Wait for expense dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Fill expense form
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '50');
      await page.selectOption('select[name="category"]', 'food');

      // Submit
      await page.click('button[type="submit"]:has-text("Add")');

      // Verify expense is displayed
      await expect(page.locator(`text=${expenseName}`)).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/€50/i')).toBeVisible();
    });

    test('should add expense with receipt upload', async ({ page }) => {
      await page.click('button:has-text("Add Expense")');

      // Fill expense form
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '50');
      await page.selectOption('select[name="category"]', 'food');

      // Upload receipt
      await page.setInputFiles('input[type="file"]', {
        name: 'receipt.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content'),
      });

      // Submit
      await page.click('button[type="submit"]:has-text("Add")');

      // Verify expense with receipt
      await expect(page.locator(`text=${expenseName}`)).toBeVisible();
      await expect(page.locator('[data-testid="receipt-icon"]')).toBeVisible();
    });

    test('should edit an expense', async ({ page }) => {
      // Add expense first
      await page.click('button:has-text("Add Expense")');
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '50');
      await page.selectOption('select[name="category"]', 'food');
      await page.click('button[type="submit"]:has-text("Add")');

      // Edit expense
      await page.click(`[data-testid="expense-menu-${expenseName}"]`);
      await page.click('text=Edit');

      // Update amount
      await page.fill('input[name="amount"]', '75');
      await page.click('button[type="submit"]:has-text("Save")');

      // Verify updated amount
      await expect(page.locator('text=/€75/i')).toBeVisible();
    });

    test('should delete an expense', async ({ page }) => {
      // Add expense first
      await page.click('button:has-text("Add Expense")');
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '50');
      await page.selectOption('select[name="category"]', 'food');
      await page.click('button[type="submit"]:has-text("Add")');

      // Delete expense
      await page.click(`[data-testid="expense-menu-${expenseName}"]`);
      await page.click('text=Delete');
      await page.click('button:has-text("Delete")');

      // Expense should not be visible
      await expect(page.locator(`text=${expenseName}`)).not.toBeVisible();
    });

    test('should link expense to event', async ({ page }) => {
      // First add an event (navigate to itinerary)
      await page.click('a[href*="/itinerary"]');
      await page.click('button:has-text("Add Event")');
      const eventName = `Test event ${Date.now()}`;
      await page.fill('input[name="title"]', eventName);
      await page.click('button[type="submit"]:has-text("Add")');

      // Go back to budget
      await page.click('a[href*="/budget"]');

      // Add expense linked to event
      await page.click('button:has-text("Add Expense")');
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '50');
      await page.selectOption('select[name="event"]', eventName);
      await page.click('button[type="submit"]:has-text("Add")');

      // Verify expense shows linked event
      await expect(page.locator(`text=${eventName}`)).toBeVisible();
    });
  });

  test.describe('Budget Visualization', () => {
    test('should display budget progress bars', async ({ page }) => {
      // Set budget
      await page.click('button:has-text("Edit Budget")');
      await page.fill('input[name="foodBudget"]', '100');
      await page.click('button[type="submit"]:has-text("Save")');

      // Add expense
      await page.click('button:has-text("Add Expense")');
      await page.fill('input[name="description"]', 'Lunch');
      await page.fill('input[name="amount"]', '50');
      await page.selectOption('select[name="category"]', 'food');
      await page.click('button[type="submit"]:has-text("Add")');

      // Verify progress bar shows 50%
      const progressBar = page.locator('[data-testid="food-progress"]');
      await expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    test('should show over-budget warning', async ({ page }) => {
      // Set budget
      await page.click('button:has-text("Edit Budget")');
      await page.fill('input[name="foodBudget"]', '100');
      await page.click('button[type="submit"]:has-text("Save")');

      // Add expense that exceeds budget
      await page.click('button:has-text("Add Expense")');
      await page.fill('input[name="description"]', 'Expensive meal');
      await page.fill('input[name="amount"]', '150');
      await page.selectOption('select[name="category"]', 'food');
      await page.click('button[type="submit"]:has-text("Add")');

      // Verify over-budget warning
      await expect(page.locator('text=/over.*budget/i')).toBeVisible();
    });

    test('should calculate total spent correctly', async ({ page }) => {
      // Add multiple expenses
      const expenses = [
        { description: 'Expense 1', amount: 50 },
        { description: 'Expense 2', amount: 75 },
        { description: 'Expense 3', amount: 25 },
      ];

      for (const expense of expenses) {
        await page.click('button:has-text("Add Expense")');
        await page.fill('input[name="description"]', expense.description);
        await page.fill('input[name="amount"]', expense.amount.toString());
        await page.selectOption('select[name="category"]', 'food');
        await page.click('button[type="submit"]:has-text("Add")');
      }

      // Verify total is correct (150)
      await expect(page.locator('text=/total.*spent.*€150/i')).toBeVisible();
    });
  });

  test.describe('Expense Splitting', () => {
    test('should split expense equally', async ({ page }) => {
      // Add expense
      await page.click('button:has-text("Add Expense")');
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '100');
      await page.click('button[type="submit"]:has-text("Add")');

      // Split expense
      await page.click(`[data-testid="expense-menu-${expenseName}"]`);
      await page.click('text=Split Expense');

      // Select split equally among 2 people
      await page.click('button:has-text("Split Equally")');
      // Assuming there are 2 collaborators
      await expect(page.locator('text=/€50.*each/i')).toBeVisible();

      // Confirm split
      await page.click('button:has-text("Confirm")');

      // Verify split is saved
      await expect(page.locator('text=/split/i')).toBeVisible();
    });

    test('should split expense with custom amounts', async ({ page }) => {
      // Add expense
      await page.click('button:has-text("Add Expense")');
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '100');
      await page.click('button[type="submit"]:has-text("Add")');

      // Split expense
      await page.click(`[data-testid="expense-menu-${expenseName}"]`);
      await page.click('text=Split Expense');

      // Custom split
      await page.click('button:has-text("Custom Split")');
      await page.fill('input[name="person-0-amount"]', '60');
      await page.fill('input[name="person-1-amount"]', '40');

      // Confirm split
      await page.click('button:has-text("Confirm")');

      // Verify split is saved
      await expect(page.locator('text=/€60/i')).toBeVisible();
      await expect(page.locator('text=/€40/i')).toBeVisible();
    });

    test('should display settlement summary', async ({ page }) => {
      // Add expense
      await page.click('button:has-text("Add Expense")');
      const expenseName = `Test expense ${Date.now()}`;
      await page.fill('input[name="description"]', expenseName);
      await page.fill('input[name="amount"]', '100');
      await page.click('button[type="submit"]:has-text("Add")');

      // Split expense
      await page.click(`[data-testid="expense-menu-${expenseName}"]`);
      await page.click('text=Split Expense');
      await page.click('button:has-text("Split Equally")');
      await page.click('button:has-text("Confirm")');

      // View settlement summary
      await page.click('button:has-text("View Settlements")');

      // Should show who owes who
      await expect(page.locator('text=/owes/i')).toBeVisible();
    });

    test('should mark settlement as paid', async ({ page }) => {
      // Add and split expense
      await page.click('button:has-text("Add Expense")');
      await page.fill('input[name="description"]', 'Test expense');
      await page.fill('input[name="amount"]', '100');
      await page.click('button[type="submit"]:has-text("Add")');

      await page.click('[data-testid="expense-menu-Test expense"]');
      await page.click('text=Split Expense');
      await page.click('button:has-text("Split Equally")');
      await page.click('button:has-text("Confirm")');

      // View settlements
      await page.click('button:has-text("View Settlements")');

      // Mark as settled
      await page.click('button:has-text("Mark as Settled")');

      // Should show as settled
      await expect(page.locator('text=/settled/i')).toBeVisible();
    });
  });

  test.describe('Expense Filtering', () => {
    test('should filter expenses by category', async ({ page }) => {
      // Add expenses in different categories
      await page.click('button:has-text("Add Expense")');
      await page.fill('input[name="description"]', 'Food expense');
      await page.fill('input[name="amount"]', '50');
      await page.selectOption('select[name="category"]', 'food');
      await page.click('button[type="submit"]:has-text("Add")');

      await page.click('button:has-text("Add Expense")');
      await page.fill('input[name="description"]', 'Activity expense');
      await page.fill('input[name="amount"]', '75');
      await page.selectOption('select[name="category"]', 'activities');
      await page.click('button[type="submit"]:has-text("Add")');

      // Filter by food category
      await page.selectOption('select[name="categoryFilter"]', 'food');

      // Should only show food expense
      await expect(page.locator('text=Food expense')).toBeVisible();
      await expect(page.locator('text=Activity expense')).not.toBeVisible();
    });

    test('should filter expenses by date range', async ({ page }) => {
      // Add expense
      await page.click('button:has-text("Add Expense")');
      await page.fill('input[name="description"]', 'Test expense');
      await page.fill('input[name="amount"]', '50');
      await page.click('button[type="submit"]:has-text("Add")');

      // Filter by date range
      await page.fill('input[name="startDate"]', '2025-01-01');
      await page.fill('input[name="endDate"]', '2025-12-31');

      // Expense should be visible
      await expect(page.locator('text=Test expense')).toBeVisible();
    });
  });
});
