/**
 * Global Teardown for E2E Tests
 * Runs after all tests to clean up the test environment
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...');

  // Cleanup tasks can go here
  // For example: cleaning up test data, closing connections, etc.

  console.log('✅ Global teardown complete!');
}

export default globalTeardown;
