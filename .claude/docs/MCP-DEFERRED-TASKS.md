# MCP-DEFERRED-TASKS.md

This file contains UI validation tasks that require Chrome DevTools MCP testing.

**IMPORTANT**: These tasks must be completed before the features are considered production-ready.

---

## Proposal Management UI Validation (task-5-10-proposal-ui)

**Created**: 2025-11-22
**Agent**: shadcn-implementation-builder
**Status**: PENDING VALIDATION

### Test Environment Setup
```bash
# 1. Start development server
npm run dev

# 2. Navigate to proposals section
# URL: http://localhost:3000/crm/proposals
```

### Required Breakpoints
All tests must be performed on 3 viewport sizes:
1. **Desktop**: 1920x1080
2. **Tablet**: 768x1024
3. **Mobile**: 375x667 (iPhone SE)

---

### Test Scenario 1: Proposal List Page

**URL**: `http://localhost:3000/crm/proposals`

#### Desktop (1920x1080)
```bash
# Resize viewport
mcp__chrome-devtools__resize_page --width=1920 --height=1080

# Capture page structure
mcp__chrome-devtools__take_snapshot

# Visual verification
mcp__chrome-devtools__take_screenshot

# Check console for errors
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]
```

**Verify**:
- [ ] All 7 table columns visible (Title, Client, Trip, Status, Total, Valid Until, Actions)
- [ ] Search bar and filters appear correctly
- [ ] "Create Proposal" button in top-right
- [ ] Pagination controls at bottom
- [ ] No horizontal scroll
- [ ] Status badges have correct colors (DRAFT=gray, SENT=blue, ACCEPTED=green, REJECTED=red)
- [ ] Currency formatted with symbols and commas
- [ ] Row hover effect works
- [ ] Dropdown menu opens on action button click

#### Tablet (768x1024)
```bash
mcp__chrome-devtools__resize_page --width=768 --height=1024
mcp__chrome-devtools__take_screenshot
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]
```

**Verify**:
- [ ] Trip column hidden (expected behavior)
- [ ] Table remains readable
- [ ] No element overlap
- [ ] Touch targets adequate (min 44x44px)

#### Mobile (375x667)
```bash
mcp__chrome-devtools__resize_page --width=375 --height=667
mcp__chrome-devtools__take_screenshot
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]
```

**Verify**:
- [ ] Table switches to card layout (or scrollable table)
- [ ] No horizontal scroll
- [ ] All text readable (min 16px)
- [ ] Touch targets adequate (min 44x44px)
- [ ] Search bar full-width
- [ ] Filters accessible

#### Interaction Tests
```bash
# Get snapshot to find element UIDs
mcp__chrome-devtools__take_snapshot

# Test search input
mcp__chrome-devtools__fill --uid="<search-input-uid>" --value="test"

# Test status filter
mcp__chrome-devtools__click --uid="<status-select-uid>"

# Test row action menu
mcp__chrome-devtools__click --uid="<action-button-uid>"
```

**Verify**:
- [ ] Search debounces (300ms delay)
- [ ] Filters update URL params
- [ ] Pagination works
- [ ] Empty state shows when no results
- [ ] Loading skeletons appear during fetch

---

### Test Scenario 2: Create Proposal Page

**URL**: `http://localhost:3000/crm/proposals/new`

#### Desktop (1920x1080)
```bash
mcp__chrome-devtools__resize_page --width=1920 --height=1080
mcp__chrome-devtools__take_snapshot
mcp__chrome-devtools__take_screenshot
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]
```

**Verify Section 1 - Basic Information**:
- [ ] Title input with character counter (shows at >150 chars)
- [ ] Client ID input (labeled as required with asterisk)
- [ ] Trip ID input (optional, no asterisk)
- [ ] Description textarea (max 2000 chars)
- [ ] Valid Until date picker works
- [ ] Info icons visible with tooltips

**Verify Section 2 - Line Items**:
- [ ] Line item table displays correctly
- [ ] All fields in one row: Description, Qty, Unit Price, Total, Remove button
- [ ] Total auto-calculates (qty × unit price)
- [ ] "Add Line Item" button adds new row
- [ ] Remove button disabled when only 1 line item
- [ ] Subtotal updates in real-time
- [ ] Subtotal displayed prominently

**Verify Section 3 - Financial Summary**:
- [ ] Subtotal (read-only, matches line items sum)
- [ ] Tax input (optional)
- [ ] Discount input (optional)
- [ ] Currency selector shows 8 currencies (USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY)
- [ ] Total displays prominently with large font
- [ ] Total = subtotal + tax - discount

**Verify Section 4 - Additional Details**:
- [ ] Internal Notes textarea with info icon
- [ ] Terms and Conditions textarea with info icon
- [ ] Character counters appear at >1800 (notes) and >4500 (terms)

**Verify Form Actions**:
- [ ] Cancel button navigates back
- [ ] Save as Draft button submits form
- [ ] Loading spinner during submission
- [ ] Form validation errors appear inline

#### Mobile (375x667)
```bash
mcp__chrome-devtools__resize_page --width=375 --height=667
mcp__chrome-devtools__take_screenshot
```

**Verify**:
- [ ] Single column layout
- [ ] Line items stack vertically (not horizontal table)
- [ ] No horizontal scroll
- [ ] All text readable
- [ ] Form inputs accessible with mobile keyboard
- [ ] Buttons accessible (min 44x44px touch targets)

#### Form Validation Tests
```bash
# Try to submit empty form
mcp__chrome-devtools__click --uid="<submit-button-uid>"
```

**Verify**:
- [ ] "Title is required" error appears
- [ ] "Client ID is required" error appears
- [ ] "At least one line item is required" error appears
- [ ] Errors styled with red border
- [ ] Error messages appear below fields

#### Calculation Tests
```bash
# Fill line item quantity and unit price
mcp__chrome-devtools__fill --uid="<quantity-input-uid>" --value="2"
mcp__chrome-devtools__fill --uid="<unit-price-input-uid>" --value="100"
```

**Verify**:
- [ ] Line item total shows $200.00 (2 × 100)
- [ ] Subtotal updates to $200.00
- [ ] Add tax of $20, total becomes $220.00
- [ ] Add discount of $10, total becomes $210.00
- [ ] Currency symbol changes when currency selector changed

---

### Test Scenario 3: Proposal View Page

**URL**: `http://localhost:3000/crm/proposals/[id]` (use existing proposal ID)

#### Desktop (1920x1080)
```bash
mcp__chrome-devtools__resize_page --width=1920 --height=1080
mcp__chrome-devtools__take_snapshot
mcp__chrome-devtools__take_screenshot
mcp__chrome-devtools__list_console_messages --types=["error", "warn"]
```

**Verify Header**:
- [ ] "Travel Proposal" heading
- [ ] Proposal title (large, bold)
- [ ] Status badge
- [ ] Created date
- [ ] Valid Until date (if set)

**Verify Sections**:
- [ ] Client Information (name, email)
- [ ] Trip Information (if linked)
- [ ] Description (if provided)
- [ ] Proposed Services table (line items)
- [ ] Financial summary (subtotal, tax, discount, total)
- [ ] Terms and Conditions (if provided)

**Verify Action Bar** (not printed):
- [ ] Edit button (visible only if status=DRAFT)
- [ ] Send to Client button (visible only if status=DRAFT)
- [ ] Print button
- [ ] Delete button (visible if status≠ACCEPTED)

**Verify Print Layout**:
```bash
# Open browser print dialog (can't automate, manual test)
# Click Print button
```

**Manual verification**:
- [ ] Print preview shows professional layout
- [ ] Action bar hidden in print view
- [ ] Page breaks at logical sections
- [ ] Black and white friendly
- [ ] No background colors in print

#### Mobile (375x667)
```bash
mcp__chrome-devtools__resize_page --width=375 --height=667
mcp__chrome-devtools__take_screenshot
```

**Verify**:
- [ ] Single column layout
- [ ] Line items table simplified (2 columns: Item + Total, hide Qty and Unit Price)
- [ ] Financial summary full-width
- [ ] All text readable
- [ ] Action buttons accessible

---

### Test Scenario 4: Edit Proposal Page

**URL**: `http://localhost:3000/crm/proposals/[id]/edit` (use DRAFT proposal ID)

#### Desktop (1920x1080)
```bash
mcp__chrome-devtools__resize_page --width=1920 --height=1080
mcp__chrome-devtools__take_snapshot
mcp__chrome-devtools__take_screenshot
```

**Verify**:
- [ ] Form pre-populated with existing proposal data
- [ ] Title shows existing value
- [ ] Line items show existing rows
- [ ] Tax and discount show existing values
- [ ] Currency shows existing value (read-only, cannot change)
- [ ] Notes and terms show existing values
- [ ] "Update Proposal" button (not "Save as Draft")
- [ ] Last updated timestamp shown in header

**Verify Validation**:
- [ ] Cannot edit if status ≠ DRAFT
- [ ] Alert shown: "Cannot edit proposals with status SENT"
- [ ] Redirects to view page if not DRAFT

**Verify Updates**:
```bash
# Change title
mcp__chrome-devtools__fill --uid="<title-input-uid>" --value="Updated Title"

# Submit
mcp__chrome-devtools__click --uid="<submit-button-uid>"
```

**Verify**:
- [ ] Success toast appears
- [ ] Redirects to view page
- [ ] Updated data shown in view page

---

### Test Scenario 5: Send Proposal Dialog

**Trigger**: Click "Send to Client" button on view page (DRAFT proposal)

#### Desktop (1920x1080)
```bash
# Click send button
mcp__chrome-devtools__click --uid="<send-button-uid>"

# Dialog should open
mcp__chrome-devtools__take_snapshot
mcp__chrome-devtools__take_screenshot
```

**Verify Dialog Content**:
- [ ] Dialog title: "Send Proposal to Client"
- [ ] Proposal summary box showing: Title, Client name, Email, Total
- [ ] Email preview section with: Subject, Body, Call-to-action button
- [ ] Info message: "Client will receive an email with a link to view the proposal"
- [ ] Cancel button
- [ ] "Confirm and Send" button (primary)

**Verify Interaction**:
```bash
# Click confirm button
mcp__chrome-devtools__click --uid="<confirm-button-uid>"
```

**Verify**:
- [ ] Loading spinner appears on button
- [ ] Button text changes to "Sending..."
- [ ] Success toast appears
- [ ] Dialog closes
- [ ] Proposal status changes to SENT
- [ ] "Send to Client" button becomes disabled

---

### Test Scenario 6: Delete Proposal Dialog

**Trigger**: Click "Delete" button on view page (DRAFT proposal)

#### Desktop (1920x1080)
```bash
# Click delete button
mcp__chrome-devtools__click --uid="<delete-button-uid>"

# Dialog should open
mcp__chrome-devtools__take_snapshot
mcp__chrome-devtools__take_screenshot
```

**Verify Dialog Content**:
- [ ] Dialog title: "Delete Proposal"
- [ ] Warning icon (large triangle)
- [ ] Confirmation message: "Are you sure you want to delete this proposal?"
- [ ] Proposal details box showing: Title, Client, Status, Total
- [ ] Warning: "This action cannot be undone" (in red)
- [ ] Additional warning: "You cannot delete proposals with ACCEPTED status"
- [ ] Cancel button
- [ ] "Delete Proposal" button (destructive/red)

**Verify ACCEPTED Proposal**:
- [ ] Delete button disabled if status=ACCEPTED
- [ ] Alert shown in dialog: "You cannot delete proposals with ACCEPTED status"
- [ ] "Delete Proposal" button disabled

**Verify Deletion**:
```bash
# With DRAFT proposal, click confirm
mcp__chrome-devtools__click --uid="<delete-confirm-button-uid>"
```

**Verify**:
- [ ] Loading spinner appears
- [ ] Button text changes to "Deleting..."
- [ ] Success toast appears
- [ ] Redirects to proposals list page
- [ ] Deleted proposal no longer in list

---

### Accessibility Tests (All Pages)

#### Keyboard Navigation
**Verify**:
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] All interactive elements focusable
- [ ] Focus visible (2px outline)
- [ ] Escape key closes dialogs
- [ ] Enter key submits forms
- [ ] Arrow keys navigate table (if implemented)

#### Screen Reader Compatibility
**Verify**:
- [ ] All images have alt text or aria-hidden
- [ ] All buttons have accessible labels (aria-label)
- [ ] Form fields have associated labels (htmlFor/id)
- [ ] Error messages announced (aria-live="polite")
- [ ] Status badges have aria-label
- [ ] Table has caption and proper structure

#### Color Contrast (WCAG 2.1 AA)
**Verify**:
- [ ] Normal text: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] Interactive elements: 3:1 minimum
- [ ] Status badges meet contrast requirements

---

### Performance Tests

#### Desktop (1920x1080)
```bash
# Start performance trace
mcp__chrome-devtools__performance_start_trace --reload=true --autoStop=true

# After trace completes, analyze
mcp__chrome-devtools__performance_analyze_insight --insightSetId="<id>" --insightName="LCPBreakdown"
```

**Verify Core Web Vitals**:
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

#### Network Tests
```bash
# Check network requests
mcp__chrome-devtools__list_network_requests
```

**Verify**:
- [ ] No failed requests (404, 500)
- [ ] API requests complete in <200ms
- [ ] No CORS errors
- [ ] Reasonable bundle size (<500KB initial)

---

### Error Handling Tests

#### Network Error
**Simulate**: Turn off internet, reload page

**Verify**:
- [ ] Error alert appears
- [ ] Error message is helpful
- [ ] Retry mechanism available
- [ ] No console errors beyond expected

#### Invalid Proposal ID
**Test**: Navigate to `/crm/proposals/invalid-uuid`

**Verify**:
- [ ] Error alert appears: "Failed to load proposal"
- [ ] No app crash
- [ ] User can navigate back

#### Form Validation Errors
**Test**: Try to submit incomplete form

**Verify**:
- [ ] Validation errors appear immediately
- [ ] Error messages are clear and helpful
- [ ] Focus moves to first error field
- [ ] Can fix errors and resubmit

---

### Integration Tests

#### Client Autocomplete (if implemented)
**Verify**:
- [ ] Typing in client field shows suggestions
- [ ] Selecting client populates client ID
- [ ] Search works with partial names

#### Trip Autocomplete (if implemented)
**Verify**:
- [ ] Typing in trip field shows suggestions
- [ ] Selecting trip populates trip ID
- [ ] Can leave trip empty

---

## Summary Checklist

Before marking task-5-10-proposal-ui as validated:

- [ ] All 4 pages tested on 3 breakpoints (12 combinations)
- [ ] All interactive elements tested
- [ ] All user flows completed successfully
- [ ] Accessibility tests pass
- [ ] Performance tests meet targets
- [ ] Error handling works correctly
- [ ] No console errors
- [ ] Form validation works
- [ ] Calculations are accurate
- [ ] Dialogs work correctly
- [ ] Print layout works
- [ ] Status workflow enforced
- [ ] Integration with API confirmed

**Estimated Testing Time**: 2-3 hours

---

## Notes for Validator

- **Test Data Required**: Create at least 3 test proposals with different statuses (DRAFT, SENT, ACCEPTED)
- **Browser**: Use Chrome or Chromium (required for Chrome DevTools MCP)
- **Prerequisites**: Development server running (`npm run dev`)
- **Database**: Ensure test proposals exist in database
- **API**: Ensure all proposal API endpoints are working

---

**Validation Date**: _____________
**Validated By**: _____________
**Status**: PENDING
**Issues Found**: _____________
**Resolution**: _____________

