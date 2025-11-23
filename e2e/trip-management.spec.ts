/**
 * E2E Tests: Trip Management
 * Tests trip creation, viewing, editing, and deletion
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser } from './utils/auth';
import { generateTestTrip, createTrip, findTrip, navigateToTrip, deleteTrip } from './utils/trips';

test.describe('Trip Management', () => {
  test.beforeEach(async ({ page }) => {
    // Create and login a test user before each test
    const user = generateTestUser();
    await registerUser(page, user);
  });

  test.describe('Trip Creation', () => {
    test('should create a new trip successfully', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Verify trip details are displayed
      await expect(page.locator(`text=${trip.title}`)).toBeVisible();
      await expect(page.locator(`text=${trip.destination}`)).toBeVisible();
    });

    test('should show validation errors for invalid trip data', async ({ page }) => {
      await page.goto('/trips');
      await page.click('button:has-text("Create Trip")');

      // Try to submit empty form
      await page.click('button[type="submit"]:has-text("Create")');

      // Should show validation errors
      await expect(page.locator('text=/title.*required/i')).toBeVisible();
    });

    test('should reject end date before start date', async ({ page }) => {
      await page.goto('/trips');
      await page.click('button:has-text("Create Trip")');

      await page.fill('input[name="title"]', 'Test Trip');
      await page.fill('input[name="destination"]', 'Paris');
      await page.fill('input[name="startDate"]', '2025-12-31');
      await page.fill('input[name="endDate"]', '2025-12-01'); // Before start date

      await page.click('button[type="submit"]:has-text("Create")');

      // Should show validation error
      await expect(page.locator('text=/end.*after.*start/i')).toBeVisible();
    });

    test('should create trip with all optional fields', async ({ page }) => {
      const trip = generateTestTrip();
      trip.description = 'A detailed description of the trip';

      await createTrip(page, trip);

      // Verify all fields are saved
      await expect(page.locator(`text=${trip.title}`)).toBeVisible();
      await expect(page.locator(`text=${trip.destination}`)).toBeVisible();
      if (trip.description) {
        await expect(page.locator(`text=${trip.description}`)).toBeVisible();
      }
    });
  });

  test.describe('Trip Listing', () => {
    test('should display all user trips', async ({ page }) => {
      const trip1 = generateTestTrip();
      const trip2 = generateTestTrip();
      trip2.title = `${trip2.title} - Second`;

      // Create two trips
      await createTrip(page, trip1);
      await createTrip(page, trip2);

      // Go to trips list
      await page.goto('/trips');

      // Both trips should be visible
      await expect(page.locator(`text=${trip1.title}`)).toBeVisible();
      await expect(page.locator(`text=${trip2.title}`)).toBeVisible();
    });

    test('should show empty state when no trips exist', async ({ page }) => {
      await page.goto('/trips');

      // Should show empty state
      await expect(page.locator('text=/no trips.*yet/i')).toBeVisible();
      await expect(page.locator('button:has-text("Create Trip")')).toBeVisible();
    });

    test('should filter trips by search', async ({ page }) => {
      const trip1 = generateTestTrip();
      trip1.title = 'Summer Vacation to Paris';
      const trip2 = generateTestTrip();
      trip2.title = 'Winter Trip to Tokyo';

      // Create two trips
      await createTrip(page, trip1);
      await createTrip(page, trip2);

      // Go to trips list
      await page.goto('/trips');

      // Search for "Paris"
      await page.fill('input[placeholder*="Search"]', 'Paris');

      // Should show only Paris trip
      await expect(page.locator(`text=${trip1.title}`)).toBeVisible();
      await expect(page.locator(`text=${trip2.title}`)).not.toBeVisible();
    });
  });

  test.describe('Trip Details', () => {
    test('should navigate to trip details page', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Should be on trip details page
      await expect(page).toHaveURL(/\/trips\/[a-z0-9-]+/);
      await expect(page.locator(`h1:has-text("${trip.title}")`)).toBeVisible();
    });

    test('should display all trip information', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Verify all trip details are displayed
      await expect(page.locator(`text=${trip.title}`)).toBeVisible();
      await expect(page.locator(`text=${trip.destination}`)).toBeVisible();

      // Verify tabs are present
      await expect(page.locator('a[href*="/itinerary"]')).toBeVisible();
      await expect(page.locator('a[href*="/calendar"]')).toBeVisible();
      await expect(page.locator('a[href*="/map"]')).toBeVisible();
      await expect(page.locator('a[href*="/budget"]')).toBeVisible();
    });

    test('should navigate between trip tabs', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Click itinerary tab
      await page.click('a[href*="/itinerary"]');
      await expect(page).toHaveURL(/\/itinerary/);

      // Click calendar tab
      await page.click('a[href*="/calendar"]');
      await expect(page).toHaveURL(/\/calendar/);

      // Click map tab
      await page.click('a[href*="/map"]');
      await expect(page).toHaveURL(/\/map/);

      // Click budget tab
      await page.click('a[href*="/budget"]');
      await expect(page).toHaveURL(/\/budget/);
    });
  });

  test.describe('Trip Editing', () => {
    test('should edit trip details', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Click edit button
      await page.click('[data-testid="trip-menu"]');
      await page.click('text=Edit Trip');

      // Wait for edit dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Update trip title
      const newTitle = `${trip.title} - Updated`;
      await page.fill('input[name="title"]', newTitle);

      // Submit form
      await page.click('button[type="submit"]:has-text("Save")');

      // Verify updated title is displayed
      await expect(page.locator(`text=${newTitle}`)).toBeVisible({ timeout: 5000 });
    });

    test('should preserve other fields when editing', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Click edit button
      await page.click('[data-testid="trip-menu"]');
      await page.click('text=Edit Trip');

      // Wait for edit dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Verify fields are pre-filled
      const titleInput = page.locator('input[name="title"]');
      await expect(titleInput).toHaveValue(trip.title);
    });
  });

  test.describe('Trip Deletion', () => {
    test('should delete a trip', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Delete trip
      await page.click('[data-testid="trip-menu"]');
      await page.click('text=Delete Trip');

      // Confirm deletion
      await page.click('button:has-text("Delete")');

      // Should redirect to trips list
      await expect(page).toHaveURL('/trips');

      // Trip should not be in list
      const tripExists = await findTrip(page, trip.title);
      expect(tripExists).toBe(false);
    });

    test('should cancel trip deletion', async ({ page }) => {
      const trip = generateTestTrip();

      await createTrip(page, trip);

      // Click delete button
      await page.click('[data-testid="trip-menu"]');
      await page.click('text=Delete Trip');

      // Cancel deletion
      await page.click('button:has-text("Cancel")');

      // Should still be on trip details page
      await expect(page.locator(`text=${trip.title}`)).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display trips correctly on mobile', async ({ page }) => {
      const trip = generateTestTrip();

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await createTrip(page, trip);

      // Verify trip is visible on mobile
      await expect(page.locator(`text=${trip.title}`)).toBeVisible();
    });

    test('should have working mobile navigation', async ({ page }) => {
      const trip = generateTestTrip();

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await createTrip(page, trip);

      // Open mobile menu
      await page.click('[data-testid="mobile-menu"]');

      // Verify menu items are visible
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Trips')).toBeVisible();
    });
  });
});
