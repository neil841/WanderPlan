/**
 * Global Setup for E2E Tests
 * Runs before all tests to prepare the test environment
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  console.log('🚀 Starting global E2E test setup...');

  // Launch browser to check if app is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for app to be ready
    console.log(`⏳ Waiting for app to be ready at ${baseURL}...`);
    await page.goto(baseURL || 'http://localhost:3000', { timeout: 60000 });

    // Verify app is loaded
    const title = await page.title();
    console.log(`✅ App is ready! Page title: ${title}`);

    // Additional setup can go here
    // For example: seeding database, clearing cache, etc.

  } catch (error) {
    console.error('❌ Failed to connect to the application:', error);
    console.error('Make sure the development server is running: npm run dev');
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup complete!');
}

export default globalSetup;
