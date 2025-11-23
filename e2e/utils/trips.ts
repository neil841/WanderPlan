/**
 * Trip management utilities for E2E tests
 * Provides helper functions for creating, editing, and managing trips
 */

import { Page, expect } from '@playwright/test';
import { addDays, format } from 'date-fns';

export interface TestTrip {
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}

/**
 * Generate a test trip with unique name
 */
export function generateTestTrip(): TestTrip {
  const timestamp = Date.now();
  const startDate = addDays(new Date(), 7);
  const endDate = addDays(startDate, 5);

  return {
    title: `Test Trip ${timestamp}`,
    destination: 'Paris, France',
    startDate,
    endDate,
    description: 'A test trip for E2E testing',
  };
}

/**
 * Create a new trip via the UI
 */
export async function createTrip(
  page: Page,
  trip: TestTrip
): Promise<void> {
  // Navigate to trips page
  await page.goto('/trips');

  // Click "Create Trip" button
  await page.click('button:has-text("Create Trip")');

  // Wait for dialog to open
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });

  // Fill trip form
  await page.fill('input[name="title"]', trip.title);
  await page.fill('input[name="destination"]', trip.destination);

  // Fill dates
  const startDateStr = format(trip.startDate, 'yyyy-MM-dd');
  const endDateStr = format(trip.endDate, 'yyyy-MM-dd');
  await page.fill('input[name="startDate"]', startDateStr);
  await page.fill('input[name="endDate"]', endDateStr);

  if (trip.description) {
    await page.fill('textarea[name="description"]', trip.description);
  }

  // Submit form
  await page.click('button[type="submit"]:has-text("Create")');

  // Wait for redirect to trip details
  await page.waitForURL(/\/trips\/[a-z0-9-]+/, { timeout: 10000 });

  // Verify trip was created
  await expect(page.locator(`text=${trip.title}`)).toBeVisible();
}

/**
 * Find a trip in the trip list
 */
export async function findTrip(
  page: Page,
  tripTitle: string
): Promise<boolean> {
  await page.goto('/trips');

  try {
    await page.waitForSelector(`text=${tripTitle}`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Navigate to trip details page
 */
export async function navigateToTrip(
  page: Page,
  tripTitle: string
): Promise<void> {
  await page.goto('/trips');

  // Click on trip card
  await page.click(`text=${tripTitle}`);

  // Wait for trip details page
  await page.waitForURL(/\/trips\/[a-z0-9-]+/, { timeout: 5000 });
}

/**
 * Delete a trip
 */
export async function deleteTrip(
  page: Page,
  tripTitle: string
): Promise<void> {
  await navigateToTrip(page, tripTitle);

  // Click delete button (usually in a menu)
  await page.click('[data-testid="trip-menu"]');
  await page.click('text=Delete Trip');

  // Confirm deletion
  await page.click('button:has-text("Delete")');

  // Wait for redirect to trips list
  await page.waitForURL('/trips', { timeout: 5000 });
}
