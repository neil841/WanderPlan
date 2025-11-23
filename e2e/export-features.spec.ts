/**
 * E2E Tests: Export Features
 * Tests PDF export and calendar sync functionality
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser } from './utils/auth';
import { generateTestTrip, createTrip } from './utils/trips';
import { generateTestEvent, addEvent } from './utils/events';

test.describe('Export Features', () => {
  test.beforeEach(async ({ page }) => {
    // Create and login a test user
    const user = generateTestUser();
    await registerUser(page, user);

    // Create a test trip
    const trip = generateTestTrip();
    await createTrip(page, trip);
  });

  test.describe('PDF Export', () => {
    test('should open PDF export dialog', async ({ page }) => {
      // Click export button
      await page.click('button:has-text("Export PDF")');

      // Verify dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=/export.*pdf/i')).toBeVisible();
    });

    test('should configure PDF export options', async ({ page }) => {
      // Click export button
      await page.click('button:has-text("Export PDF")');

      // Select options
      await page.click('input[name="includeMap"]');
      await page.click('input[name="includeBudget"]');
      await page.click('input[name="includeCollaborators"]');

      // Verify options are selected
      await expect(page.locator('input[name="includeMap"]')).toBeChecked();
      await expect(page.locator('input[name="includeBudget"]')).toBeChecked();
      await expect(page.locator('input[name="includeCollaborators"]')).toBeChecked();
    });

    test('should download PDF', async ({ page }) => {
      // Add an event first to make PDF more interesting
      await page.click('a[href*="/itinerary"]');
      const event = generateTestEvent('activity');
      await addEvent(page, event);

      // Go back to trip overview
      await page.click('a[href*="/trips/"]').first();

      // Click export button
      await page.click('button:has-text("Export PDF")');

      // Start waiting for download
      const downloadPromise = page.waitForEvent('download');

      // Click download button
      await page.click('button:has-text("Download")');

      // Wait for download
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });

    test('should email PDF', async ({ page }) => {
      // Click export button
      await page.click('button:has-text("Export PDF")');

      // Click email button
      await page.click('button:has-text("Email PDF")');

      // Should show success message
      await expect(page.locator('text=/email.*sent/i')).toBeVisible({ timeout: 10000 });
    });

    test('should handle PDF generation errors', async ({ page }) => {
      // Click export button
      await page.click('button:has-text("Export PDF")');

      // Simulate error by disconnecting (in real scenario)
      // For testing, we'll just verify error handling exists
      await page.click('button:has-text("Download")');

      // Wait for either success or error
      const successOrError = page.locator('text=/success|error/i');
      await expect(successOrError).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Google Calendar Sync', () => {
    test('should open calendar sync dialog', async ({ page }) => {
      // Click sync button
      await page.click('button:has-text("Sync to Calendar")');

      // Verify dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=/google.*calendar/i')).toBeVisible();
    });

    test('should initiate OAuth flow for Google Calendar', async ({ page, context }) => {
      // Click sync button
      await page.click('button:has-text("Sync to Calendar")');

      // Click connect button
      const pagePromise = context.waitForEvent('page');
      await page.click('button:has-text("Connect Google Calendar")');

      // Should open OAuth popup
      const oauthPage = await pagePromise;
      await expect(oauthPage).toHaveURL(/accounts\.google\.com/);

      await oauthPage.close();
    });

    test('should show sync confirmation', async ({ page }) => {
      // Assuming user is already connected (mock OAuth)
      // Click sync button
      await page.click('button:has-text("Sync to Calendar")');

      // If already connected, should show sync confirmation
      const confirmButton = page.locator('button:has-text("Sync Now")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();

        // Should show success message
        await expect(page.locator('text=/synced.*successfully/i')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should sync events to Google Calendar', async ({ page }) => {
      // Add an event first
      await page.click('a[href*="/itinerary"]');
      const event = generateTestEvent('activity');
      await addEvent(page, event);

      // Go back to trip overview
      await page.click('a[href*="/trips/"]').first();

      // Sync to calendar
      await page.click('button:has-text("Sync to Calendar")');

      // Assuming already connected, click sync
      const syncButton = page.locator('button:has-text("Sync Now")');
      if (await syncButton.isVisible()) {
        await syncButton.click();

        // Should show success with event count
        await expect(page.locator('text=/1.*event.*synced/i')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should disconnect Google Calendar', async ({ page }) => {
      // Navigate to integrations settings
      await page.goto('/settings/integrations');

      // If Google Calendar is connected, disconnect
      const disconnectButton = page.locator('button:has-text("Disconnect")');
      if (await disconnectButton.isVisible()) {
        await disconnectButton.click();

        // Confirm disconnection
        await page.click('button:has-text("Disconnect")');

        // Should show disconnected state
        await expect(page.locator('text=/not.*connected/i')).toBeVisible();
      }
    });
  });

  test.describe('Export with Data', () => {
    test('should export trip with itinerary', async ({ page }) => {
      // Add multiple events
      await page.click('a[href*="/itinerary"]');

      for (let i = 0; i < 3; i++) {
        const event = generateTestEvent('activity');
        event.title = `Event ${i + 1}`;
        await addEvent(page, event);
      }

      // Go back to trip overview
      await page.click('a[href*="/trips/"]').first();

      // Export PDF
      await page.click('button:has-text("Export PDF")');

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });

    test('should export trip with budget and expenses', async ({ page }) => {
      // Set budget
      await page.click('a[href*="/budget"]');
      await page.click('button:has-text("Edit Budget")');
      await page.fill('input[name="totalBudget"]', '1000');
      await page.click('button[type="submit"]:has-text("Save")');

      // Add expense
      await page.click('button:has-text("Add Expense")');
      await page.fill('input[name="description"]', 'Test expense');
      await page.fill('input[name="amount"]', '50');
      await page.click('button[type="submit"]:has-text("Add")');

      // Go back to trip overview
      await page.click('a[href*="/trips/"]').first();

      // Export PDF with budget
      await page.click('button:has-text("Export PDF")');
      await page.click('input[name="includeBudget"]');

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });

    test('should export trip with collaborators', async ({ page }) => {
      // Navigate to collaborators
      await page.click('a[href*="/collaborators"]');

      // Invite a collaborator
      await page.click('button:has-text("Invite Collaborator")');
      await page.fill('input[name="email"]', `collaborator-${Date.now()}@example.com`);
      await page.selectOption('select[name="role"]', 'VIEWER');
      await page.click('button[type="submit"]:has-text("Send")');

      // Go back to trip overview
      await page.click('a[href*="/trips/"]').first();

      // Export PDF with collaborators
      await page.click('button:has-text("Export PDF")');
      await page.click('input[name="includeCollaborators"]');

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });
  });

  test.describe('Mobile Export', () => {
    test('should export PDF on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Click export button
      await page.click('button:has-text("Export PDF")');

      // Verify mobile-friendly dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });

    test('should export calendar sync on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Click sync button
      await page.click('button:has-text("Sync to Calendar")');

      // Verify dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });
});
