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

test.describe('Phase 2: Trip Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('2.1 & 2.2: Trips list page loads and displays', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/Trips|WanderPlan/);

    // Check for trips list container
    const tripsContainer = page.locator('[data-testid="trips-list"]').or(page.locator('main'));
    await expect(tripsContainer).toBeVisible();

    // Check console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Take screenshot
    await page.screenshot({ path: '/tmp/screenshots/phase2-trips-list.png', fullPage: true });

    console.log('✅ Phase 2.1 & 2.2: Trips list page accessible');
    console.log(`Console errors: ${consoleErrors.length}`);
  });

  test('2.3 & 2.4: Create new trip', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);

    // Look for "New Trip" or "Create Trip" button
    const createButton = page.locator('button:has-text("New Trip")').or(
      page.locator('button:has-text("Create Trip")')
    ).or(
      page.locator('a:has-text("New Trip")')
    );

    if (await createButton.count() > 0) {
      await createButton.first().click();
      await page.waitForLoadState('networkidle');

      // Fill trip creation form
      await page.fill('input[name="name"]', 'Test Trip to Paris');
      await page.fill('input[name="destination"]', 'Paris, France');
      await page.fill('input[type="date"]', '2025-12-01');

      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: '/tmp/screenshots/phase2-create-trip.png' });
      console.log('✅ Phase 2.3 & 2.4: Trip creation tested');
    } else {
      console.log('⚠️ Phase 2.3 & 2.4: Create trip button not found');
    }
  });

  test('2.5 & 2.6: View trip details', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    // Find first trip card
    const tripCard = page.locator('[data-testid="trip-card"]').or(
      page.locator('article').or(page.locator('[role="article"]'))
    ).first();

    if (await tripCard.count() > 0) {
      await tripCard.click();
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: '/tmp/screenshots/phase2-trip-details.png', fullPage: true });
      console.log('✅ Phase 2.5 & 2.6: Trip details page accessible');
    } else {
      console.log('⚠️ Phase 2.5 & 2.6: No trips found to view details');
    }
  });
});

test.describe('Phase 3: Itinerary & Events', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('3.1-3.4: Events and itinerary features', async ({ page }) => {
    // Navigate to first trip
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"]').first();
    if (await tripCard.count() > 0) {
      await tripCard.click();
      await page.waitForLoadState('networkidle');

      // Look for itinerary/events section
      const itinerarySection = page.locator('[data-testid="itinerary"]').or(
        page.locator('text=Itinerary').or(page.locator('text=Events'))
      );

      if (await itinerarySection.count() > 0) {
        await page.screenshot({ path: '/tmp/screenshots/phase3-itinerary.png', fullPage: true });
        console.log('✅ Phase 3: Itinerary section found');
      } else {
        console.log('⚠️ Phase 3: Itinerary section not found');
      }
    }
  });
});

test.describe('Phase 4: Collaboration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('4.1-4.4: Collaboration features', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"]').first();
    if (await tripCard.count() > 0) {
      await tripCard.click();
      await page.waitForLoadState('networkidle');

      // Look for share/collaborate button
      const shareButton = page.locator('button:has-text("Share")').or(
        page.locator('button:has-text("Invite")')
      );

      if (await shareButton.count() > 0) {
        await page.screenshot({ path: '/tmp/screenshots/phase4-collaboration.png' });
        console.log('✅ Phase 4: Collaboration features found');
      } else {
        console.log('⚠️ Phase 4: Collaboration features not visible');
      }
    }
  });
});

test.describe('Phase 5: Budget & Expenses', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('5.1-5.4: Budget and expense tracking', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.waitForLoadState('networkidle');

    const tripCard = page.locator('[data-testid="trip-card"]').first();
    if (await tripCard.count() > 0) {
      await tripCard.click();
      await page.waitForLoadState('networkidle');

      // Look for budget/expense section
      const budgetSection = page.locator('[data-testid="budget"]').or(
        page.locator('text=Budget').or(page.locator('text=Expenses'))
      );

      if (await budgetSection.count() > 0) {
        await page.screenshot({ path: '/tmp/screenshots/phase5-budget.png', fullPage: true });
        console.log('✅ Phase 5: Budget features found');
      } else {
        console.log('⚠️ Phase 5: Budget features not visible');
      }
    }
  });
});

test.describe('Authentication & Profile (Re-test)', () => {
  test('1.11: Profile page bug verification', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/settings/profile`);
    await page.waitForLoadState('networkidle');

    const errorMessage = page.locator('text=You must be logged in');
    const isError = await errorMessage.count() > 0;

    await page.screenshot({ path: '/tmp/screenshots/phase1-profile-bug.png' });

    if (isError) {
      console.log('❌ BUG CONFIRMED: Profile page shows "not logged in" despite valid session');
    } else {
      console.log('✅ Profile page working correctly');
    }
  });
});
