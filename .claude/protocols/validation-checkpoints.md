# Validation Checkpoint Protocol

This protocol defines mandatory validation checkpoints throughout the agentic development workflow to ensure fault-tolerance and quality.

## Core Principle

**Every UI change MUST be validated with Chrome DevTools MCP before proceeding to the next task.**

**Every 5-6 tasks MUST trigger a comprehensive validation checkpoint with automated testing.**

---

## Validation Checkpoint Types

### Type 1: UI Validation Checkpoint (After EVERY UI Task)

**Triggers After:**
- Any Premium UX Designer task
- Any task that modifies UI components
- Any task that changes layouts, forms, or user-facing elements

**Required Steps:**
1. Start local dev server: `npm run dev`
2. Navigate to `http://localhost:3000` with Chrome DevTools MCP
3. Test on ALL three viewports:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
4. For EACH viewport:
   - Take snapshot (`mcp__chrome-devtools__take_snapshot`)
   - Take screenshot (`mcp__chrome-devtools__take_screenshot`)
   - Check console errors (`mcp__chrome-devtools__list_console_messages`)
   - Verify responsive behavior
5. Test user interactions:
   - Click buttons
   - Fill forms
   - Navigate between pages
   - Test authentication flows
6. Verify accessibility:
   - Keyboard navigation works
   - Screen reader compatibility
   - Proper ARIA labels
   - Color contrast ratios
7. Check performance:
   - Run performance trace
   - Verify Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
8. Fix any issues found
9. Re-test until all checks pass
10. Document results in validation report

**Failure Response:**
- If validation fails, DO NOT proceed to next task
- Create blocker in `blockers.md`
- Fix issues before continuing
- Re-run validation

---

### Type 2: Integration Testing Checkpoint (Every 5-6 Tasks)

**Triggers After:**
- Task 1.6 (Registration UI) → Test auth flow
- Task 1.11 (User Profile) → Test profile + password
- Task 1.12 (Dashboard Layout) → Test navigation + auth
- Every 5-6 tasks in subsequent phases

**Required Steps:**
1. **QA Testing Agent** runs comprehensive tests:
   - Unit tests for APIs
   - Integration tests for user flows
   - E2E tests for critical paths
   - Accessibility tests (axe-core)
   - Performance tests (Lighthouse)

2. **Security Agent** runs security audit:
   - Dependency vulnerability scan
   - OWASP Top 10 checks
   - Authentication security review
   - Input validation verification
   - SQL injection prevention check

3. **Senior Code Reviewer** reviews recent code:
   - Code quality assessment
   - Best practices compliance
   - Security vulnerabilities
   - Performance issues
   - TypeScript strict mode compliance

4. **Accessibility Compliance Agent** validates:
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Color contrast ratios
   - Focus management

**Checkpoint Decision:**
- **PASS**: All agents report no BLOCKER or CRITICAL issues → Continue
- **MINOR/MAJOR**: Log issues, continue but create tasks to fix
- **BLOCKER/CRITICAL**: STOP, fix issues before proceeding

---

### Type 3: Phase Transition Checkpoint (End of Each Phase)

**Triggers After:**
- Phase 0 complete → Before starting Phase 1
- Phase 1 complete → Before starting Phase 2
- Every phase transition

**Required Steps:**
1. **Senior Code Reviewer** reviews entire phase:
   - All files modified in the phase
   - Architecture decisions
   - Code quality across the phase
   - Security review

2. **QA Testing Agent** runs full test suite:
   - All unit tests
   - All integration tests
   - All E2E tests
   - Regression tests

3. **Performance Monitoring Agent**:
   - Full Lighthouse audit
   - Performance budget verification
   - Core Web Vitals check
   - Bundle size analysis

4. **Accessibility Compliance Agent**:
   - Full WCAG audit
   - Automated accessibility testing
   - Manual accessibility review

5. **Security Agent**:
   - Full security audit
   - Dependency scan
   - Authentication/authorization review
   - OWASP compliance check

6. **Technical Documentation Agent**:
   - Update README
   - Update API documentation
   - Update architecture docs

7. **Git Workflow Agent**:
   - Create phase completion commit
   - Tag phase release
   - Create pull request (if using git flow)

**Phase Transition Decision:**
- **PASS**: All agents report PASS → Mark phase complete, start next phase
- **ISSUES FOUND**: Fix critical issues, re-run checkpoint
- **USER APPROVAL REQUIRED**: Present phase completion summary to user

---

## Validation Checkpoint Schedule

### Phase 1: Foundation & Authentication

| After Task | Checkpoint Type | Agents Involved | Estimated Time |
|------------|----------------|-----------------|----------------|
| 1.3 (shadcn setup) | UI Validation | Chrome DevTools | 10 min |
| 1.6 (Registration UI) | Integration Testing | QA, Security, Accessibility | 30 min |
| 1.8 (Login UI) | UI Validation | Chrome DevTools | 10 min |
| 1.11 (User Profile) | Integration Testing | QA, Security, Code Review | 30 min |
| 1.12 (Dashboard Layout) | UI Validation + Integration | Chrome DevTools, All agents | 45 min |
| **Phase 1 Complete** | **Phase Transition** | **All validation agents** | **60 min** |

### Phase 2: Trip Management Core

| After Task | Checkpoint Type | Agents Involved | Estimated Time |
|------------|----------------|-----------------|----------------|
| 2.2 (Trip List UI) | UI Validation | Chrome DevTools | 10 min |
| 2.4 (Trip Create UI) | UI Validation | Chrome DevTools | 10 min |
| 2.6 (Trip Detail UI) | Integration Testing | QA, Security, Code Review | 30 min |
| 2.10 (Budget UI) | UI Validation | Chrome DevTools | 10 min |
| 2.13 (Tags UI) | Integration Testing | QA, Accessibility | 30 min |
| **Phase 2 Complete** | **Phase Transition** | **All validation agents** | **60 min** |

---

## Chrome DevTools Testing Protocol

### Mandatory Chrome DevTools Checks (Every UI Task)

**Step 1: Start Local Server**
```bash
npm run dev
# Wait for server to start on http://localhost:3000
```

**Step 2: Navigate and Setup**
```bash
# List open pages
mcp__chrome-devtools__list_pages

# Navigate to localhost
mcp__chrome-devtools__navigate_page --url="http://localhost:3000"
```

**Step 3: Desktop Testing (1920x1080)**
```bash
# Resize to desktop
mcp__chrome-devtools__resize_page --width=1920 --height=1080

# Capture page structure
mcp__chrome-devtools__take_snapshot

# Visual verification
mcp__chrome-devtools__take_screenshot

# Check console
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]

# Verify:
# - Layout is correct
# - No horizontal scroll
# - Navigation works
# - Buttons are clickable
# - Forms are accessible
```

**Step 4: Tablet Testing (768x1024)**
```bash
# Resize to tablet
mcp__chrome-devtools__resize_page --width=768 --height=1024

# Screenshot for responsive check
mcp__chrome-devtools__take_screenshot

# Console check
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]

# Verify:
# - Layout adapts properly
# - No element overlap
# - Buttons are tappable (min 44x44px)
# - Text is readable
```

**Step 5: Mobile Testing (375x667 - iPhone SE)**
```bash
# Resize to mobile
mcp__chrome-devtools__resize_page --width=375 --height=667

# Screenshot
mcp__chrome-devtools__take_screenshot

# Console check
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]

# Verify:
# - No horizontal scroll
# - Text min 16px
# - Buttons min 44x44px touch targets
# - Mobile menu works
# - Forms are accessible with mobile keyboard
```

**Step 6: Interaction Testing**
```bash
# Get element UIDs from snapshot
mcp__chrome-devtools__take_snapshot

# Test button clicks
mcp__chrome-devtools__click --uid="<button-uid>"

# Test form fills
mcp__chrome-devtools__fill --uid="<input-uid>" --value="test"

# Test navigation
mcp__chrome-devtools__click --uid="<nav-link-uid>"

# Verify expected behavior
```

**Step 7: Performance Testing**
```bash
# Start performance trace
mcp__chrome-devtools__performance_start_trace --reload=true --autoStop=true

# After trace completes, analyze
mcp__chrome-devtools__performance_analyze_insight --insightSetId="<id>" --insightName="LCPBreakdown"

# Verify Core Web Vitals:
# - LCP < 2.5s
# - FID < 100ms
# - CLS < 0.1
```

**Step 8: Network Monitoring**
```bash
# Check network requests
mcp__chrome-devtools__list_network_requests

# Look for:
# - Failed requests (404, 500)
# - Slow requests (>1s)
# - Large assets (>500KB)
# - CORS errors
```

---

## Automated Testing Protocol

### QA Testing Agent Workflow

**When Triggered:**
- After every 5-6 tasks
- Before phase transitions
- When user requests testing

**Test Types:**
1. **Unit Tests** (Jest)
   - Test all API endpoints
   - Test utility functions
   - Test validation schemas
   - Test auth helpers

2. **Integration Tests**
   - Test user registration flow
   - Test login flow
   - Test profile update flow
   - Test password reset flow

3. **E2E Tests** (Playwright)
   - Test complete user journeys
   - Test authentication flows
   - Test CRUD operations
   - Test error handling

4. **Accessibility Tests** (axe-core)
   - Automated WCAG checks
   - Keyboard navigation
   - Screen reader compatibility

**Output:**
- Test results report in `.claude/reports/test-results.md`
- Coverage report
- Failed tests with details
- Performance metrics

---

### Security Agent Workflow

**When Triggered:**
- After auth-related tasks
- After API changes
- Before phase transitions
- Every 5-6 tasks

**Security Checks:**
1. **Dependency Scan**
   ```bash
   npm audit
   npm outdated
   ```

2. **OWASP Top 10 Checks**
   - SQL Injection prevention (Prisma ORM)
   - XSS prevention (React escaping)
   - CSRF protection (NextAuth)
   - Authentication security
   - Authorization checks
   - Sensitive data exposure

3. **Code Security Review**
   - Password hashing (bcrypt rounds)
   - API key protection (.env)
   - Input validation (Zod schemas)
   - Rate limiting
   - Session management

**Output:**
- Security report in `.claude/reports/security-report.md`
- Vulnerability list with severity
- Recommendations for fixes

---

### Senior Code Reviewer Workflow

**When Triggered:**
- After every 5-6 tasks
- Before phase transitions
- After complex features

**Review Criteria:**
1. **Code Quality**
   - TypeScript strict mode compliance
   - No `any` types
   - Proper error handling
   - DRY principles
   - SOLID principles

2. **Best Practices**
   - React best practices
   - Next.js App Router patterns
   - Database query optimization
   - API endpoint design

3. **Security**
   - Input validation
   - Authentication checks
   - Authorization logic
   - Sensitive data handling

4. **Performance**
   - Efficient queries
   - Proper caching
   - Bundle size optimization
   - Image optimization

**Output:**
- Code review report in `.claude/reports/code-review-phase-X.md`
- Issues categorized by severity:
  - BLOCKER (must fix before proceeding)
  - CRITICAL (fix ASAP)
  - MAJOR (fix in current phase)
  - MINOR (fix when convenient)

---

## Fault-Tolerance Mechanisms

### 1. Automatic Rollback on Critical Failure

```markdown
If validation checkpoint fails with BLOCKER/CRITICAL:
1. Stop all agent execution
2. Create git checkpoint before rollback
3. Revert to last known good state
4. Log failure details in blockers.md
5. Notify orchestrator
6. Wait for user intervention
```

### 2. Retry Logic for Recoverable Errors

```markdown
For recoverable validation failures:
1. Log error details
2. Attempt auto-fix (if possible)
3. Re-run validation
4. Max 3 retry attempts
5. After 3 failures → escalate to blocker
```

### 3. Incremental Validation

```markdown
Instead of validating entire app:
1. Validate only changed components
2. Validate only affected pages
3. Run only relevant tests
4. Saves time while maintaining quality
```

### 4. Parallel Validation

```markdown
Run validation agents in parallel:
1. QA Testing Agent (tests)
2. Security Agent (security scan)
3. Accessibility Agent (a11y checks)
4. Performance Agent (Lighthouse)
All run simultaneously → aggregate results
```

---

## Validation Reporting

### Format: `.claude/reports/validation-checkpoint-X.md`

```markdown
# Validation Checkpoint X - [Task Name]

**Date**: 2025-11-09
**Trigger**: After task-X-Y-task-name
**Type**: UI Validation / Integration Testing / Phase Transition

## Summary

- ✅ PASS / ⚠️ ISSUES FOUND / ❌ FAILED
- **Duration**: 15 minutes
- **Agents Involved**: Chrome DevTools, QA Testing, Security

## Chrome DevTools Testing (UI Tasks Only)

### Desktop (1920x1080)
- ✅ Snapshot captured
- ✅ Screenshot taken
- ✅ Zero console errors
- ✅ Layout correct
- ✅ Navigation functional

### Tablet (768x1024)
- ✅ Responsive layout verified
- ✅ No element overlap
- ✅ Touch targets adequate

### Mobile (375x667)
- ✅ No horizontal scroll
- ✅ Text readable (16px+)
- ✅ Buttons tappable (44x44px+)
- ✅ Mobile menu works

### Performance
- ✅ LCP: 1.8s (target < 2.5s)
- ✅ FID: 45ms (target < 100ms)
- ✅ CLS: 0.05 (target < 0.1)

## QA Testing (Integration Checkpoints Only)

### Unit Tests
- ✅ 45/45 tests passed
- ✅ Code coverage: 87%

### Integration Tests
- ✅ Registration flow: PASS
- ✅ Login flow: PASS
- ⚠️ Password reset: 1 minor issue

### E2E Tests
- ✅ User journey: PASS
- ✅ CRUD operations: PASS

## Security Audit (Integration Checkpoints Only)

- ✅ No high/critical vulnerabilities
- ✅ Dependencies up to date
- ✅ OWASP Top 10 compliant
- ⚠️ 1 medium severity issue (rate limiting)

## Accessibility Audit

- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation: PASS
- ✅ Screen reader: PASS
- ✅ Color contrast: PASS

## Issues Found

### Issue 1: Password Reset Email Template
- **Severity**: MINOR
- **Description**: Email template missing logo
- **Impact**: Low - functional but not branded
- **Recommendation**: Add logo in Phase 2

### Issue 2: Rate Limiting Missing
- **Severity**: MEDIUM
- **Description**: No rate limiting on password reset endpoint
- **Impact**: Medium - potential for abuse
- **Recommendation**: Add rate limiting before production

## Actions Taken

1. Logged minor issues in backlog
2. Created task for rate limiting
3. Approved to continue (no blockers)

## Decision

✅ **VALIDATION PASSED** - Approved to proceed to next task

---

**Validated By**: [Agent Names]
**Next Checkpoint**: After task-X-Y+5
```

---

## Implementation in Orchestrator

### Modified Orchestration Flow

```markdown
FOR EACH TASK:
  1. Select appropriate agent
  2. Execute task
  3. **IF task involves UI:**
     - Run Chrome DevTools validation
     - Test desktop, tablet, mobile
     - Check console errors
     - Verify responsiveness
     - Fix any issues
  4. Mark task complete
  5. **IF task count % 5 == 0:**
     - Run Integration Testing Checkpoint
     - Spawn QA Testing Agent
     - Spawn Security Agent
     - Spawn Code Reviewer Agent
     - Aggregate results
     - IF critical issues: STOP and fix
     - ELSE: Log issues and continue
  6. **IF phase complete:**
     - Run Phase Transition Checkpoint
     - All validation agents
     - Full test suite
     - Security audit
     - Performance audit
     - User approval required
  7. Continue to next task

CHECKPOINT FAILURES:
  - BLOCKER/CRITICAL: Stop, rollback, notify user
  - MAJOR: Continue, create fix tasks
  - MINOR: Log for later
```

---

This validation checkpoint protocol ensures:
- ✅ Every UI change is tested visually
- ✅ Every 5-6 tasks trigger comprehensive testing
- ✅ Phase transitions require full validation
- ✅ Faults are caught early and fixed immediately
- ✅ No broken code reaches production
