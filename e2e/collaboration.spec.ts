/**
 * E2E Tests: Collaboration
 * Tests collaborator invitations, messaging, polls, and permissions
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser, logout, login } from './utils/auth';
import { generateTestTrip, createTrip } from './utils/trips';

test.describe('Collaboration Features', () => {
  test.describe('Collaborator Invitations', () => {
    test('should invite a collaborator to a trip', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to collaborators tab
      await page.click('a[href*="/collaborators"]');

      // Click invite button
      await page.click('button:has-text("Invite Collaborator")');

      // Wait for invite dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Fill invite form
      const collaboratorEmail = `collaborator-${Date.now()}@example.com`;
      await page.fill('input[name="email"]', collaboratorEmail);
      await page.selectOption('select[name="role"]', 'EDITOR');

      // Send invitation
      await page.click('button[type="submit"]:has-text("Send")');

      // Verify invitation was sent
      await expect(page.locator(`text=${collaboratorEmail}`)).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/pending/i')).toBeVisible();
    });

    test('should not allow duplicate invitations', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to collaborators tab
      await page.click('a[href*="/collaborators"]');

      const collaboratorEmail = `collaborator-${Date.now()}@example.com`;

      // Send first invitation
      await page.click('button:has-text("Invite Collaborator")');
      await page.fill('input[name="email"]', collaboratorEmail);
      await page.selectOption('select[name="role"]', 'EDITOR');
      await page.click('button[type="submit"]:has-text("Send")');

      // Try to send duplicate invitation
      await page.click('button:has-text("Invite Collaborator")');
      await page.fill('input[name="email"]', collaboratorEmail);
      await page.selectOption('select[name="role"]', 'EDITOR');
      await page.click('button[type="submit"]:has-text("Send")');

      // Should show error
      await expect(page.locator('text=/already.*invited/i')).toBeVisible();
    });

    test('should accept collaboration invitation', async ({ page, context }) => {
      const owner = generateTestUser();
      const collaborator = generateTestUser();

      // Owner creates trip and sends invitation
      await registerUser(page, owner);
      const trip = generateTestTrip();
      await createTrip(page, trip);

      await page.click('a[href*="/collaborators"]');
      await page.click('button:has-text("Invite Collaborator")');
      await page.fill('input[name="email"]', collaborator.email);
      await page.selectOption('select[name="role"]', 'EDITOR');
      await page.click('button[type="submit"]:has-text("Send")');

      // Note: In a real scenario, collaborator would receive email with invitation link
      // For E2E testing, we'll simulate accepting the invitation
      await logout(page);

      // Register collaborator
      await registerUser(page, collaborator);

      // Check notifications for invitation
      await page.click('[data-testid="notifications-menu"]');

      // Accept invitation
      await page.click('text=/invitation.*trip/i');
      await page.click('button:has-text("Accept")');

      // Should see trip in trips list
      await page.goto('/trips');
      await expect(page.locator(`text=${trip.title}`)).toBeVisible();
    });
  });

  test.describe('Collaborator Management', () => {
    test('should display list of collaborators', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to collaborators tab
      await page.click('a[href*="/collaborators"]');

      // Owner should be listed
      await expect(page.locator(`text=${owner.firstName}`)).toBeVisible();
      await expect(page.locator('text=/owner/i')).toBeVisible();
    });

    test('should change collaborator role', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to collaborators tab
      await page.click('a[href*="/collaborators"]');

      // Invite a collaborator
      const collaboratorEmail = `collaborator-${Date.now()}@example.com`;
      await page.click('button:has-text("Invite Collaborator")');
      await page.fill('input[name="email"]', collaboratorEmail);
      await page.selectOption('select[name="role"]', 'VIEWER');
      await page.click('button[type="submit"]:has-text("Send")');

      // Wait for invitation to appear
      await expect(page.locator(`text=${collaboratorEmail}`)).toBeVisible();

      // Change role to EDITOR
      await page.click(`[data-testid="collaborator-menu-${collaboratorEmail}"]`);
      await page.click('text=Change Role');
      await page.selectOption('select[name="role"]', 'EDITOR');
      await page.click('button[type="submit"]:has-text("Save")');

      // Verify role was changed
      await expect(page.locator('text=/editor/i')).toBeVisible();
    });

    test('should remove a collaborator', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to collaborators tab
      await page.click('a[href*="/collaborators"]');

      // Invite a collaborator
      const collaboratorEmail = `collaborator-${Date.now()}@example.com`;
      await page.click('button:has-text("Invite Collaborator")');
      await page.fill('input[name="email"]', collaboratorEmail);
      await page.selectOption('select[name="role"]', 'VIEWER');
      await page.click('button[type="submit"]:has-text("Send")');

      // Remove collaborator
      await page.click(`[data-testid="collaborator-menu-${collaboratorEmail}"]`);
      await page.click('text=Remove');
      await page.click('button:has-text("Remove")');

      // Collaborator should not be in list
      await expect(page.locator(`text=${collaboratorEmail}`)).not.toBeVisible();
    });
  });

  test.describe('Real-time Messaging', () => {
    test('should send a message in trip discussion', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to messages tab
      await page.click('a[href*="/messages"]');

      // Send a message
      const messageText = `Test message ${Date.now()}`;
      await page.fill('textarea[name="message"]', messageText);
      await page.click('button[type="submit"]:has-text("Send")');

      // Verify message appears
      await expect(page.locator(`text=${messageText}`)).toBeVisible({ timeout: 5000 });
    });

    test('should display message with sender info', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to messages tab
      await page.click('a[href*="/messages"]');

      // Send a message
      const messageText = `Test message ${Date.now()}`;
      await page.fill('textarea[name="message"]', messageText);
      await page.click('button[type="submit"]:has-text("Send")');

      // Verify sender name is displayed
      await expect(page.locator(`text=${owner.firstName}`)).toBeVisible();
    });

    test('should edit own message', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to messages tab
      await page.click('a[href*="/messages"]');

      // Send a message
      const messageText = `Test message ${Date.now()}`;
      await page.fill('textarea[name="message"]', messageText);
      await page.click('button[type="submit"]:has-text("Send")');

      // Edit message
      await page.click('[data-testid="message-menu"]');
      await page.click('text=Edit');
      const editedText = `${messageText} - Edited`;
      await page.fill('textarea[name="message"]', editedText);
      await page.click('button:has-text("Save")');

      // Verify edited message
      await expect(page.locator(`text=${editedText}`)).toBeVisible();
      await expect(page.locator('text=/edited/i')).toBeVisible();
    });

    test('should delete own message', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to messages tab
      await page.click('a[href*="/messages"]');

      // Send a message
      const messageText = `Test message ${Date.now()}`;
      await page.fill('textarea[name="message"]', messageText);
      await page.click('button[type="submit"]:has-text("Send")');

      // Delete message
      await page.click('[data-testid="message-menu"]');
      await page.click('text=Delete');
      await page.click('button:has-text("Delete")');

      // Message should not be visible
      await expect(page.locator(`text=${messageText}`)).not.toBeVisible();
    });
  });

  test.describe('Ideas and Voting', () => {
    test('should create an idea', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to ideas tab
      await page.click('a[href*="/ideas"]');

      // Create idea
      await page.click('button:has-text("Add Idea")');
      const ideaTitle = `Test idea ${Date.now()}`;
      await page.fill('input[name="title"]', ideaTitle);
      await page.fill('textarea[name="description"]', 'Test idea description');
      await page.click('button[type="submit"]:has-text("Add")');

      // Verify idea appears
      await expect(page.locator(`text=${ideaTitle}`)).toBeVisible({ timeout: 5000 });
    });

    test('should vote on an idea', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to ideas tab
      await page.click('a[href*="/ideas"]');

      // Create idea
      await page.click('button:has-text("Add Idea")');
      const ideaTitle = `Test idea ${Date.now()}`;
      await page.fill('input[name="title"]', ideaTitle);
      await page.click('button[type="submit"]:has-text("Add")');

      // Upvote the idea
      await page.click('[data-testid="upvote-button"]');

      // Verify vote count increased
      await expect(page.locator('text=/1.*vote/i')).toBeVisible();
    });
  });

  test.describe('Polls', () => {
    test('should create a poll', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to polls section
      await page.click('a[href*="/polls"]');

      // Create poll
      await page.click('button:has-text("Create Poll")');
      const pollQuestion = `Test poll ${Date.now()}`;
      await page.fill('input[name="question"]', pollQuestion);
      await page.fill('input[name="option-0"]', 'Option 1');
      await page.fill('input[name="option-1"]', 'Option 2');
      await page.click('button[type="submit"]:has-text("Create")');

      // Verify poll appears
      await expect(page.locator(`text=${pollQuestion}`)).toBeVisible({ timeout: 5000 });
    });

    test('should vote in a poll', async ({ page }) => {
      const owner = generateTestUser();
      await registerUser(page, owner);

      const trip = generateTestTrip();
      await createTrip(page, trip);

      // Navigate to polls section
      await page.click('a[href*="/polls"]');

      // Create poll
      await page.click('button:has-text("Create Poll")');
      const pollQuestion = `Test poll ${Date.now()}`;
      await page.fill('input[name="question"]', pollQuestion);
      await page.fill('input[name="option-0"]', 'Option 1');
      await page.fill('input[name="option-1"]', 'Option 2');
      await page.click('button[type="submit"]:has-text("Create")');

      // Vote for option 1
      await page.click('input[value="option-0"]');
      await page.click('button:has-text("Vote")');

      // Verify vote was recorded
      await expect(page.locator('text=/1.*vote/i')).toBeVisible();
    });
  });
});
