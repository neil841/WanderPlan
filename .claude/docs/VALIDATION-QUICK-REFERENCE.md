# Validation System - Quick Reference

## At A Glance

**Status**: ✅ ACTIVE
**Interval**: Every 5 tasks
**Current Progress**: 8/16 tasks in Phase 1
**Next Checkpoint**: Task 13

---

## What Happens at Each Checkpoint?

### 1. Code Review (15 min)
✅ Code quality, patterns, security basics

### 2. Testing (20 min)
✅ Test coverage >80%, all tests pass

### 3. Performance (10 min)
✅ Lighthouse >80, bundle <500KB

### 4. Security (15 min)
✅ No SQL injection, XSS, auth bypass, vulnerable dependencies

### 5. UI Validation (10 min, if UI tasks)
✅ Visual rendering, responsive, WCAG AA, interactive elements

**Total Time**: 60-70 minutes

---

## Severity Guide

| Level | Action | Example |
|-------|--------|---------|
| **BLOCKER** | Stop & fix immediately | Build fails, auth completely broken |
| **CRITICAL** | Fix before next checkpoint | SQL injection, missing error handling |
| **MAJOR** | Fix in current phase | Performance regression, accessibility issues |
| **MINOR** | Fix when convenient | Code duplication, missing comments |

---

## Quick Commands

```bash
# Normal workflow
/orchestrate              # Continues development, triggers validation automatically

# Manual validation
/validate-checkpoint      # Run validation now (doesn't wait for task count)
/validate-ui             # UI validation only (with Chrome DevTools)

# View reports
cat .claude/reports/validation/checkpoint-2-summary.md

# Status check
/status                  # Shows progress and next checkpoint

# If issues found
/fix-blockers           # Interactive fix process
/show-blockers          # View all blockers
```

---

## What Gets Validated?

### Code Review Checks
- ❌ `any` types in TypeScript
- ❌ Missing error handling
- ❌ Poor code patterns
- ❌ Security anti-patterns
- ✅ TypeScript strict mode
- ✅ Proper error handling
- ✅ Clean code patterns

### Security Checks
- ❌ SQL injection risks
- ❌ XSS vulnerabilities
- ❌ Auth bypass possibilities
- ❌ Hardcoded secrets
- ❌ Vulnerable dependencies
- ✅ Input validation
- ✅ Sanitized queries
- ✅ Secure authentication

### Performance Checks
- ❌ Bundle >500KB
- ❌ Lighthouse <80
- ❌ API >200ms
- ❌ N+1 queries
- ✅ Optimized bundles
- ✅ Fast page loads
- ✅ Efficient queries

### UI Checks (when applicable)
- ❌ Visual bugs
- ❌ Not responsive
- ❌ Accessibility fails
- ❌ Broken interactions
- ✅ Clean rendering
- ✅ Mobile/tablet/desktop
- ✅ WCAG 2.1 AA
- ✅ All elements work

---

## Checkpoint Schedule

| Checkpoint | Tasks | Phase | Status |
|------------|-------|-------|--------|
| 1 | 1-5 | Phase 1 | ⏩ Skipped (too early) |
| 2 | 6-10 | Phase 1 | 📍 Next (2 tasks away) |
| 3 | 11-15 | Phase 1 | ⏳ Upcoming |
| 4 | 16-20 | Phase 2 | ⏳ Upcoming |
| 5+ | Every 5 | All Phases | ⏳ Upcoming |

**Current**: 8 tasks complete, checkpoint in 2 tasks

---

## What to Expect

### If Validation Passes ✅
```
✅ VALIDATION PASSED
Checkpoint complete, all checks passed!
Continuing development...
```
**Action**: None! Keep going with `/orchestrate`

### If Minor Issues ⚠️
```
⚠️ VALIDATION WARNING
Found 3 major issues (non-blocking)
Review: checkpoint-2-summary.md
Continuing development...
```
**Action**: Note the issues, fix in current phase

### If Critical Issues 🛑
```
⚠️ VALIDATION FAILED
Critical issues found: 2
Review: checkpoint-2-summary.md
Fix with: /fix-blockers
```
**Action**: MUST fix before continuing

---

## Report Structure

```
.claude/reports/validation/
├── checkpoint-1-summary.md      # Overall summary
├── checkpoint-1-code-review.md  # Code quality details
├── checkpoint-1-tests.md        # Test results
├── checkpoint-1-performance.md  # Performance metrics
├── checkpoint-1-security.md     # Security findings
├── checkpoint-1-ui.md          # UI validation
└── screenshots/
    └── checkpoint-1/
        ├── login-page-desktop.png
        ├── login-page-mobile.png
        └── ...
```

---

## Time Investment

| Activity | Time | When |
|----------|------|------|
| Validation run | 60-70 min | Every 5 tasks |
| Fix critical issues | 30-120 min | If critical found |
| Fix major issues | Spread over phase | Current phase |
| **Total overhead** | **~10-15%** | **Overall project** |

**ROI**: 70-80% reduction in late-stage rework

---

## Configuration

File: `.claude/config/validation-config.json`

```json
{
  "validationInterval": 5,          // ← Change checkpoint frequency
  "enabled": true,                  // ← Disable in emergency
  "uiValidationEnabled": true,      // ← Enable/disable UI checks
  "performanceThresholds": {
    "lighthouseScore": 80,          // ← Adjust thresholds
    "bundleSizeKB": 500
  }
}
```

---

## Pro Tips

1. **Don't disable validation** unless absolute emergency
2. **Fix CRITICAL issues immediately** - they compound
3. **Review reports even if passed** - learn from warnings
4. **Run UI validation with dev server running** - avoids errors
5. **Keep checkpoints at 5 tasks** - sweet spot for frequency

---

## Troubleshooting

### "Validation taking too long"
- Normal! 60-70 min is expected
- Run overnight if needed
- Consider running validation less frequently (every 6-7 tasks)

### "Too many issues found"
- GOOD sign! Catching early
- Fix CRITICAL first, MAJOR next, MINOR later
- Use `/fix-blockers` for guided fixes

### "UI validation won't connect"
- Start dev server: `npm run dev`
- Wait for "Ready on http://localhost:3000"
- Re-run `/orchestrate`

### "False positive security issue"
- Review the specific finding
- May need to whitelist pattern
- Update validation config if needed

---

## Current Safety Status

✅ Build-time validation active (TypeScript, ESLint, build)
✅ Checkpoint validation configured (every 5 tasks)
✅ Security agent integrated early
✅ UI validation with Chrome DevTools enabled
✅ Performance monitoring active
✅ Test coverage tracking enabled

**Next Checkpoint**: Task 13 (in 5 tasks)

**Protection Level**: 🛡️🛡️🛡️🛡️🛡️ MAXIMUM

---

*Questions? See full documentation in `.claude/docs/SAFETY-SYSTEM.md`*
