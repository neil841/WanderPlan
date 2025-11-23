# End-to-End (E2E) Tests

This directory contains comprehensive end-to-end tests for the WanderPlan application using Playwright.

## Test Structure

```
e2e/
├── auth.spec.ts                    # Authentication flow tests
├── trip-management.spec.ts         # Trip CRUD operations
├── itinerary-building.spec.ts      # Event creation and reordering
├── collaboration.spec.ts           # Collaborators, messaging, polls
├── budget-management.spec.ts       # Budget and expense tracking
├── export-features.spec.ts         # PDF export and calendar sync
├── global-setup.ts                 # Global test setup
├── global-teardown.ts              # Global test cleanup
└── utils/                          # Test utilities
    ├── auth.ts                     # Authentication helpers
    ├── trips.ts                    # Trip management helpers
    └── events.ts                   # Event management helpers
```

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Set up test environment:**
   - Make sure your PostgreSQL database is running
   - Create a `.env.test.local` file with test credentials
   - Run database migrations: `npm run db:migrate`

### Run All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Or with Playwright directly
npx playwright test
```

### Run Specific Test Files

```bash
# Run only authentication tests
npx playwright test auth.spec.ts

# Run only trip management tests
npx playwright test trip-management.spec.ts

# Run only itinerary tests
npx playwright test itinerary-building.spec.ts
```

### Run Tests in Different Browsers

```bash
# Run in Chrome only
npx playwright test --project=chromium

# Run in Firefox only
npx playwright test --project=firefox

# Run in Safari only
npx playwright test --project=webkit

# Run on mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Run Tests in UI Mode (Interactive)

```bash
# Open Playwright Test UI
npx playwright test --ui
```

### Run Tests in Debug Mode

```bash
# Debug a specific test
npx playwright test auth.spec.ts --debug

# Debug with headed browser
npx playwright test --headed
```

### Run Tests in Watch Mode

```bash
# Watch mode (re-run on file changes)
npx playwright test --watch
```

## Test Reports

### HTML Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

The report includes:
- Test results (pass/fail)
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging

### JSON Report

Test results are also saved to `test-results/e2e-results.json` for CI/CD integration.

## Writing Tests

### Test Utilities

Use the helper utilities in `e2e/utils/` to keep tests DRY:

```typescript
import { generateTestUser, registerUser, login } from './utils/auth';
import { generateTestTrip, createTrip } from './utils/trips';
import { generateTestEvent, addEvent } from './utils/events';

test('should create a trip', async ({ page }) => {
  const user = generateTestUser();
  await registerUser(page, user);

  const trip = generateTestTrip();
  await createTrip(page, trip);

  await expect(page.locator(`text=${trip.title}`)).toBeVisible();
});
```

### Best Practices

1. **Unique Test Data:** Always generate unique test data using timestamps
   ```typescript
   const user = generateTestUser(); // Creates unique email/name
   ```

2. **Test Isolation:** Each test should be independent
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Set up fresh state for each test
     const user = generateTestUser();
     await registerUser(page, user);
   });
   ```

3. **Data Test IDs:** Use `data-testid` attributes for reliable selectors
   ```typescript
   // In component
   <button data-testid="create-trip-button">Create Trip</button>

   // In test
   await page.click('[data-testid="create-trip-button"]');
   ```

4. **Wait for Elements:** Always wait for elements before interacting
   ```typescript
   await page.waitForSelector('[role="dialog"]', { state: 'visible' });
   ```

5. **Handle Async Operations:** Use proper timeouts for API calls
   ```typescript
   await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });
   ```

## Test Coverage

The E2E test suite covers the following critical user journeys:

### 1. Authentication Flow ✅
- User registration
- Login/logout
- Email verification
- Password reset
- Session persistence

### 2. Trip Management ✅
- Create trip
- View trip list
- View trip details
- Edit trip
- Delete trip
- Search and filter trips

### 3. Itinerary Building ✅
- Add events (all 6 types)
- Edit events
- Delete events
- Reorder events (drag-and-drop)
- Keyboard navigation
- Mobile touch gestures

### 4. Collaboration ✅
- Invite collaborators
- Accept invitations
- Change roles
- Remove collaborators
- Send messages
- Create ideas and vote
- Create polls and vote

### 5. Budget Management ✅
- Set budget
- Add expenses
- Edit/delete expenses
- Upload receipts
- Split expenses
- View settlements
- Filter expenses

### 6. Export Features ✅
- Export PDF
- Configure PDF options
- Email PDF
- Sync to Google Calendar
- OAuth flow

## CI/CD Integration

The E2E tests are designed to run in CI/CD pipelines:

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### 1. Screenshots
Failed tests automatically capture screenshots. Find them in:
```
test-results/
  auth-spec-ts-authentication-flow-user-registration-chromium/
    test-failed-1.png
```

### 2. Videos
Video recordings are saved for failed tests:
```
test-results/
  auth-spec-ts-authentication-flow-user-registration-chromium/
    video.webm
```

### 3. Trace Viewer
View detailed traces of test execution:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### 4. Debug Mode
Run tests in debug mode with Playwright Inspector:
```bash
npx playwright test auth.spec.ts --debug
```

## Performance

### Test Execution Time

Average test execution times (per browser):

- **Authentication tests**: ~2-3 minutes
- **Trip management tests**: ~3-4 minutes
- **Itinerary building tests**: ~4-5 minutes
- **Collaboration tests**: ~5-6 minutes
- **Budget management tests**: ~4-5 minutes
- **Export features tests**: ~3-4 minutes

**Total E2E test suite**: ~20-25 minutes (all browsers)

### Optimization Tips

1. **Run tests in parallel:**
   ```bash
   npx playwright test --workers=4
   ```

2. **Run specific tests during development:**
   ```bash
   npx playwright test auth.spec.ts
   ```

3. **Use headed mode only when debugging:**
   ```bash
   npx playwright test --headed
   ```

## Troubleshooting

### Common Issues

**Issue: "Connection refused"**
- Make sure the development server is running: `npm run dev`
- Check the `baseURL` in `playwright.config.ts`

**Issue: "Element not found"**
- Increase timeout: `await page.waitForSelector(selector, { timeout: 10000 })`
- Check data-testid attributes match

**Issue: "Tests are flaky"**
- Use proper wait strategies instead of `waitForTimeout`
- Ensure test data is unique (use timestamps)
- Check for race conditions in async operations

**Issue: "Browser download failed"**
- Run: `npx playwright install --force`

## Contributing

When adding new features to WanderPlan:

1. **Add E2E tests** for critical user flows
2. **Use test utilities** to keep tests DRY
3. **Follow naming conventions**: `feature-name.spec.ts`
4. **Add data-testid** attributes to key UI elements
5. **Update this README** with new test coverage

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
