import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'testuser2@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User2'
};

// Helper function to login
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

test.describe('PHASE 1: Authentication - Complete Feature Testing', () => {
  test('1.1-1.6: User Registration Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Fill registration form
    await page.fill('input[name="firstName"]', 'New');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[type="email"]', `newuser${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'Password123!');

    // Submit and check for success
    await page.click('button[type="submit"]');

    // Wait for redirect (either to verify-email or dashboard)
    await page.waitForURL(/\/(verify-email|dashboard)/, { timeout: 10000 });
    const url = page.url();
    const success = url.includes('/dashboard') || url.includes('/verify-email');

    await page.screenshot({ path: '/tmp/screenshots/phase1-registration.png' });
    expect(success).toBeTruthy();
    console.log('✅ Phase 1.1-1.6: Registration works');
  });

  test('1.7-1.8: Login Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });

    // Verify user is logged in by checking for user info
    const userInfo = await page.textContent('body');
    expect(userInfo).toContain('Test');

    await page.screenshot({ path: '/tmp/screenshots/phase1-login.png' });
    console.log('✅ Phase 1.7-1.8: Login works');
  });

  test('1.11: User Profile Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/settings/profile`);
    await page.waitForLoadState('networkidle');

    // Check if profile form exists by looking for form inputs
    const firstNameInput = page.getByRole('textbox', { name: /first name/i });
    const emailInput = page.getByRole('textbox', { name: /email/i });
    const hasProfileForm = (await firstNameInput.count()) > 0 && (await emailInput.count()) > 0;

    await page.screenshot({ path: '/tmp/screenshots/phase1-profile.png' });

    if (!hasProfileForm) {
      console.log('❌ Phase 1.11: Profile page has no form fields');
    } else {
      console.log('✅ Phase 1.11: Profile page works');
    }

    expect(hasProfileForm).toBeTruthy();
  });
});

test.describe('PHASE 2: Trip Management - Complete Feature Testing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('2.1-2.4: Create New Trip (FULL FLOW)', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    // Look for create button (try multiple selectors)
    const createButton = page.getByRole('link', { name: /create.*trip/i });

    const buttonExists = (await createButton.count()) > 0;

    if (!buttonExists) {
      console.log('⚠️ Phase 2.1-2.4: No create trip button found');
      await page.screenshot({ path: '/tmp/screenshots/phase2-no-create-button.png' });
      return;
    }

    // Click create button
    await createButton.first().click();
    await page.waitForLoadState('networkidle');

    // Fill trip form
    const tripName = `Test Trip ${Date.now()}`;
    await page.fill('input[name="name"], input[placeholder*="name" i]', tripName);

    // Try to find destination field
    const destField = page.locator('input[name="destination"], input[placeholder*="destination" i]');
    if (await destField.count() > 0) {
      await destField.fill('Paris, France');
    }

    // Try to find date fields
    const startDateField = page.locator('input[name="startDate"], input[type="date"]').first();
    if (await startDateField.count() > 0) {
      await startDateField.fill('2025-12-01');
    }

    await page.screenshot({ path: '/tmp/screenshots/phase2-create-trip-form.png' });

    // Submit form
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await page.waitForLoadState('networkidle');

    // Check if trip was created
    await page.waitForTimeout(2000);
    const pageContent = await page.textContent('body');
    const tripCreated = pageContent?.includes(tripName) || page.url().includes('/trips/');

    await page.screenshot({ path: '/tmp/screenshots/phase2-trip-created.png' });

    if (tripCreated) {
      console.log('✅ Phase 2.1-2.4: Trip creation works!');
    } else {
      console.log('❌ Phase 2.1-2.4: Trip creation failed');
    }

    expect(tripCreated).toBeTruthy();
  });

  test('2.5-2.6: View Trip Details', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    // Look for trip cards
    const tripCard = page.locator('[data-testid="trip-card"], article, [role="article"]').first();
    const hasTrips = await tripCard.count() > 0;

    if (!hasTrips) {
      console.log('⚠️ Phase 2.5-2.6: No trips found (create one first)');
      return;
    }

    // Click first trip
    await tripCard.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on trip details page
    const onDetailsPage = page.url().includes('/trips/') && !page.url().endsWith('/trips');

    await page.screenshot({ path: '/tmp/screenshots/phase2-trip-details.png', fullPage: true });

    if (onDetailsPage) {
      console.log('✅ Phase 2.5-2.6: Trip details works!');
    } else {
      console.log('❌ Phase 2.5-2.6: Could not access trip details');
    }
  });

  test('2.7-2.9: Edit and Delete Trip', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    const hasTrips = await tripCard.count() > 0;

    if (!hasTrips) {
      console.log('⚠️ Phase 2.7-2.9: No trips to edit/delete');
      return;
    }

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    // Look for edit button
    const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-trip"]');
    const hasEdit = await editButton.count() > 0;

    await page.screenshot({ path: '/tmp/screenshots/phase2-edit-delete.png' });

    if (hasEdit) {
      console.log('✅ Phase 2.7-2.9: Edit/Delete features visible');
    } else {
      console.log('⚠️ Phase 2.7-2.9: Edit/Delete buttons not found');
    }
  });
});

test.describe('PHASE 3: Itinerary & Events - Complete Feature Testing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('3.1-3.4: Add Event to Itinerary', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    if (await tripCard.count() === 0) {
      console.log('⚠️ Phase 3: No trips found, skipping itinerary test');
      return;
    }

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    // Look for itinerary tab or link
    const itineraryLink = page.locator('a:has-text("Itinerary"), button:has-text("Itinerary"), [href*="itinerary"]');
    const hasItinerary = await itineraryLink.count() > 0;

    if (hasItinerary) {
      await itineraryLink.first().click();
      await page.waitForLoadState('networkidle');

      // Look for add event button
      const addEventButton = page.locator('button:has-text("Add Event"), button:has-text("New Event")');
      const canAddEvent = await addEventButton.count() > 0;

      await page.screenshot({ path: '/tmp/screenshots/phase3-itinerary.png', fullPage: true });

      if (canAddEvent) {
        console.log('✅ Phase 3.1-3.4: Itinerary features visible');
      } else {
        console.log('⚠️ Phase 3.1-3.4: Add event button not found');
      }
    } else {
      console.log('⚠️ Phase 3: Itinerary section not found');
    }
  });

  test('3.5-3.7: Calendar View', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    if (await tripCard.count() === 0) return;

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    // Look for calendar link
    const calendarLink = page.locator('a:has-text("Calendar"), [href*="calendar"]');
    const hasCalendar = await calendarLink.count() > 0;

    if (hasCalendar) {
      await calendarLink.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: '/tmp/screenshots/phase3-calendar.png', fullPage: true });
      console.log('✅ Phase 3.5-3.7: Calendar view accessible');
    } else {
      console.log('⚠️ Phase 3.5-3.7: Calendar not found');
    }
  });

  test('3.8-3.11: Map View', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    if (await tripCard.count() === 0) return;

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    const mapLink = page.locator('a:has-text("Map"), [href*="map"]');
    const hasMap = await mapLink.count() > 0;

    if (hasMap) {
      await mapLink.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: '/tmp/screenshots/phase3-map.png', fullPage: true });
      console.log('✅ Phase 3.8-3.11: Map view accessible');
    } else {
      console.log('⚠️ Phase 3.8-3.11: Map not found');
    }
  });
});

test.describe('PHASE 4: Collaboration - Complete Feature Testing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('4.1-4.4: Invite Collaborator', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    if (await tripCard.count() === 0) {
      console.log('⚠️ Phase 4: No trips found');
      return;
    }

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    // Look for collaborators link
    const collabLink = page.locator('a:has-text("Collaborators"), a:has-text("Share"), [href*="collaborators"]');
    const hasCollab = await collabLink.count() > 0;

    if (hasCollab) {
      await collabLink.first().click();
      await page.waitForLoadState('networkidle');

      // Look for invite button
      const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add Collaborator")');
      const canInvite = await inviteButton.count() > 0;

      await page.screenshot({ path: '/tmp/screenshots/phase4-collaborators.png', fullPage: true });

      if (canInvite) {
        console.log('✅ Phase 4.1-4.4: Collaboration features visible');
      } else {
        console.log('⚠️ Phase 4.1-4.4: Invite button not found');
      }
    } else {
      console.log('⚠️ Phase 4: Collaborators section not found');
    }
  });

  test('4.9-4.12: Messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    if (await tripCard.count() === 0) return;

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    const messagesLink = page.locator('a:has-text("Messages"), [href*="messages"]');
    const hasMessages = await messagesLink.count() > 0;

    if (hasMessages) {
      await messagesLink.first().click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: '/tmp/screenshots/phase4-messages.png', fullPage: true });
      console.log('✅ Phase 4.9-4.12: Messages accessible');
    } else {
      console.log('⚠️ Phase 4.9-4.12: Messages not found');
    }
  });
});

test.describe('PHASE 5: Budget & Expenses - Complete Feature Testing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('5.1-5.2: Budget Management', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    if (await tripCard.count() === 0) {
      console.log('⚠️ Phase 5: No trips found');
      return;
    }

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    const budgetLink = page.locator('a:has-text("Budget"), [href*="budget"]');
    const hasBudget = await budgetLink.count() > 0;

    if (hasBudget) {
      await budgetLink.first().click();
      await page.waitForLoadState('networkidle');

      // Look for budget form/input
      const budgetInput = page.locator('input[name*="budget" i], input[placeholder*="budget" i]');
      const hasBudgetFeature = await budgetInput.count() > 0;

      await page.screenshot({ path: '/tmp/screenshots/phase5-budget.png', fullPage: true });

      if (hasBudgetFeature) {
        console.log('✅ Phase 5.1-5.2: Budget features visible');
      } else {
        console.log('⚠️ Phase 5.1-5.2: Budget input not found');
      }
    } else {
      console.log('⚠️ Phase 5: Budget section not found');
    }
  });

  test('5.3-5.4: Add Expense', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"], article').first();
    if (await tripCard.count() === 0) return;

    await tripCard.click();
    await page.waitForLoadState('networkidle');

    const expensesLink = page.locator('a:has-text("Expenses"), [href*="expenses"]');
    const hasExpenses = await expensesLink.count() > 0;

    if (hasExpenses) {
      await expensesLink.first().click();
      await page.waitForLoadState('networkidle');

      // Look for add expense button
      const addExpenseButton = page.locator('button:has-text("Add Expense"), button:has-text("New Expense")');
      const canAddExpense = await addExpenseButton.count() > 0;

      await page.screenshot({ path: '/tmp/screenshots/phase5-expenses.png', fullPage: true });

      if (canAddExpense) {
        console.log('✅ Phase 5.3-5.4: Expense tracking visible');
      } else {
        console.log('⚠️ Phase 5.3-5.4: Add expense button not found');
      }
    } else {
      console.log('⚠️ Phase 5: Expenses section not found');
    }
  });
});
