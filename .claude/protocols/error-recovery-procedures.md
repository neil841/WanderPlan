# Error Recovery Procedures

This document defines how agents should handle errors and how the system recovers from failures.

## Error Categories

### 1. Recoverable Errors
Errors that the agent can handle automatically without user intervention.

### 2. Blocker Errors
Errors that require user intervention to resolve.

### 3. Critical Errors
Errors that indicate system-level problems requiring immediate attention.

---

## Agent Error Handling Protocol

### Step 1: Detect Error

Every agent operation should be wrapped in error handling:

```javascript
try {
  // Agent work here
  const result = performTask();
  validateResult(result);
} catch (error) {
  handleError(error);
}
```

### Step 2: Classify Error

Determine error category:

**Recoverable Examples**:
- Network timeout (retry possible)
- File temporarily locked (retry possible)
- Rate limit exceeded (backoff and retry)

**Blocker Examples**:
- Missing API key
- Missing required file that user must provide
- User approval needed for decision
- Insufficient permissions

**Critical Examples**:
- project-state.json corrupted
- Unable to write to file system
- Agent lock deadlock detected

### Step 3: Execute Recovery Strategy

---

## Recovery Strategies

### Strategy A: Automatic Retry (Recoverable Errors)

```markdown
1. Log the error (don't escalate yet)
2. Wait with exponential backoff:
   - Attempt 1: immediate
   - Attempt 2: wait 2 seconds
   - Attempt 3: wait 4 seconds
   - Attempt 4: wait 8 seconds
3. Max 3 retry attempts
4. If all attempts fail: Escalate to Strategy B
```

**Example**: Chrome DevTools connection lost
```markdown
Attempt 1: Try to reconnect immediately
Attempt 2: Wait 2s, try again
Attempt 3: Wait 4s, try again
If failed: Log blocker, continue without Chrome validation
```

### Strategy B: Log Blocker (Blocker Errors)

```markdown
1. Create detailed blocker entry in blockers.md:
   ```markdown
   ## [Timestamp] Agent: agent-name
   ### Error Type
   Missing API Key

   ### Context
   Task: Implement authentication
   Phase: phase-1-authentication

   ### What I Need
   Firebase API key for authentication service

   ### How to Provide
   1. Create Firebase project at firebase.google.com
   2. Get API key from project settings
   3. Run: /fix-blockers
   4. Paste API key when prompted

   ### Impact
   Cannot proceed with authentication implementation until resolved
   ```

2. Update project-state.json:
   ```json
   {
     "blockers": [
       {
         "id": "blocker-001",
         "agent": "staff-engineer",
         "type": "missing-credential",
         "description": "Need Firebase API key",
         "createdAt": "2025-11-07T10:30:00Z",
         "resolved": false
       }
     ]
   }
   ```

3. Release agent lock
4. Exit gracefully with clear message to orchestrator
```

### Strategy C: Emergency Stop (Critical Errors)

```markdown
1. DO NOT modify any files
2. Create emergency backup of project-state.json
3. Write to orchestrator-log.md with CRITICAL prefix
4. Create detailed error report in .claude/reports/errors/
5. Notify orchestrator of critical failure
6. Exit immediately
```

---

## Specific Error Scenarios

### Scenario 1: State File Corruption

**Detection**:
```javascript
try {
  const state = JSON.parse(readFile('project-state.json'));
} catch (error) {
  // Corrupted JSON
  handleStateCorruption();
}
```

**Recovery**:
```markdown
1. Check if project-state.backup.json exists
2. If backup valid:
   - Restore from backup
   - Log warning about state corruption
   - Continue operation
3. If backup also corrupted:
   - Check .claude/context/.backups/ for older backups
   - Restore from most recent valid backup
   - Alert user of data loss
4. If no valid backups:
   - Log CRITICAL error
   - Request user to run /reset-state
   - Halt all operations
```

### Scenario 2: Agent Lock Deadlock

**Detection**:
```javascript
const lockAge = now - state.agentLockTimestamp;
if (lockAge > 30 * 60 * 1000 && state.activeAgent !== null) {
  // Lock held for >30 minutes, likely deadlock
  handleStaleLock();
}
```

**Recovery**:
```markdown
1. Log warning: "Stale lock detected for agent: {activeAgent}"
2. Check orchestrator-log.md for last known activity
3. If no activity in 30+ minutes:
   - Clear the lock:
     ```json
     {
       "activeAgent": null,
       "agentLockTimestamp": null
     }
     ```
   - Log to orchestrator-log.md: "Cleared stale lock"
4. Increment staleLockCount metric
5. Continue with current agent
```

### Scenario 3: Missing Required File

**Detection**:
```javascript
if (!fileExists('.claude/specs/implementation-tasks.md')) {
  throw new BlockerError('Required file missing');
}
```

**Recovery**:
```markdown
1. Identify which agent should have created the file
2. Check if that phase was actually completed
3. If phase incomplete:
   - Log blocker: "Cannot proceed - Phase 0 incomplete"
   - Suggest: "Run /orchestrate to complete Phase 0"
   - Exit cleanly
4. If phase marked complete but file missing:
   - Log CRITICAL error
   - Suggest: "Run /rollback phase-0 and re-run"
   - Exit cleanly
```

### Scenario 4: Validation Failure Loop

**Detection**:
```javascript
const attempts = state.currentTaskAttempts || 0;
if (attempts >= 3) {
  handleMaxRetriesExceeded();
}
```

**Recovery**:
```markdown
1. After 3 failed validation attempts:
   - Stop trying
   - Document what was attempted
   - Document what validation failures occurred
   - Log detailed blocker:
     ```markdown
     ## Validation Failure After 3 Attempts

     Task: Build login UI
     Agent: staff-engineer

     Attempts:
     1. Missing error handling → Fixed
     2. Accessibility issues → Fixed
     3. Performance below threshold → Unable to fix

     Final Issue:
     Performance score: 65/100 (target: 80/100)
     Bottleneck: Large bundle size (2.5MB)

     Suggestions:
     - Code splitting required
     - Or: Lower performance threshold for this feature

     User Decision Needed:
     1. Should I implement code splitting? (adds complexity)
     2. Or accept lower performance for now?
     ```
   - Reset attempt counter
   - Exit cleanly
```

### Scenario 5: Chrome DevTools Connection Loss

**Detection**:
```javascript
try {
  await chromeDevTools.connect();
} catch (error) {
  handleChromeConnectionError(error);
}
```

**Recovery**:
```markdown
1. Attempt reconnection with exponential backoff (3 attempts)
2. If all attempts fail:
   - Log warning (not blocker)
   - Continue WITHOUT Chrome validation
   - Add note to agent-handoffs.md:
     ```markdown
     ⚠️ Chrome DevTools validation SKIPPED
     Reason: Unable to connect to Chrome
     Impact: UI not visually validated
     Recommendation: Manually test UI after deployment
     ```
3. Mark task as completed but flagged for manual review
4. Increment skippedValidations metric
```

### Scenario 6: Test Failures

**Detection**:
```javascript
const testResults = runTests();
if (testResults.failed > 0) {
  handleTestFailures(testResults);
}
```

**Recovery**:
```markdown
1. First test failure:
   - Analyze failure reasons
   - If code issue detected: Attempt auto-fix
   - Re-run tests

2. Second test failure:
   - Generate detailed failure report
   - Check if failures are in new code or existing code
   - If existing code: Skip (not this agent's responsibility)
   - If new code: Attempt more targeted fix
   - Re-run tests

3. Third test failure:
   - Log blocker with full test output
   - Document what fixes were attempted
   - Request code review from Senior Code Reviewer
   - Do NOT mark task as complete
   - Exit cleanly
```

### Scenario 7: Dependency Installation Failure

**Detection**:
```javascript
const installResult = exec('npm install new-package');
if (installResult.exitCode !== 0) {
  handleDependencyError(installResult);
}
```

**Recovery**:
```markdown
1. Check npm registry status
2. Try with --force flag
3. Try with --legacy-peer-deps
4. If all fail:
   - Check if package exists
   - Check if version valid
   - Log blocker:
     ```markdown
     ## Dependency Installation Failed

     Package: @some/package@1.2.3
     Error: 404 Not Found

     Possible Causes:
     1. Package name misspelled
     2. Version doesn't exist
     3. Package removed from npm

     User Action:
     1. Verify package name: npm search @some/package
     2. Check available versions
     3. Run /fix-blockers to specify correct package
     ```
```

---

## Rollback Procedures

### Task Rollback

```markdown
User runs: /rollback task

System:
1. Read project-state.json to identify last completed task
2. Read agent-handoffs.md to see what files were changed
3. Use git to revert those file changes:
   ```bash
   git revert <commit-hash>
   ```
4. Update project-state.json:
   - Mark task as "pending" (not "completed")
   - Decrement completedTasks counter
5. Log rollback action to orchestrator-log.md
```

### Phase Rollback

```markdown
User runs: /rollback phase

System:
1. Confirm with user (this is destructive)
2. Read current phase from project-state.json
3. Delete phase branch:
   ```bash
   git branch -D phase-{N}-{name}
   ```
4. Checkout previous phase branch
5. Update project-state.json:
   - Set currentPhase to previous phase
   - Mark current phase as "pending"
   - Clear all tasks in current phase
6. Delete reports for current phase
7. Log rollback to orchestrator-log.md
```

### Agent Rollback

```markdown
User runs: /rollback agent

System:
1. Read agent-handoffs.md to find last agent's changes
2. Revert those specific file changes
3. Update project-state.json to state before agent ran
4. Keep agent-handoffs.md entry (for audit trail)
5. Log rollback to orchestrator-log.md
```

---

## Monitoring & Alerts

### Metrics to Track

```json
{
  "errorMetrics": {
    "totalErrors": 15,
    "recoverableErrors": 10,
    "blockerErrors": 4,
    "criticalErrors": 1,
    "averageRecoveryTime": "45s",
    "staleLocks": 0,
    "skippedValidations": 2
  }
}
```

### Alert Thresholds

```markdown
CRITICAL ALERTS (notify immediately):
- Critical error occurred
- Stale lock count > 0
- State corruption detected

WARNING ALERTS (review recommended):
- Blocker count > 3
- Skipped validations > 5
- Test failure rate > 30%

INFO ALERTS (normal operation):
- Recoverable errors (auto-fixed)
- Single blocker (expected)
```

---

## Best Practices

1. **Fail Fast**: Detect errors early, don't continue with bad state
2. **Fail Safe**: Never leave system in corrupted state
3. **Fail Loud**: Log clearly what went wrong and why
4. **Fail Helpful**: Provide actionable steps to resolve
5. **Fail Traceable**: Keep audit trail of all errors

---

## Testing Error Recovery

Before deploying, test these scenarios:

- [ ] Corrupt project-state.json → System restores from backup
- [ ] Kill agent mid-execution → Stale lock cleared on next run
- [ ] Delete required file → Blocker logged appropriately
- [ ] Fail validation 3 times → Escalates to blocker
- [ ] Chrome DevTools down → Continues without validation
- [ ] Tests fail → Attempts fix, then escalates

---

This comprehensive error recovery system ensures the agentic loop is resilient and maintainable.
