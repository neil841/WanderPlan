# Validation Checkpoint Reports

This directory contains comprehensive validation reports generated every 5 tasks (configurable).

## Report Types

### Checkpoint Summary Reports
- **File Pattern**: `checkpoint-{N}-summary.md`
- **Contents**: Aggregated findings from all validation agents
- **Severity Levels**: BLOCKER, CRITICAL, MAJOR, MINOR, INFO

### Individual Agent Reports
- `checkpoint-{N}-code-review.md` - Code quality and patterns
- `checkpoint-{N}-tests.md` - Test coverage and results
- `checkpoint-{N}-performance.md` - Performance metrics and Lighthouse scores
- `checkpoint-{N}-security.md` - Security vulnerabilities and audit results
- `checkpoint-{N}-ui.md` - UI validation with Chrome DevTools screenshots

## Validation Schedule

Validation checkpoints run automatically every 5 tasks:

| Checkpoint | Tasks Covered | Expected Date |
|------------|---------------|---------------|
| Checkpoint 1 | Tasks 1-5 | After task 1-5 |
| Checkpoint 2 | Tasks 6-10 | After task 1-10 |
| Checkpoint 3 | Tasks 11-15 | After task 1-12 (end of Phase 1) |
| Checkpoint 4 | Tasks 16-20 | Phase 2 |
| ... | ... | ... |

## Severity Definitions

### BLOCKER
- **Impact**: Cannot proceed with development
- **Action**: Must fix immediately before continuing
- **Examples**: Build failures, critical security vulnerabilities, authentication bypass

### CRITICAL
- **Impact**: Major functionality broken or severe risk
- **Action**: Fix before next checkpoint
- **Examples**: SQL injection, XSS, missing error handling, data loss risk

### MAJOR
- **Impact**: Significant issue but not blocking
- **Action**: Fix within current phase
- **Examples**: Performance regression, accessibility violations, poor UX

### MINOR
- **Impact**: Code quality or minor UX issue
- **Action**: Fix when convenient or in refactoring phase
- **Examples**: Code duplication, missing comments, minor styling inconsistencies

### INFO
- **Impact**: Informational only
- **Action**: No action required
- **Examples**: Suggestions, best practices, optimization opportunities

## Reading Reports

### Quick Status Check
Check the summary report first:
```bash
cat checkpoint-2-summary.md | head -30
```

### Detailed Investigation
Read individual agent reports for details on specific issues.

### Screenshots
UI validation reports include screenshots in:
```
.claude/reports/validation/screenshots/checkpoint-{N}/
```

## Next Steps After Validation

### If BLOCKER or CRITICAL Issues
1. Review the summary report
2. Run `/fix-blockers` or manually fix issues
3. Re-run `/orchestrate` - validation will re-check

### If Only MAJOR/MINOR Issues
1. Issues logged for tracking
2. Safe to continue development
3. Address in next checkpoint or refactoring phase

### If All PASS
1. Celebrate! 🎉
2. Continue development with `/orchestrate`
3. Next checkpoint in 5 tasks
