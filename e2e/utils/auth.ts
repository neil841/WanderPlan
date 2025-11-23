/**
 * Authentication utilities for E2E tests
 * Provides helper functions for login, registration, and session management
 */

import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Generate a unique test user for each test run
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `test-user-${timestamp}@example.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: `User${timestamp}`,
  };
}

/**
 * Register a new user via the UI
 */
export async function registerUser(
  page: Page,
  user: TestUser
): Promise<void> {
  await page.goto('/register');

  // Wait for registration form
  await page.waitForSelector('form', { state: 'visible' });

  // Fill registration form
  await page.fill('input[name="firstName"]', user.firstName);
  await page.fill('input[name="lastName"]', user.lastName);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for success message or redirect
  await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 10000 });
}

/**
 * Login as an existing user
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');

  // Wait for login form
  await page.waitForSelector('form', { state: 'visible' });

  // Fill login form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Verify we're logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.click('[data-testid="user-menu"]');

  // Click logout button
  await page.click('text=Logout');

  // Wait for redirect to login
  await page.waitForURL('/login', { timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/dashboard');
    await page.waitForURL('/dashboard', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
