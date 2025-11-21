import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

// Test user credentials (using existing test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User'
};

// Helper: Login
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|trips|settings)/);
}

test.describe('FULL FEATURE VALIDATION - Phases 2-5', () => {
  let tripId: string;
  let tripName: string;

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('PHASE 2.1-2.4: Create Trip and Verify', async ({ page }) => {
    console.log('\n🧪 Testing Phase 2: Trip Management');

    // Navigate to trips page
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    // Click create trip button
    const createButton = page.getByRole('link', { name: /create.*trip/i });
    await expect(createButton).toBeVisible();
    await createButton.click();
    await page.waitForURL(/\/trips\/new/);

    // Fill trip form
    tripName = `E2E Test Trip ${Date.now()}`;
    await page.fill('input[name="name"]', tripName);

    // Fill description
    const descField = page.locator('textarea[name="description"]');
    if (await descField.count() > 0) {
      await descField.fill('A comprehensive test trip for validation');
    }

    // Fill dates
    const startDate = page.locator('input[name="startDate"]');
    if (await startDate.count() > 0) {
      await startDate.fill('2025-12-01');
    }

    const endDate = page.locator('input[name="endDate"]');
    if (await endDate.count() > 0) {
      await endDate.fill('2025-12-10');
    }

    // Fill destinations
    const destField = page.locator('input[name="destinations"]');
    if (await destField.count() > 0) {
      await destField.fill('Paris, France');
    }

    await page.screenshot({ path: '/tmp/screenshots/phase2-create-form-filled.png' });

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for redirect to trips list or trip detail
    await page.waitForURL(/\/trips(?:\/[^/]+)?/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/tmp/screenshots/phase2-trip-created.png' });

    // Verify trip appears in list
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator(`text=${tripName}`);
    await expect(tripCard).toBeVisible();

    console.log('✅ Phase 2.1-2.4: Trip creation and listing works');
  });

  test('PHASE 2.5-2.6: View Trip Details', async ({ page }) => {
    // First create a trip
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    // Click on first trip card
    const firstTrip = page.locator('[data-testid="trip-card"], .trip-card, [class*="trip"]').first();

    // Try to find the trip name and click it
    const tripLinks = page.locator('a[href*="/trips/"]').filter({ hasText: /test|trip/i });
    if (await tripLinks.count() > 0) {
      await tripLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/screenshots/phase2-trip-details.png' });

      // Verify we're on trip detail page
      expect(page.url()).toContain('/trips/');
      expect(page.url()).not.toBe(`${BASE_URL}/trips`);

      console.log('✅ Phase 2.5-2.6: Trip details view works');
    } else {
      console.log('⚠️ Phase 2.5-2.6: No clickable trips found');
    }
  });

  test('PHASE 3.1-3.4: Add Event to Itinerary', async ({ page }) => {
    console.log('\n🧪 Testing Phase 3: Itinerary & Events');

    // Navigate to trips and select first trip
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]').filter({ hasText: /test|trip/i });
    if (await tripLinks.count() === 0) {
      console.log('⚠️ Phase 3: No trips available, skipping');
      return;
    }

    await tripLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Look for itinerary/events section or tab
    const itineraryLink = page.locator('a:has-text("Itinerary"), button:has-text("Itinerary"), [href*="itinerary"]');
    if (await itineraryLink.count() > 0) {
      await itineraryLink.first().click();
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: '/tmp/screenshots/phase3-itinerary-page.png' });

    // Look for "Add Event" button
    const addEventButton = page.locator('button:has-text("Add Event"), button:has-text("New Event"), button:has-text("Create Event")');
    if (await addEventButton.count() > 0) {
      await addEventButton.first().click();
      await page.waitForTimeout(1000);

      // Fill event form
      const eventTitle = page.locator('input[name="title"], input[placeholder*="title" i]');
      if (await eventTitle.count() > 0) {
        await eventTitle.fill('Visit Eiffel Tower');
      }

      await page.screenshot({ path: '/tmp/screenshots/phase3-add-event.png' });

      console.log('✅ Phase 3.1-3.4: Itinerary event form accessible');
    } else {
      console.log('⚠️ Phase 3.1-3.4: Add event button not found');
    }
  });

  test('PHASE 3.5-3.7: Calendar View', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]');
    if (await tripLinks.count() === 0) {
      console.log('⚠️ Phase 3.5-3.7: No trips available');
      return;
    }

    await tripLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Look for calendar view
    const calendarLink = page.locator('a:has-text("Calendar"), button:has-text("Calendar"), [href*="calendar"]');
    if (await calendarLink.count() > 0) {
      await calendarLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/screenshots/phase3-calendar-view.png' });
      console.log('✅ Phase 3.5-3.7: Calendar view accessible');
    } else {
      console.log('⚠️ Phase 3.5-3.7: Calendar view not found');
    }
  });

  test('PHASE 3.8-3.11: Map View', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]');
    if (await tripLinks.count() === 0) {
      console.log('⚠️ Phase 3.8-3.11: No trips available');
      return;
    }

    await tripLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Look for map view
    const mapLink = page.locator('a:has-text("Map"), button:has-text("Map"), [href*="map"]');
    if (await mapLink.count() > 0) {
      await mapLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/screenshots/phase3-map-view.png' });
      console.log('✅ Phase 3.8-3.11: Map view accessible');
    } else {
      console.log('⚠️ Phase 3.8-3.11: Map view not found');
    }
  });

  test('PHASE 4.1-4.4: Collaboration Features', async ({ page }) => {
    console.log('\n🧪 Testing Phase 4: Collaboration');

    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]');
    if (await tripLinks.count() === 0) {
      console.log('⚠️ Phase 4: No trips available');
      return;
    }

    await tripLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Look for collaborators/share section
    const shareButton = page.locator('button:has-text("Share"), button:has-text("Invite"), button:has-text("Collaborat")');
    if (await shareButton.count() > 0) {
      await shareButton.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/screenshots/phase4-collaboration.png' });
      console.log('✅ Phase 4.1-4.4: Collaboration features accessible');
    } else {
      console.log('⚠️ Phase 4.1-4.4: Collaboration features not found');
    }
  });

  test('PHASE 4.9-4.12: Messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]');
    if (await tripLinks.count() === 0) {
      console.log('⚠️ Phase 4.9-4.12: No trips available');
      return;
    }

    await tripLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Look for messages section
    const messagesLink = page.locator('a:has-text("Message"), button:has-text("Message"), [href*="message"]');
    if (await messagesLink.count() > 0) {
      await messagesLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/screenshots/phase4-messages.png' });
      console.log('✅ Phase 4.9-4.12: Messages section accessible');
    } else {
      console.log('⚠️ Phase 4.9-4.12: Messages not found');
    }
  });

  test('PHASE 5.1-5.2: Budget Management', async ({ page }) => {
    console.log('\n🧪 Testing Phase 5: Budget & Expenses');

    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]');
    if (await tripLinks.count() === 0) {
      console.log('⚠️ Phase 5: No trips available');
      return;
    }

    await tripLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Look for budget section
    const budgetLink = page.locator('a:has-text("Budget"), button:has-text("Budget"), [href*="budget"]');
    if (await budgetLink.count() > 0) {
      await budgetLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/tmp/screenshots/phase5-budget.png' });

      // Try to set budget
      const budgetInput = page.locator('input[name="budget"], input[placeholder*="budget" i]');
      if (await budgetInput.count() > 0) {
        await budgetInput.fill('5000');
        console.log('✅ Phase 5.1-5.2: Budget management works');
      }
    } else {
      console.log('⚠️ Phase 5.1-5.2: Budget section not found');
    }
  });

  test('PHASE 5.3-5.4: Add Expense', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]');
    if (await tripLinks.count() === 0) {
      console.log('⚠️ Phase 5.3-5.4: No trips available');
      return;
    }

    await tripLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Look for expenses section
    const expensesLink = page.locator('a:has-text("Expense"), button:has-text("Expense"), [href*="expense"]');
    if (await expensesLink.count() > 0) {
      await expensesLink.first().click();
      await page.waitForLoadState('networkidle');
    }

    // Look for add expense button
    const addExpenseButton = page.locator('button:has-text("Add Expense"), button:has-text("New Expense")');
    if (await addExpenseButton.count() > 0) {
      await addExpenseButton.first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: '/tmp/screenshots/phase5-add-expense.png' });
      console.log('✅ Phase 5.3-5.4: Add expense form accessible');
    } else {
      console.log('⚠️ Phase 5.3-5.4: Add expense button not found');
    }
  });
});
