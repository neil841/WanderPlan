# Claude Code for Web - Workflow Adaptations

**Last Updated**: 2025-11-12

## Overview

This document describes how to adapt the WanderPlan agentic development workflow for **Claude Code for Web**, which does not support MCP server connections.

---

## ⚠️ Limitations

### What Doesn't Work
1. **Chrome DevTools MCP** - No automated UI validation
2. **shadcn MCP** - No automated component extraction
3. **Any custom MCP servers** - Not supported in web version

### What Still Works ✅
- All subagents (staff-engineer, premium-ux-designer, etc.)
- Code generation and editing
- Git workflow
- Validation checkpoints (with adaptations)
- Phase orchestration

---

## 🔄 Workflow Adjustments

### 1. UI Validation (Without Chrome DevTools MCP)

**Old Workflow** (CLI with MCP):
```bash
# Automated after every UI task
1. Connect to Chrome DevTools MCP
2. Navigate to localhost:3000
3. Test 3 viewports automatically
4. Capture screenshots/snapshots
5. Check console errors
6. Generate validation report
```

**New Workflow** (Web without MCP):
```bash
# Manual validation after UI tasks
1. Run: npm run dev
2. Open browser: http://localhost:3000
3. Manual testing checklist:
   ✓ Desktop (1920x1080) - resize browser
   ✓ Tablet (768x1024) - resize browser
   ✓ Mobile (375x667) - use DevTools device mode
4. F12 → Console → Check for errors
5. F12 → Lighthouse → Run audit
6. Test keyboard navigation (Tab, Enter, Escape)
7. Take screenshots if needed
8. Report issues to Claude
```

**Alternative: Component Testing**
```bash
# Write React Testing Library tests instead
npm test -- TripList.test.tsx
npm test -- TripCard.test.tsx

# Benefits:
- Automated (runs in CI/CD)
- Catches regressions
- Faster than manual testing
- No MCP required
```

---

### 2. shadcn Component Installation

**Old Workflow** (CLI with shadcn MCP):
```bash
# Automated component extraction
1. Ask shadcn MCP for component code
2. MCP extracts from shadcn/ui registry
3. Automatically creates component file
4. Installs dependencies
```

**New Workflow** (Web without MCP):

**Option A: Manual CLI Installation** (Recommended)
```bash
# Install specific component
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form

# Install multiple at once
npx shadcn@latest add button dialog form input label
```

**Option B: Use shadcn-quick-helper Agent**
```bash
# Ask Claude to use the agent
"I need a calendar component. Use the shadcn-quick-helper agent to show me the installation command."

# Agent will provide:
npx shadcn@latest add calendar
# Plus usage examples
```

**Option C: Manual Copy from Documentation**
```bash
1. Visit: https://ui.shadcn.com/docs/components/[component]
2. Copy component code
3. Paste into src/components/ui/[component].tsx
4. Install dependencies if needed
```

---

### 3. Validation Checkpoints

**Updated Checkpoint Process**:

| Checkpoint | Old (with MCP) | New (without MCP) | Duration |
|------------|----------------|-------------------|----------|
| **UI Tasks** | Automated Chrome DevTools | Manual browser testing | 5-10 min |
| **Every 5 Tasks** | 5 agents + Chrome | 5 agents (no Chrome) | 40-50 min |
| **Phase Transition** | Full validation + Chrome | Full validation + manual | 80-100 min |

**What Changed**:
- ❌ No automated screenshot capture
- ❌ No automated viewport testing
- ❌ No automated console error detection
- ✅ Still have: Code review, QA testing, security, performance, accessibility agents
- ✅ Manual testing is STILL required for quality

---

## 📋 Manual Validation Checklist

Use this checklist after every UI task:

### Desktop Testing (1920x1080)
- [ ] Page loads without errors (check console F12)
- [ ] Layout looks correct (no overflow, proper spacing)
- [ ] All buttons clickable and functional
- [ ] Forms submit correctly
- [ ] Navigation works (sidebar, header, footer)
- [ ] Images load properly
- [ ] Text is readable (font size, contrast)

### Tablet Testing (768x1024)
- [ ] Resize browser to ~768px width
- [ ] Layout adapts (responsive design)
- [ ] No horizontal scrolling
- [ ] Touch targets ≥ 44x44px
- [ ] Hamburger menu works (if applicable)
- [ ] Forms still usable

### Mobile Testing (375x667)
- [ ] F12 → Toggle device toolbar → iPhone SE
- [ ] Layout stacks vertically
- [ ] Text minimum 16px (readable)
- [ ] Buttons are tappable (44x44px)
- [ ] Forms work with mobile keyboard
- [ ] No elements cut off

### Accessibility Testing
- [ ] Tab key navigates through interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes dialogs/dropdowns
- [ ] Focus indicators visible (blue outline)
- [ ] Screen reader friendly (use NVDA/JAWS if available)
- [ ] Lighthouse accessibility score > 90

### Performance Testing
- [ ] F12 → Lighthouse → Run audit
- [ ] Performance score > 80
- [ ] No console warnings/errors
- [ ] Images optimized (<500KB)
- [ ] Page load < 3 seconds

---

## 🛠️ Alternative Tools (No MCP Needed)

### 1. Component Testing
```bash
# Install if not already
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Create test file: src/__tests__/components/TripCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TripCard } from '@/components/trips/TripCard';

test('renders trip card with name', () => {
  render(<TripCard trip={mockTrip} />);
  expect(screen.getByText('Paris Adventure')).toBeInTheDocument();
});

# Run tests
npm test
```

### 2. Accessibility Linting
```bash
# Install eslint-plugin-jsx-a11y if not already
npm install --save-dev eslint-plugin-jsx-a11y

# Add to .eslintrc.json
{
  "extends": ["plugin:jsx-a11y/recommended"]
}

# Run linting
npm run lint
```

### 3. Visual Regression (Manual)
```bash
# Take screenshots manually in browser
1. F12 → Toggle device toolbar
2. Select device (iPhone SE, iPad, Desktop)
3. Right-click page → "Capture screenshot"
4. Save to: .claude/reports/screenshots/[feature]-[viewport].png
5. Compare before/after changes
```

### 4. Browser Developer Tools
```bash
# Chrome DevTools (F12)
- Console: Check for errors
- Network: Check API calls
- Performance: Record page load
- Lighthouse: Run audits
- Elements: Inspect CSS/HTML
- Device toolbar: Test responsive design

# Extensions to Install:
- React Developer Tools
- axe DevTools (accessibility)
- Lighthouse
- JSON Viewer
```

---

## 🚀 Updated Phase 3 Workflow

### For Staff Engineer Agent:
```markdown
When implementing UI features:
1. Write code (components, pages, styles)
2. Write React Testing Library tests
3. Document which manual tests are needed
4. Create task in validation checklist
5. Hand off to user for manual validation

Example handoff note:
"✅ Implemented event list component
📋 Manual validation needed:
   - Test drag-and-drop on Desktop/Tablet/Mobile
   - Verify events can be reordered
   - Check console for errors
   - Test keyboard navigation (Tab + Enter to reorder)
   - Run: npm run dev and test at http://localhost:3000/trips/[id]"
```

### For Premium UX Designer Agent:
```markdown
When creating UI components:
1. Design component structure
2. Use existing shadcn components (already installed)
3. If new shadcn component needed:
   - Document installation command
   - Add to manual checklist
4. Create responsive design (mobile-first)
5. Add ARIA labels for accessibility
6. Hand off for manual testing

Example handoff note:
"✅ Designed event timeline component
📦 New shadcn components needed:
   - npx shadcn@latest add timeline
   - npx shadcn@latest add hover-card
📋 Manual validation needed after installation:
   - Test timeline on 3 viewports
   - Verify hover cards work
   - Check keyboard navigation"
```

### For QA Testing Agent:
```markdown
Testing without Chrome DevTools MCP:
1. Write comprehensive React Testing Library tests
2. Run test suite: npm test
3. Check coverage: npm run test:coverage
4. Generate test report
5. Document manual testing scenarios
6. Create manual validation checklist for user

Focus on:
- Unit tests for components
- Integration tests for user flows
- Accessibility tests (jest-axe)
- Snapshot tests for UI stability
```

---

## 📊 Quality Standards (Updated)

| Metric | With MCP | Without MCP | How to Measure |
|--------|----------|-------------|----------------|
| **Code Quality** | 8.5/10 | 8.5/10 | Code review (unchanged) |
| **Test Coverage** | 80% | 80% | `npm run test:coverage` |
| **Security** | 80/100 | 80/100 | Security agent + npm audit |
| **Performance** | 80/100 | 80/100 | Manual Lighthouse audit |
| **Accessibility** | 90/100 | 85/100 | eslint + manual testing |
| **UI Validation** | Automated | Manual | User testing |

**Quality Impact**: -5% on accessibility (no automated testing), but still maintains high standards with manual validation.

---

## 💡 Best Practices

### 1. Write More Tests
Since automated UI validation is unavailable, compensate with better test coverage:
```typescript
// Good: Test user interactions
test('clicking delete button shows confirmation dialog', async () => {
  const user = userEvent.setup();
  render(<TripCard trip={mockTrip} />);

  await user.click(screen.getByRole('button', { name: /delete/i }));

  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
});

// Good: Test accessibility
test('trip card is keyboard navigable', async () => {
  const user = userEvent.setup();
  render(<TripCard trip={mockTrip} />);

  await user.tab();
  expect(screen.getByRole('article')).toHaveFocus();

  await user.keyboard('{Enter}');
  expect(mockOnClick).toHaveBeenCalled();
});
```

### 2. Use Snapshot Tests
```typescript
// Catch unintended UI changes
test('trip card matches snapshot', () => {
  const { container } = render(<TripCard trip={mockTrip} />);
  expect(container).toMatchSnapshot();
});
```

### 3. Manual Testing Workflow
```bash
# After each UI task:
1. git add . && git commit -m "feat: add event list component"
2. npm run dev
3. Open http://localhost:3000
4. Follow manual checklist (see above)
5. Take screenshots if needed
6. Report issues: "Found bug: event list doesn't scroll on mobile"
7. Claude fixes → repeat
```

### 4. Communication with Claude
```markdown
# Good feedback format:
"Manual validation results for Event List component:
✅ Desktop: Works perfectly
✅ Tablet: Works, minor spacing issue in header
❌ Mobile: Horizontal scroll on iPhone SE (375px width)
❌ Accessibility: Delete button has no aria-label
📸 Screenshots attached (if needed)

Please fix mobile scroll and add aria-label."
```

---

## 🎯 Recommended Setup

### Browser Extensions (for Manual Testing)
1. **React Developer Tools** - Inspect components
2. **axe DevTools** - Accessibility testing
3. **Lighthouse** - Performance + accessibility audits
4. **JSON Viewer** - API response inspection
5. **Window Resizer** - Quick viewport switching

### VS Code Extensions
1. **ESLint** - Linting with jsx-a11y rules
2. **Prettier** - Code formatting
3. **Jest Runner** - Run tests in editor
4. **Error Lens** - Inline error display

### Package Additions
```bash
# Better testing setup
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-axe

# Accessibility linting
npm install --save-dev eslint-plugin-jsx-a11y

# Visual regression (if needed)
npm install --save-dev playwright @playwright/test
```

---

## 🔄 Migration Path (Future)

If you regain access to Claude Code CLI:

1. **Re-enable MCP Validation**
   - Update `.claude/config/validation-config.json`
   - Set `chromeDevToolsValidation.enabled: true`
   - Run validation checkpoints again

2. **Install MCP Servers**
   ```bash
   # Chrome DevTools MCP
   npm install -g @modelcontextprotocol/server-chrome-devtools

   # shadcn MCP
   npm install -g @modelcontextprotocol/server-shadcn
   ```

3. **Test Validation**
   ```bash
   # Run a validation checkpoint
   /orchestrate
   # Should now use Chrome DevTools automatically
   ```

---

## 📚 Resources

### Manual Testing Guides
- [Chrome DevTools Docs](https://developer.chrome.com/docs/devtools/)
- [Responsive Design Testing](https://web.dev/responsive-web-design-basics/)
- [Accessibility Testing Guide](https://www.a11yproject.com/checklist/)

### Component Testing
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Accessibility](https://github.com/nickcolley/jest-axe)

### shadcn/ui
- [Component Documentation](https://ui.shadcn.com/docs/components)
- [CLI Installation](https://ui.shadcn.com/docs/cli)
- [Customization Guide](https://ui.shadcn.com/docs/components-json)

---

## ✅ Summary

**What You Need to Do Differently**:
1. ❌ No automated UI validation → ✅ Manual browser testing
2. ❌ No automated component extraction → ✅ Manual shadcn CLI: `npx shadcn@latest add [component]`
3. ✅ Write more component tests to compensate
4. ✅ Use browser DevTools for validation
5. ✅ Report validation results to Claude

**What Stays the Same**:
- All subagents work perfectly
- Code quality remains high
- Validation checkpoints still run (minus Chrome)
- Git workflow unchanged
- Phase orchestration unchanged

**Quality Impact**: Minimal (5% reduction), as long as you perform manual validations consistently.

---

**You're ready for Phase 3!** The workflow is adapted, and quality standards can still be maintained with manual testing. 🚀
