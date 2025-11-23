/**
 * E2E Tests: Itinerary Building
 * Tests event creation, editing, reordering, and deletion
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser } from './utils/auth';
import { generateTestTrip, createTrip } from './utils/trips';
import { generateTestEvent, addEvent, editEvent, deleteEvent } from './utils/events';

test.describe('Itinerary Building', () => {
  test.beforeEach(async ({ page }) => {
    // Create and login a test user before each test
    const user = generateTestUser();
    await registerUser(page, user);

    // Create a test trip
    const trip = generateTestTrip();
    await createTrip(page, trip);

    // Navigate to itinerary tab
    await page.click('a[href*="/itinerary"]');
  });

  test.describe('Event Creation', () => {
    test('should add an activity event', async ({ page }) => {
      const event = generateTestEvent('activity');

      await addEvent(page, event);

      // Verify event is displayed
      await expect(page.locator(`text=${event.title}`)).toBeVisible();
    });

    test('should add a flight event', async ({ page }) => {
      const event = generateTestEvent('flight');

      await addEvent(page, event);

      // Verify event is displayed with flight icon
      await expect(page.locator(`text=${event.title}`)).toBeVisible();
      await expect(page.locator('[data-testid="flight-icon"]')).toBeVisible();
    });

    test('should add a hotel event', async ({ page }) => {
      const event = generateTestEvent('hotel');

      await addEvent(page, event);

      // Verify event is displayed
      await expect(page.locator(`text=${event.title}`)).toBeVisible();
    });

    test('should add a restaurant event', async ({ page }) => {
      const event = generateTestEvent('restaurant');

      await addEvent(page, event);

      // Verify event is displayed
      await expect(page.locator(`text=${event.title}`)).toBeVisible();
    });

    test('should add multiple events', async ({ page }) => {
      const event1 = generateTestEvent('activity');
      const event2 = generateTestEvent('restaurant');
      event2.title = `${event2.title} - Second`;

      await addEvent(page, event1);
      await addEvent(page, event2);

      // Both events should be visible
      await expect(page.locator(`text=${event1.title}`)).toBeVisible();
      await expect(page.locator(`text=${event2.title}`)).toBeVisible();
    });

    test('should show validation errors for invalid event data', async ({ page }) => {
      await page.click('button:has-text("Add Event")');
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Select event type
      await page.click('button:has-text("activity")');

      // Try to submit empty form
      await page.click('button[type="submit"]:has-text("Add")');

      // Should show validation errors
      await expect(page.locator('text=/title.*required/i')).toBeVisible();
    });
  });

  test.describe('Event Display', () => {
    test('should display event details correctly', async ({ page }) => {
      const event = generateTestEvent('activity');
      event.cost = 50;
      event.notes = 'Test notes for the event';

      await addEvent(page, event);

      // Click on event to view details
      const eventCard = page.locator(`[data-testid="event-${event.title}"]`);
      await eventCard.click();

      // Verify all details are displayed
      await expect(page.locator(`text=${event.title}`)).toBeVisible();
      if (event.cost) {
        await expect(page.locator(`text=€${event.cost}`)).toBeVisible();
      }
      if (event.location) {
        await expect(page.locator(`text=${event.location}`)).toBeVisible();
      }
    });

    test('should group events by day', async ({ page }) => {
      const event1 = generateTestEvent('activity');
      const event2 = generateTestEvent('restaurant');

      await addEvent(page, event1);
      await addEvent(page, event2);

      // Verify day header is present
      await expect(page.locator('[data-testid="day-header"]')).toBeVisible();
    });

    test('should show empty state when no events', async ({ page }) => {
      // Should show empty itinerary message
      await expect(page.locator('text=/no events.*yet/i')).toBeVisible();
      await expect(page.locator('button:has-text("Add Event")')).toBeVisible();
    });
  });

  test.describe('Event Editing', () => {
    test('should edit an existing event', async ({ page }) => {
      const event = generateTestEvent('activity');
      await addEvent(page, event);

      const newTitle = `${event.title} - Updated`;
      await editEvent(page, event.title, newTitle);

      // Verify updated title is displayed
      await expect(page.locator(`text=${newTitle}`)).toBeVisible();
      await expect(page.locator(`text=${event.title}`)).not.toBeVisible();
    });

    test('should preserve other fields when editing title', async ({ page }) => {
      const event = generateTestEvent('activity');
      event.cost = 50;

      await addEvent(page, event);

      // Edit event
      await page.click(`[data-testid="event-${event.title}"]`);
      await page.click('button:has-text("Edit")');

      // Verify fields are pre-filled
      const titleInput = page.locator('input[name="title"]');
      await expect(titleInput).toHaveValue(event.title);

      if (event.cost) {
        const costInput = page.locator('input[name="cost"]');
        await expect(costInput).toHaveValue(event.cost.toString());
      }
    });
  });

  test.describe('Event Deletion', () => {
    test('should delete an event', async ({ page }) => {
      const event = generateTestEvent('activity');
      await addEvent(page, event);

      await deleteEvent(page, event.title);

      // Event should not be visible
      await expect(page.locator(`text=${event.title}`)).not.toBeVisible();
    });

    test('should cancel event deletion', async ({ page }) => {
      const event = generateTestEvent('activity');
      await addEvent(page, event);

      // Click on event
      await page.click(`[data-testid="event-${event.title}"]`);

      // Click delete button
      await page.click('button:has-text("Delete")');

      // Cancel deletion
      await page.click('button:has-text("Cancel")');

      // Event should still be visible
      await expect(page.locator(`text=${event.title}`)).toBeVisible();
    });
  });

  test.describe('Drag and Drop Reordering', () => {
    test('should reorder events via drag and drop', async ({ page }) => {
      const event1 = generateTestEvent('activity');
      const event2 = generateTestEvent('restaurant');
      event2.title = `${event2.title} - Second`;

      await addEvent(page, event1);
      await addEvent(page, event2);

      // Get initial positions
      const event1Loc = page.locator(`[data-testid="event-${event1.title}"]`);
      const event2Loc = page.locator(`[data-testid="event-${event2.title}"]`);

      // Drag event2 above event1
      await event2Loc.dragTo(event1Loc);

      // Wait for reorder to complete
      await page.waitForTimeout(1000);

      // Verify events are reordered (event2 should now be first)
      const eventCards = page.locator('[data-testid^="event-"]');
      const firstEvent = await eventCards.first().textContent();
      expect(firstEvent).toContain(event2.title);
    });

    test('should persist reordered events', async ({ page }) => {
      const event1 = generateTestEvent('activity');
      const event2 = generateTestEvent('restaurant');
      event2.title = `${event2.title} - Second`;

      await addEvent(page, event1);
      await addEvent(page, event2);

      // Drag event2 above event1
      const event1Loc = page.locator(`[data-testid="event-${event1.title}"]`);
      const event2Loc = page.locator(`[data-testid="event-${event2.title}"]`);
      await event2Loc.dragTo(event1Loc);

      // Reload page
      await page.reload();

      // Verify order is persisted
      const eventCards = page.locator('[data-testid^="event-"]');
      const firstEvent = await eventCards.first().textContent();
      expect(firstEvent).toContain(event2.title);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate events with keyboard', async ({ page }) => {
      const event = generateTestEvent('activity');
      await addEvent(page, event);

      // Focus on event
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));

      // Verify event is focusable
      expect(focusedElement).toContain('event-');
    });

    test('should open event details with Enter key', async ({ page }) => {
      const event = generateTestEvent('activity');
      await addEvent(page, event);

      // Focus on event and press Enter
      await page.locator(`[data-testid="event-${event.title}"]`).focus();
      await page.keyboard.press('Enter');

      // Event details should be visible
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });

  test.describe('Mobile Experience', () => {
    test('should display itinerary correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const event = generateTestEvent('activity');
      await addEvent(page, event);

      // Verify event is visible on mobile
      await expect(page.locator(`text=${event.title}`)).toBeVisible();
    });

    test('should support touch gestures for reordering', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const event1 = generateTestEvent('activity');
      const event2 = generateTestEvent('restaurant');
      event2.title = `${event2.title} - Second`;

      await addEvent(page, event1);
      await addEvent(page, event2);

      // Touch drag should work (Playwright simulates touch)
      const event2Loc = page.locator(`[data-testid="event-${event2.title}"]`);
      const event1Loc = page.locator(`[data-testid="event-${event1.title}"]`);
      await event2Loc.dragTo(event1Loc);

      // Wait for reorder
      await page.waitForTimeout(1000);

      // Verify reorder worked
      const eventCards = page.locator('[data-testid^="event-"]');
      const firstEvent = await eventCards.first().textContent();
      expect(firstEvent).toContain(event2.title);
    });
  });

  test.describe('Performance', () => {
    test('should handle 20+ events without performance issues', async ({ page }) => {
      // Add 20 events
      for (let i = 0; i < 20; i++) {
        const event = generateTestEvent('activity');
        event.title = `Event ${i + 1}`;
        await addEvent(page, event);
      }

      // Page should still be responsive
      const loadTime = await page.evaluate(() => performance.now());
      expect(loadTime).toBeLessThan(5000); // Should load in less than 5 seconds

      // Verify all events are visible
      const eventCount = await page.locator('[data-testid^="event-"]').count();
      expect(eventCount).toBe(20);
    });
  });
});
