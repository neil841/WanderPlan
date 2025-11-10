---
description: Display all current blockers in a nice format
---

You are displaying all active blockers to help user understand what's blocking progress.

## 🎯 Mission

Read and display all blockers in a user-friendly format with resolution guidance.

## 📋 Process

### Step 1: Read Blockers

```javascript
1. Read `.claude/context/blockers.md`
2. Read `.claude/context/project-state.json`
3. Extract all unresolved blockers
4. Sort by severity and age
```

### Step 2: Display Blockers

```markdown
Current Blockers: [X]

═══════════════════════════════════════════════════════════════

## 🔴 Blocker 1 of [X]

**ID**: [blocker-001]
**Type**: USER_APPROVAL_REQUIRED
**Severity**: HIGH
**Agent**: product-strategy-advisor
**Created**: 2 hours ago
**Status**: ⏳ Unresolved

### Details
User must approve suggested features before API design can proceed.

The product strategy advisor analyzed your app idea and suggested
15 additional features to improve the product. These suggestions
need your approval before we can continue with API design.

### Impact
- **Blocks**: Phase 0 (Planning & Architecture)
- **Next Agent**: api-contract-designer (waiting)
- **Tasks Blocked**: 3 tasks in Phase 0

### To Resolve
1. Review suggested features in `.claude/specs/project-idea.md`
2. Decide which features to include
3. Run `/fix-blockers` and tell me your decision

Options you can say:
- "Approve all suggestions"
- "Approve all CRITICAL and HIGH VALUE features"
- "Approve only: [list features]"
- "Reject all suggestions"

### File to Review
📄 `.claude/specs/project-idea.md`

───────────────────────────────────────────────────────────────

## 🟠 Blocker 2 of [X]

**ID**: [blocker-002]
**Type**: MISSING_CREDENTIAL
**Severity**: CRITICAL
**Agent**: staff-engineer
**Created**: 30 minutes ago
**Status**: ⏳ Unresolved

### Details
Firebase API key required for authentication implementation.

The staff engineer is implementing Firebase authentication but
needs the Firebase API key to configure the connection.

### Impact
- **Blocks**: task-1-auth-setup
- **Next Agent**: Cannot continue until resolved
- **Tasks Blocked**: 1 task, potentially blocking [X] dependent tasks

### To Resolve
1. Get Firebase API key from Firebase Console
2. Run `/fix-blockers`
3. Provide the API key when prompted
4. Choose where to store it (.env file recommended)

### Steps to Get Credential
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to Project Settings > General
4. Copy the API key from "Web API Key"

───────────────────────────────────────────────────────────────

## 🟡 Blocker 3 of [X]

**ID**: [blocker-003]
**Type**: CODE_REVIEW_FAILED
**Severity**: HIGH
**Agent**: senior-code-reviewer
**Created**: 15 minutes ago
**Status**: ⏳ Unresolved

### Details
Code review found 2 BLOCKER issues that must be fixed before
proceeding.

Issues:
1. No authentication check on /api/users endpoint (SECURITY)
2. N+1 database query problem in user list (PERFORMANCE)

### Impact
- **Blocks**: task-1-user-management
- **Next Agent**: git-workflow-agent (waiting)
- **Quality Gate**: Cannot commit until issues fixed

### To Resolve
1. Read detailed review: `.claude/reports/code-review-phase-1.md`
2. Run `/fix-blockers` and choose:
   - Option 1: Let staff-engineer fix automatically
   - Option 2: Fix manually and re-run code review

### File to Review
📄 `.claude/reports/code-review-phase-1.md`

═══════════════════════════════════════════════════════════════

## 📊 Summary

**Total Blockers**: [X]
- 🔴 Critical: [A] (need immediate attention)
- 🟠 High: [B] (should resolve soon)
- 🟡 Medium: [C] (can wait)
- 🟢 Low: [D] (nice to fix)

**Impact**:
- Phases blocked: [N]
- Tasks blocked: [M]
- Time blocked: [longest blocker age]

**Oldest Blocker**: [blocker-XXX] ([time] ago)

═══════════════════════════════════════════════════════════════

## 🎯 Next Steps

### Immediate Actions (Critical Blockers)
1. [Action for blocker-001]
2. [Action for blocker-002]

### Commands to Run
\`\`\`bash
# Interactive resolution wizard
/fix-blockers

# Or view this list again
/show-blockers

# Or check progress
/status
\`\`\`

### After Resolving
Once all blockers are resolved, continue with:
\`\`\`bash
/orchestrate      # Continue with next agent
/auto-phase       # Complete phase autonomously
\`\`\`

═══════════════════════════════════════════════════════════════

💡 **Tip**: Most blockers need your input or decision. Run `/fix-blockers`
   for step-by-step guidance on resolving each blocker.

```

## 📊 Blocker Categories

### By Type

```markdown
## Blockers by Type

### USER_APPROVAL_REQUIRED ([X] blockers)
- [blocker-001]: Feature approval needed
- [blocker-005]: Architecture decision needed

### MISSING_CREDENTIAL ([X] blockers)
- [blocker-002]: Firebase API key
- [blocker-007]: SMTP credentials

### CODE_REVIEW_FAILED ([X] blockers)
- [blocker-003]: Security issues in auth module
- [blocker-008]: Performance issues in dashboard

### TEST_FAILURE ([X] blockers)
- [blocker-004]: 5 tests failing in user service
```

### By Severity

```markdown
## Blockers by Severity

### 🔴 CRITICAL ([X] blockers)
These MUST be fixed before proceeding:
- [blocker-002]: Security vulnerability
- [blocker-006]: Data corruption risk

### 🟠 HIGH ([X] blockers)
Should fix soon:
- [blocker-001]: Feature approval
- [blocker-003]: Code review issues

### 🟡 MEDIUM ([X] blockers)
Can wait but should address:
- [blocker-009]: Documentation incomplete

### 🟢 LOW ([X] blockers)
Nice to fix:
- [blocker-010]: Minor style issues
```

### By Age

```markdown
## Blockers by Age

### ⏰ Oldest
1. [blocker-001] - 5 hours ago
2. [blocker-003] - 2 hours ago
3. [blocker-002] - 45 minutes ago

Most urgent: [blocker-001] (waiting 5 hours)
```

## 🎨 Visual Indicators

Use emojis and formatting for clarity:

- **Severity**: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low
- **Status**: ⏳ Unresolved, ✅ Resolved, 🔄 In Progress
- **Type Icons**:
  - 👤 USER_APPROVAL_REQUIRED
  - 🔑 MISSING_CREDENTIAL
  - 🐛 CODE_REVIEW_FAILED
  - ❌ TEST_FAILURE
  - 📦 MISSING_DEPENDENCY
  - ⚙️  CONFIGURATION_ERROR

## 💡 No Blockers

If no blockers exist:

```markdown
🎉 No Active Blockers!

Your project is running smoothly with no blockers.

**Current Status**:
- Phase: [Current Phase]
- Progress: [X]/[Y] tasks complete ([Z]%)
- Last agent: [agent-name]

**Next Steps**:
\`\`\`bash
/status        # Check overall progress
/orchestrate   # Continue with next agent
/auto-phase    # Complete phase autonomously
\`\`\`

Keep up the great work! 🚀
```

## 🚨 Stale Blockers

If blockers are very old:

```markdown
⚠️  WARNING: Stale Blockers Detected

Some blockers have been unresolved for a long time:
- [blocker-001]: 12 hours ago
- [blocker-005]: 8 hours ago

**Recommendation**:
These old blockers may indicate:
1. Forgotten action items
2. Unclear resolution steps
3. Waiting for external dependencies

Run `/fix-blockers` to address them, or if no longer relevant,
manually mark as resolved in `.claude/context/blockers.md`
```

## ⚡ Quick Actions

At the end, provide quick action buttons:

```markdown
═══════════════════════════════════════════════════════════════

## ⚡ Quick Actions

What would you like to do?

1. `/fix-blockers` - Resolve blockers interactively
2. `/status` - Check overall project progress
3. View specific blocker details (enter blocker ID)
4. Mark blocker as resolved manually
5. Nothing, I'll handle it myself

Select an option (1-5):
```

## 📏 Display Rules

- Sort by: Severity (Critical first) → Age (Oldest first)
- Show max 10 blockers at once (paginate if more)
- Highlight actionable information
- Include file paths to review
- Provide clear next steps
- Use consistent formatting

Remember: Clear information helps users make quick decisions. Make blockers easy to understand and resolve!
