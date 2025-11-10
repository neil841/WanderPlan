---
description: Complete entire current phase autonomously (loops /orchestrate until phase done or blocker)
---

You are running autonomous phase completion mode.

## 🎯 Mission

Complete the current phase autonomously by repeatedly running /orchestrate until:
- Phase is complete (all tasks done), OR
- A blocker is encountered, OR
- Maximum iterations reached (safety limit)

## 📋 Process

### Step 1: Read Current State

```javascript
1. Read `.claude/context/project-state.json`
2. Extract:
   - Current phase
   - Total tasks in phase
   - Completed tasks
   - Active blockers
```

### Step 2: Check Pre-conditions

```javascript
if (blockers.length > 0) {
  Display: "❌ Cannot run auto-phase: [X] blockers exist"
  Display: "Run /fix-blockers or /show-blockers first"
  STOP
}

if (currentPhase === null) {
  Display: "❌ No active phase. Run /start-project first"
  STOP
}
```

### Step 3: Run Autonomous Loop

```javascript
let iteration = 0;
const MAX_ITERATIONS = 50; // Safety limit

while (iteration < MAX_ITERATIONS) {
  iteration++;

  // Read state
  const state = readProjectState();

  // Check for blockers
  if (state.blockers.length > 0) {
    Display progress
    Display: "⏸️  Paused: Blocker encountered"
    Display blocker details
    Display: "Run /fix-blockers to resolve, then /auto-phase to continue"
    STOP
  }

  // Check if phase complete
  const phase = state.phases[state.currentPhase];
  const allTasksComplete = Object.values(phase.tasks)
    .every(status => status === 'completed');

  if (allTasksComplete) {
    Display progress
    Display: "🎉 Phase [N] Complete!"
    Display phase summary
    STOP
  }

  // Display progress
  const completedCount = Object.values(phase.tasks)
    .filter(s => s === 'completed').length;
  const totalCount = Object.keys(phase.tasks).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  Display: `Phase ${state.currentPhase} Progress: ${completedCount}/${totalCount} tasks (${percentage}%)`

  if (iteration > 1) {
    Display: `Iteration: ${iteration}/${MAX_ITERATIONS}`
  }

  // Run orchestrate
  Display: "Running /orchestrate..."
  runOrchestrate();

  // Wait for agent to complete
  // (This happens automatically in the workflow)

  // Brief delay to prevent infinite loops
  wait(1000);
}

// Safety limit reached
Display: "⚠️  Maximum iterations reached (${MAX_ITERATIONS})"
Display: "Phase may be stuck. Check logs and run /status"
```

### Step 4: Display Final Summary

When phase complete:

```markdown
🎉 Phase [N] Complete!

**Phase**: [Phase Name]
**Duration**: [X] iterations

**Tasks Completed**: [X]/[X]
✅ [task-1-name]
✅ [task-2-name]
✅ [task-3-name]

**Agents Run**: [Y] total
- staff-engineer: [A] times
- qa-testing-agent: [B] times
- senior-code-reviewer: [C] times
- git-workflow-agent: [D] times

**Test Results**:
- Tests: [X] passing
- Coverage: [Y]%

**Code Quality**:
- Code review score: [X]/10
- No blocking issues

**Git Commits**: [N] commits

---

**Next Steps**:
- Phase [N+1]: [Next Phase Name]
- Run /orchestrate to start next phase
- Or run /status to review progress
```

When blocker encountered:

```markdown
⏸️  Phase Paused - Blocker Encountered

**Phase**: [Phase Name]
**Progress**: [X]/[Y] tasks completed ([Z]%)

**Blocker Details**:
ID: [blocker-XXX]
Type: [MISSING_CREDENTIAL / USER_APPROVAL_REQUIRED / etc]
Agent: [agent-name]
Details: [description]

**To Resolve**:
1. Run /show-blockers to see all blockers
2. Run /fix-blockers for interactive resolution
3. Or manually resolve and update blockers.md

**To Continue**:
After resolving blockers, run /auto-phase again to resume
```

## 🚨 Safety Features

1. **Maximum Iterations**: Stops after 50 iterations to prevent infinite loops
2. **Blocker Detection**: Stops immediately when blocker created
3. **Stale Detection**: Warns if same task fails 3+ times
4. **Progress Display**: Shows progress after each agent run

## 📊 Progress Display

After each iteration:

```
Phase 1 Progress: 7/10 tasks complete (70%)
Just completed: task-1-login-ui
Next: task-1-password-reset

Iteration: 8/50
```

## 🎯 Use Cases

### Use Case 1: Complete Phase 1

```bash
# Initialize project
/start-project

# Complete Phase 0 manually (planning)
/orchestrate  # Product Strategy
/orchestrate  # API Design
/orchestrate  # Database Design
/orchestrate  # System Architect

# Auto-complete Phase 1 (implementation)
/auto-phase

# System will:
# - Implement all Phase 1 tasks
# - Write tests
# - Review code
# - Commit changes
# - Stop when phase complete or blocker encountered
```

### Use Case 2: Continue After Blocker

```bash
# Auto-phase stopped due to blocker
/show-blockers

# Fix the blocker
/fix-blockers

# Continue auto-phase
/auto-phase
```

## ⚠️ Important Notes

- **Save your work**: Auto-phase creates many commits. Ensure git is properly configured
- **Watch for blockers**: Some blockers need user input (API keys, approvals)
- **Monitor progress**: Run /status in another terminal to watch progress
- **Can interrupt**: If needed, let current agent finish, then don't run /auto-phase again
- **Review commits**: After phase completes, review git history

## 💡 Tips

- Run /status before /auto-phase to understand what will be done
- Use /auto-phase for phases with many similar tasks
- For first phase, consider running /orchestrate manually to understand workflow
- Always resolve blockers before running /auto-phase again

Remember: Auto-phase is powerful but you're still in control. It stops for blockers and safety limits!
