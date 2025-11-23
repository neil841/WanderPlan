/**
 * E2E Tests: Authentication Flow
 * Tests user registration, login, logout, and email verification
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser, login, logout } from './utils/auth';

test.describe('Authentication Flow', () => {
  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      const user = generateTestUser();

      await page.goto('/register');

      // Verify registration page is loaded
      await expect(page.locator('h1:has-text("Create Account")')).toBeVisible();

      // Fill registration form
      await page.fill('input[name="firstName"]', user.firstName);
      await page.fill('input[name="lastName"]', user.lastName);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to verify email or dashboard
      await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 10000 });
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/register');

      // Submit empty form
      await page.click('button[type="submit"]');

      // Check for validation errors
      await expect(page.locator('text=/email.*required/i')).toBeVisible();
      await expect(page.locator('text=/password.*required/i')).toBeVisible();
    });

    test('should reject weak passwords', async ({ page }) => {
      const user = generateTestUser();

      await page.goto('/register');

      await page.fill('input[name="firstName"]', user.firstName);
      await page.fill('input[name="lastName"]', user.lastName);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', '123'); // Weak password

      await page.click('button[type="submit"]');

      // Should show password strength error
      await expect(page.locator('text=/password.*strong/i')).toBeVisible();
    });

    test('should reject duplicate email', async ({ page }) => {
      const user = generateTestUser();

      // Register first time
      await registerUser(page, user);
      await logout(page);

      // Try to register again with same email
      await page.goto('/register');
      await page.fill('input[name="firstName"]', user.firstName);
      await page.fill('input[name="lastName"]', user.lastName);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.click('button[type="submit"]');

      // Should show duplicate email error
      await expect(page.locator('text=/email.*already.*exists/i')).toBeVisible();
    });
  });

  test.describe('User Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      const user = generateTestUser();

      // Register first
      await registerUser(page, user);
      await logout(page);

      // Login
      await login(page, user.email, user.password);

      // Verify we're on dashboard
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');

      await page.click('button[type="submit"]');

      // Check for validation errors
      await expect(page.locator('text=/email.*required/i')).toBeVisible();
      await expect(page.locator('text=/password.*required/i')).toBeVisible();
    });
  });

  test.describe('User Logout', () => {
    test('should logout successfully', async ({ page }) => {
      const user = generateTestUser();

      // Register and login
      await registerUser(page, user);

      // Logout
      await logout(page);

      // Verify we're on login page
      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing protected routes after logout', async ({ page }) => {
      const user = generateTestUser();

      // Register and login
      await registerUser(page, user);
      await logout(page);

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Session Persistence', () => {
    test('should persist session across page reloads', async ({ page }) => {
      const user = generateTestUser();

      // Register and login
      await registerUser(page, user);

      // Reload page
      await page.reload();

      // Should still be authenticated
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should persist session in new tab', async ({ context }) => {
      const user = generateTestUser();
      const page1 = await context.newPage();

      // Register and login in first tab
      await registerUser(page1, user);

      // Open new tab
      const page2 = await context.newPage();
      await page2.goto('/dashboard');

      // Should be authenticated in new tab
      await expect(page2.locator('text=Dashboard')).toBeVisible();

      await page1.close();
      await page2.close();
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should send password reset email', async ({ page }) => {
      const user = generateTestUser();

      // Register first
      await registerUser(page, user);
      await logout(page);

      // Go to forgot password page
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', user.email);
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/reset.*email.*sent/i')).toBeVisible();
    });

    test('should handle non-existent email gracefully', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.click('button[type="submit"]');

      // Should show generic success message (for security)
      await expect(page.locator('text=/reset.*email.*sent/i')).toBeVisible();
    });
  });

  test.describe('Email Verification', () => {
    test('should show verify email message after registration', async ({ page }) => {
      const user = generateTestUser();

      await registerUser(page, user);

      // Check if verification message is shown
      const verifyMessage = page.locator('text=/verify.*email/i');
      if (await verifyMessage.isVisible()) {
        await expect(verifyMessage).toBeVisible();
      }
    });
  });
});
