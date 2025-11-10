---
description: Manual UI validation with Chrome DevTools MCP
---

You are performing manual UI validation using Chrome DevTools.

## 🎯 Mission

Validate UI pages interactively using Chrome DevTools MCP for visual inspection, interaction testing, and accessibility checks.

## 📋 Process

### Step 1: Ask Which Page to Validate

```javascript
Display: "Which page would you like to validate?"
Display: ""
Display: "Options:"
Display: "1. Enter URL (e.g., /login, /dashboard)"
Display: "2. List all available pages"
Display: "3. Validate all pages"

choice = getUserInput();

if (choice === "2") {
  // Read from agent-handoffs or implementation-tasks
  Display list of pages
}
```

### Step 2: Open Page in Chrome

```javascript
const url = `http://localhost:3000${route}`;

// Check if dev server running
try {
  mcp__chrome-devtools__new_page({ url });
  Display: "✅ Opened: ${url}"
} catch (error) {
  Display: "❌ Cannot open page. Is dev server running?"
  Display: "Start with: npm run dev"
  STOP
}
```

### Step 3: Take Visual Snapshot

```javascript
// Take text snapshot
mcp__chrome-devtools__take_snapshot();

// Take screenshot
mcp__chrome-devtools__take_screenshot();

Display: "📸 Screenshot captured"
Display: ""
Display: "Visual inspection:"
Display: "- Layout appears correct? (yes/no/describe issue)"

userFeedback = getUserInput();
```

### Step 4: Interactive Testing

```javascript
Display: "🖱️  Interactive Testing"
Display: ""
Display: "What would you like to test?"
Display: "1. Click an element"
Display: "2. Fill a form"
Display: "3. Test keyboard navigation"
Display: "4. Test responsive design"
Display: "5. Check accessibility"
Display: "6. Done with this page"

while (userChoice !== "6") {
  switch (userChoice) {
    case "1":
      // Click element
      Display: "Elements on page:"
      snapshot = mcp__chrome-devtools__take_snapshot();
      // Show clickable elements from snapshot

      Display: "Enter element UID to click:"
      uid = getUserInput();

      mcp__chrome-devtools__click({ uid });
      mcp__chrome-devtools__take_snapshot(); // Show result

      Display: "Did the interaction work as expected? (yes/no)"
      break;

    case "2":
      // Fill form
      Display: "Enter form data as JSON:"
      Display: 'Example: {"email": "test@example.com", "password": "test123"}'

      formData = JSON.parse(getUserInput());

      mcp__chrome-devtools__fill_form({
        elements: formData.map(field => ({
          uid: field.uid,
          value: field.value
        }))
      });

      Display: "Submit form? (yes/no)"
      if (getUserInput() === "yes") {
        mcp__chrome-devtools__click({ uid: submitButtonUid });
      }
      break;

    case "3":
      // Keyboard navigation
      Display: "Testing keyboard navigation..."

      mcp__chrome-devtools__press_key({ key: "Tab" });
      mcp__chrome-devtools__take_snapshot();
      Display: "First focusable element highlighted"

      Display: "Continue tabbing? (yes/no)"
      while (getUserInput() === "yes") {
        mcp__chrome-devtools__press_key({ key: "Tab" });
        mcp__chrome-devtools__take_snapshot();
        Display: "Next element. Continue? (yes/no)"
      }

      Display: "Is tab order logical? (yes/no)"
      Display: "Are focus indicators visible? (yes/no)"
      break;

    case "4":
      // Responsive design
      Display: "Test responsive design"
      Display: "Select viewport:"
      Display: "1. Mobile (375x667)"
      Display: "2. Tablet (768x1024)"
      Display: "3. Desktop (1920x1080)"
      Display: "4. Custom"

      viewport = getUserInput();

      if (viewport === "1") {
        mcp__chrome-devtools__resize_page({ width: 375, height: 667 });
      } else if (viewport === "2") {
        mcp__chrome-devtools__resize_page({ width: 768, height: 1024 });
      } else if (viewport === "3") {
        mcp__chrome-devtools__resize_page({ width: 1920, height: 1080 });
      }

      mcp__chrome-devtools__take_screenshot();
      Display: "Does layout look correct? (yes/no)"
      break;

    case "5":
      // Accessibility check
      Display: "Running accessibility check..."

      results = mcp__chrome-devtools__evaluate_script({
        function: `async () => {
          if (typeof axe === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
          }

          const results = await axe.run();
          return {
            violations: results.violations.length,
            passes: results.passes.length,
            topIssues: results.violations.slice(0, 5).map(v => ({
              impact: v.impact,
              description: v.description
            }))
          };
        }`
      });

      Display: "Accessibility Results:"
      Display: `- Violations: ${results.violations}`
      Display: `- Passes: ${results.passes}`

      if (results.violations > 0) {
        Display: "Top issues:"
        results.topIssues.forEach(issue => {
          Display: `  - [${issue.impact}] ${issue.description}`;
        });
      }
      break;
  }

  Display: "What's next?"
  // Show menu again
}
```

### Step 5: Performance Check

```javascript
Display: "📊 Check performance? (yes/no)"

if (getUserInput() === "yes") {
  mcp__chrome-devtools__performance_start_trace({
    reload: true,
    autoStop: true
  });

  // Wait for trace to complete
  // Results will show automatically

  Display: "Review performance insights above"
  Display: "Any performance issues? (yes/no/describe)"
}
```

### Step 6: Generate Validation Report

```javascript
Display: "💾 Save validation report? (yes/no)"

if (getUserInput() === "yes") {
  const report = `
# UI Validation Report - ${route}

**Date**: ${new Date().toISOString()}
**URL**: ${url}

## Visual Inspection
${visualFeedback}

## Interactive Testing
${interactionResults}

## Keyboard Navigation
- Tab order: ${tabOrderLogical ? "✅ Logical" : "❌ Needs fixing"}
- Focus indicators: ${focusVisible ? "✅ Visible" : "❌ Not visible"}

## Responsive Design
- Mobile (375px): ${mobileWorks ? "✅" : "❌"}
- Tablet (768px): ${tabletWorks ? "✅" : "❌"}
- Desktop (1920px): ${desktopWorks ? "✅" : "❌"}

## Accessibility
- Violations: ${accessibilityViolations}
- Status: ${accessibilityViolations === 0 ? "✅ Pass" : "❌ Needs attention"}

## Performance
${performanceResults}

## Issues Found
${issuesList}

## Overall Status
${allTestsPass ? "✅ PASS" : "⚠️ NEEDS ATTENTION"}
  `;

  saveFile(`.claude/reports/ui-validation-${route.replace(/\//g, '-')}-${timestamp}.md`, report);

  Display: "✅ Report saved"
}
```

### Step 7: Continue or Finish

```javascript
Display: "Validate another page? (yes/no)"

if (getUserInput() === "yes") {
  // Loop back to Step 1
} else {
  Display: "✅ UI Validation Complete!"
  Display: ""
  Display: "Reports saved to: .claude/reports/"
}
```

## 📊 Validation Checklist

For each page, validate:

- [ ] **Visual**:
  - Layout matches design
  - Colors and typography correct
  - Images load properly
  - No layout shifts

- [ ] **Interactive**:
  - Buttons clickable
  - Forms submittable
  - Links navigate correctly
  - Modals open/close

- [ ] **Keyboard**:
  - Tab order logical
  - Focus indicators visible
  - Escape closes modals
  - Enter submits forms

- [ ] **Responsive**:
  - Mobile layout works (375px)
  - Tablet layout works (768px)
  - Desktop layout works (1920px+)
  - No horizontal scroll

- [ ] **Accessibility**:
  - Zero critical violations
  - Alt text on images
  - Labels on inputs
  - ARIA attributes correct

- [ ] **Performance**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - No console errors

## 💡 Use Cases

### Use Case 1: Quick Visual Check

```bash
/validate-ui

# Select page
> 1. /login

# Visual inspection
> yes, looks good

# Done
```

### Use Case 2: Comprehensive Testing

```bash
/validate-ui

# Test all aspects:
- Visual inspection
- Click all buttons
- Fill all forms
- Test keyboard nav
- Check responsive
- Run accessibility
- Check performance

# Save report
> yes
```

### Use Case 3: Accessibility Focus

```bash
/validate-ui

# Skip to accessibility
> 5. Check accessibility

# Review violations
# Save report
```

## ⚠️ Important Notes

- **Dev server must be running**: Start with `npm run dev`
- **Local testing only**: Uses localhost:3000
- **Manual process**: Requires user input and judgment
- **Complements automated testing**: Use with accessibility-compliance-agent

Remember: Manual testing catches issues automated tests miss. Trust your eyes and experience!
