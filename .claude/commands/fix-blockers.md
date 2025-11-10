---
description: Interactive blocker resolution wizard
---

You are helping user resolve blockers interactively.

## 🎯 Mission

Guide user through resolving all active blockers step by step.

## 📋 Process

### Step 1: Read All Blockers

```javascript
1. Read `.claude/context/blockers.md`
2. Read `.claude/context/project-state.json`
3. Extract all unresolved blockers
```

### Step 2: Display Blockers

```markdown
You have [X] active blocker(s):

## Blocker 1 of [X]

**ID**: [blocker-001]
**Type**: USER_APPROVAL_REQUIRED
**Agent**: product-strategy-advisor
**Created**: 2 hours ago
**Status**: Unresolved

**Details**:
User must approve suggested features before API design can proceed.

**Impact**:
Cannot continue with Phase 0 (Planning) until features are approved.

**To Resolve**:
Review suggested features in `.claude/specs/project-idea.md` and tell me which features to include.

Options:
- "Approve all suggestions"
- "Approve all CRITICAL and HIGH VALUE features"
- "Approve only: [list specific features]"
- "Reject all and use only original features"

---

How would you like to resolve this blocker?
```

### Step 3: Interactive Resolution

For each blocker type:

#### USER_APPROVAL_REQUIRED

```javascript
// User provides approval
userResponse = getUserInput();

// Update the relevant file
if (blocker.context === "feature-approval") {
  updateFile('.claude/specs/project-idea.md', approvedFeatures);
}

// Mark blocker as resolved in blockers.md
markBlockerResolved(blockerId, userResponse);

// Update project-state.json
removeBlockerFromState(blockerId);

Display: "✅ Blocker [blocker-001] resolved!"
```

#### MISSING_CREDENTIAL

```javascript
Display: "Please provide the required credential:"
Display: "[Credential name]: [What it's for]"

credential = getUserInput();

Display: "Where should I store this?"
Display: "1. Add to .env file"
Display: "2. Add to Vercel environment variables"
Display: "3. Tell me the exact location"

choice = getUserInput();

if (choice === "1") {
  appendToFile('.env', `${credentialName}=${credential}`);
  Display: "✅ Added to .env file"
  Display: "⚠️  Don't forget to add to .env.example (without the actual value)"
}

markBlockerResolved(blockerId, "Credential provided");
```

#### MISSING_DEPENDENCY

```javascript
Display: "Missing dependency: [package-name]"
Display: "Install it now? (yes/no)"

if (getUserInput() === "yes") {
  runCommand(`npm install ${packageName}`);
  Display: "✅ Installed [package-name]"
  markBlockerResolved(blockerId, "Dependency installed");
} else {
  Display: "Blocker remains unresolved. Install manually: npm install [package-name]"
}
```

#### CODE_REVIEW_FAILED

```javascript
Display: "Code review found [X] BLOCKER issues"
Display: "See: .claude/reports/code-review-phase-[N].md"
Display: ""
Display: "Options:"
Display: "1. View detailed report"
Display: "2. Run staff-engineer to fix issues automatically"
Display: "3. I'll fix manually"

choice = getUserInput();

if (choice === "1") {
  displayFile('.claude/reports/code-review-phase-[N].md');
  // Then ask again
}

if (choice === "2") {
  Display: "Running /orchestrate to spawn staff-engineer with fix instructions..."
  runOrchestrate();
  markBlockerResolved(blockerId, "Fix in progress");
}

if (choice === "3") {
  Display: "After fixing, run /orchestrate to re-review"
  markBlockerResolved(blockerId, "Manual fix in progress");
}
```

#### TEST_FAILURE

```javascript
Display: "Tests are failing. See: .claude/reports/test-results.md"
Display: ""
Display: "Failed tests: [X]"
Display: "[List failing test names]"
Display: ""
Display: "Options:"
Display: "1. View test failure details"
Display: "2. Run staff-engineer to fix failures"
Display: "3. I'll fix manually"

choice = getUserInput();

// Similar to code review flow
```

### Step 4: Continue with Remaining Blockers

```javascript
const remainingBlockers = getUnresolvedBlockers();

if (remainingBlockers.length > 0) {
  Display: `✅ Blocker 1 resolved!`
  Display: `Remaining blockers: ${remainingBlockers.length}`
  Display: ""
  Display: "Continue to next blocker? (yes/no)"

  if (getUserInput() === "yes") {
    // Loop to next blocker
  } else {
    Display: "Stopped. Run /fix-blockers again to continue."
  }
} else {
  Display: "🎉 All blockers resolved!"
  Display: ""
  Display: "Next steps:"
  Display: "- Run /orchestrate to continue workflow"
  Display: "- Or run /auto-phase to complete phase autonomously"
}
```

### Step 5: Update State

```javascript
// For each resolved blocker:
1. Update `.claude/context/blockers.md`
   - Change status to "Resolved"
   - Add resolution timestamp
   - Add resolution details

2. Update `.claude/context/project-state.json`
   - Remove from blockers array
   - Update task status from "blocked" to "pending"

3. Log to `.claude/context/orchestrator-log.md`
```

## 📊 Example Session

```
User: /fix-blockers