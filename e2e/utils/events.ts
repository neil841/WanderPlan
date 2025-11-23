/**
 * Event management utilities for E2E tests
 * Provides helper functions for creating and managing itinerary events
 */

import { Page, expect } from '@playwright/test';
import { format } from 'date-fns';

export type EventType = 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transportation' | 'destination';

export interface TestEvent {
  type: EventType;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  cost?: number;
  notes?: string;
}

/**
 * Generate a test event
 */
export function generateTestEvent(type: EventType = 'activity'): TestEvent {
  const timestamp = Date.now();
  const date = new Date();
  date.setDate(date.getDate() + 10);

  return {
    type,
    title: `Test ${type} ${timestamp}`,
    date,
    startTime: '10:00',
    endTime: '12:00',
    location: 'Paris, France',
    cost: 50,
    notes: 'Test event for E2E testing',
  };
}

/**
 * Add an event to the itinerary
 */
export async function addEvent(
  page: Page,
  event: TestEvent
): Promise<void> {
  // Navigate to itinerary tab
  await page.click('a[href*="/itinerary"]');
  await page.waitForURL(/\/itinerary/, { timeout: 5000 });

  // Click "Add Event" button
  await page.click('button:has-text("Add Event")');

  // Wait for dialog to open
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });

  // Select event type
  await page.click(`button:has-text("${event.type}")`);

  // Fill event form
  await page.fill('input[name="title"]', event.title);

  const dateStr = format(event.date, 'yyyy-MM-dd');
  await page.fill('input[name="date"]', dateStr);

  if (event.startTime) {
    await page.fill('input[name="startTime"]', event.startTime);
  }

  if (event.endTime) {
    await page.fill('input[name="endTime"]', event.endTime);
  }

  if (event.location) {
    await page.fill('input[name="location"]', event.location);
  }

  if (event.cost) {
    await page.fill('input[name="cost"]', event.cost.toString());
  }

  if (event.notes) {
    await page.fill('textarea[name="notes"]', event.notes);
  }

  // Submit form
  await page.click('button[type="submit"]:has-text("Add")');

  // Wait for event to appear in itinerary
  await expect(page.locator(`text=${event.title}`)).toBeVisible({ timeout: 5000 });
}

/**
 * Edit an existing event
 */
export async function editEvent(
  page: Page,
  oldTitle: string,
  newTitle: string
): Promise<void> {
  // Find and click event
  await page.click(`[data-testid="event-${oldTitle}"]`);

  // Click edit button
  await page.click('button:has-text("Edit")');

  // Wait for edit dialog
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });

  // Update title
  await page.fill('input[name="title"]', newTitle);

  // Submit form
  await page.click('button[type="submit"]:has-text("Save")');

  // Wait for updated event
  await expect(page.locator(`text=${newTitle}`)).toBeVisible({ timeout: 5000 });
}

/**
 * Delete an event
 */
export async function deleteEvent(
  page: Page,
  eventTitle: string
): Promise<void> {
  // Find and click event
  await page.click(`[data-testid="event-${eventTitle}"]`);

  // Click delete button
  await page.click('button:has-text("Delete")');

  // Confirm deletion
  await page.click('button:has-text("Delete")');

  // Wait for event to disappear
  await expect(page.locator(`text=${eventTitle}`)).not.toBeVisible({ timeout: 5000 });
}
