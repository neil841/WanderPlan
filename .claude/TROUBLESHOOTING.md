# Agentic System - Troubleshooting Guide

Complete troubleshooting guide for common issues encountered when using the agentic development system.

---

## Table of Contents

1. [Project Initialization Issues](#project-initialization-issues)
2. [Agent Execution Problems](#agent-execution-problems)
3. [Blocker Resolution](#blocker-resolution)
4. [State Management Issues](#state-management-issues)
5. [Integration Problems](#integration-problems)
6. [Performance Issues](#performance-issues)
7. [Testing Failures](#testing-failures)
8. [Git Workflow Issues](#git-workflow-issues)
9. [Deployment Problems](#deployment-problems)
10. [Recovery Procedures](#recovery-procedures)

---

## Project Initialization Issues

### Issue: `/start-project` doesn't create files

**Symptoms**:
```
✅ Project Initialized: MyApp
But .claude/context/project-state.json doesn't exist
```

**Cause**: File write permissions or path issues

**Solutions**:
1. Check directory permissions:
   ```bash
   ls -la .claude/context/
   # Should show write permissions
   ```

2. Verify `.claude/` directory structure exists:
   ```bash
   mkdir -p .claude/context
   mkdir -p .claude/specs
   mkdir -p .claude/reports
   mkdir -p .claude/design
   mkdir -p .claude/learning
   ```

3. Re-run `/start-project`

---

### Issue: User input validation fails unexpectedly

**Symptoms**:
```
You: TaskApp
System: App name must be 3-50 characters
```

**Cause**: Extra whitespace or special characters

**Solutions**:
1. Trim whitespace from input
2. Remove special characters
3. Provide cleaner input: `TaskApp` instead of ` TaskApp ` or `Task-App!`

---

### Issue: Project state becomes corrupted

**Symptoms**:
```
Error: Cannot parse project-state.json
Invalid JSON at line 45
```

**Cause**: Manual editing introduced syntax error

**Solutions**:
1. **Immediate fix**: Restore from backup
   ```bash
   cp .claude/context/project-state.json.backup .claude/context/project-state.json
   ```

2. **If no backup**: Validate JSON
   ```bash
   cat .claude/context/project-state.json | jq '.'
   # Shows syntax error location
   ```

3. **Fix the JSON**:
   - Common issues: Missing comma, trailing comma, unquoted strings
   - Use a JSON validator: https://jsonlint.com/

4. **Prevention**: Always use agents to update state, avoid manual edits

---

## Agent Execution Problems

### Issue: "Agent stuck in in-progress state"

**Symptoms**:
```
⏳ Agent staff-engineer is currently working...
Started: 3 hours ago
```

**Cause**: Agent crashed or took >30 minutes

**Diagnosis**:
1. Check agent-handoffs.md for last update:
   ```bash
   tail -n 50 .claude/context/agent-handoffs.md
   ```

2. Check orchestrator-log.md for errors:
   ```bash
   tail -n 100 .claude/context/orchestrator-log.md | grep ERROR
   ```

**Solutions**:

**Option 1: Wait for auto-clear** (if <30 min old)
- Orchestrator clears stale locks after 30 minutes
- Run `/orchestrate` again after 30 min

**Option 2: Manual clear** (if critical)
```javascript
// Edit project-state.json
{
  "activeAgent": null,  // Clear the agent
  "agentLockTimestamp": null  // Clear the timestamp
}
```

**Option 3: Rollback task**
```bash
/rollback task
```

---

### Issue: "Agent spawns but doesn't do anything"

**Symptoms**:
```
🤖 Running: Staff Engineer
Agent working...
[No updates for 5+ minutes]
```

**Cause**: Agent missing required context files

**Diagnosis**:
```bash
# Check if required files exist
ls -la .claude/specs/implementation-tasks.md
ls -la .claude/specs/api-specs.yaml
ls -la .claude/specs/db-schema.md
```

**Solutions**:
1. If files missing, previous Phase 0 agents didn't complete:
   ```bash
   /status  # Check which Phase 0 tasks are pending
   /orchestrate  # Run missing Phase 0 agents
   ```

2. If files exist but empty:
   - Roll back to Phase 0
   - Re-run the agents that should have created them

3. Check agent instructions file exists:
   ```bash
   ls -la .claude/commands/agents/staff-engineer.md
   ```

---

### Issue: "Circular dependency between agents"

**Symptoms**:
```
Agent A waiting for Agent B
Agent B waiting for Agent A
```

**Cause**: Implementation tasks have circular dependencies

**Solutions**:
1. Read implementation-tasks.md to identify the loop
2. Update task dependencies to break the cycle
3. Or re-run system-architect to regenerate tasks:
   ```bash
   /rollback task  # rollback to system-architect
   # Edit project-idea.md to clarify feature dependencies
   /orchestrate  # Re-run system-architect
   ```

---

### Issue: "Agent fails with validation error"

**Symptoms**:
```
❌ Staff Engineer failed
Error: Validation error - missing acceptance criteria
```

**Cause**: Implementation task missing required fields

**Solutions**:
1. Read the specific task in implementation-tasks.md
2. Ensure it has:
   - Task ID
   - Title
   - Acceptance criteria (list)
   - Dependencies
   - Complexity estimate
3. If missing, update the task or regenerate implementation-tasks.md

---

## Blocker Resolution

### Issue: "Too many blockers accumulating"

**Symptoms**:
```
⚠️  10 unresolved blockers
System paused
```

**Cause**: Issues not being addressed as they arise

**Solutions**:
1. **Triage blockers by severity**:
   ```bash
   /show-blockers
   ```

2. **Resolve critical blockers first**:
   - `MISSING_CREDENTIAL` - Provide API keys
   - `USER_APPROVAL_REQUIRED` - Make decisions
   - `CONFIGURATION_ERROR` - Fix config

3. **Batch resolve** similar blockers:
   ```bash
   /fix-blockers
   # Resolve all MISSING_CREDENTIAL together
   ```

4. **Consider rollback** if fundamental issue:
   ```bash
   /rollback phase  # Start over with better planning
   ```

---

### Issue: "Blocker resolution doesn't work"

**Symptoms**:
```
User: Approve all features
System: Blocker still unresolved
```

**Cause**: Blocker metadata not updated

**Solutions**:
1. **Check blockers.md** for the specific blocker
2. **Manually mark as resolved**:
   ```markdown
   ## Blocker: blocker-001
   Status: Resolved  ← Change this
   Resolved At: 2025-01-08T15:30:00Z  ← Add this
   Resolution: User approved all features  ← Add this
   ```

3. **Update project-state.json**:
   ```json
   {
     "blockers": []  // Remove the blocker ID
   }
   ```

4. **Run /orchestrate** to continue

---

### Issue: "Stale blockers from days ago"

**Symptoms**:
```
⚠️  Blocker from 3 days ago still blocking progress
```

**Cause**: Forgotten or unclear resolution steps

**Solutions**:
1. **Review the blocker**:
   ```bash
   /show-blockers
   ```

2. **If no longer relevant**:
   - Mark as resolved manually in blockers.md
   - Add note: "Resolved: No longer applicable"

3. **If still relevant but stuck**:
   - Escalate: Ask for help or clarification
   - Or skip: Mark as "deferred" and work on other tasks

---

## State Management Issues

### Issue: "project-state.json out of sync with reality"

**Symptoms**:
```
project-state.json shows: task-1-auth: "completed"
But src/app/api/auth/ doesn't exist
```

**Cause**: State updated but work not actually done

**Solutions**:
1. **Verify actual code exists**:
   ```bash
   git status
   git log  # Check recent commits
   ```

2. **If code doesn't exist**:
   - Update state back to "pending"
   - Re-run the agent

3. **If code exists but not committed**:
   - Run git-workflow-agent to commit
   - Or commit manually

4. **Prevention**: Always let agents complete fully

---

### Issue: "Metrics don't match reality"

**Symptoms**:
```
project-state.json shows:
  completedTasks: 10
But only 7 tasks marked "completed"
```

**Cause**: Metrics not updated when tasks completed

**Solutions**:
1. **Recalculate metrics** manually:
   ```javascript
   // Count completed tasks
   const completed = Object.values(phases).reduce((acc, phase) => {
     return acc + Object.values(phase.tasks).filter(s => s === 'completed').length;
   }, 0);

   // Update project-state.json
   "metrics": {
     "completedTasks": completed,  // Use calculated value
     "totalTasks": totalTaskCount
   }
   ```

2. **Or reset metrics**:
   ```bash
   # Let orchestrator recalculate on next run
   "metrics": { "totalTasks": 0, "completedTasks": 0 }
   ```

---

## Integration Problems

### Issue: "API and Database schema mismatch"

**Symptoms**:
```
API expects field "userId" but Prisma has "user_id"
```

**Cause**: Inconsistent naming between API and DB design

**Solutions**:
1. **Choose one naming convention**:
   - Option A: camelCase everywhere (userId)
   - Option B: snake_case everywhere (user_id)
   - Option C: camelCase in API, snake_case in DB (use @@map)

2. **Update Prisma schema** with mapping:
   ```prisma
   model User {
     userId String @id @map("user_id")  // Maps userId to user_id in DB
   }
   ```

3. **Or regenerate** both API and DB schemas:
   ```bash
   /rollback phase  # Back to Phase 0
   # Update consistency rules in CLAUDE.md
   /orchestrate  # Re-run api-contract-designer
   /orchestrate  # Re-run database-designer
   ```

---

### Issue: "Missing API endpoints for features"

**Symptoms**:
```
Feature: "User can edit profile"
But no PUT /api/users/:id endpoint exists
```

**Cause**: API designer missed the endpoint

**Solutions**:
1. **Add endpoint to api-specs.yaml**:
   ```yaml
   /api/users/{id}:
     put:
       summary: Update user profile
       parameters:
         - name: id
           in: path
           required: true
           schema:
             type: string
       requestBody:
         content:
           application/json:
             schema:
               $ref: '#/components/schemas/UpdateUserInput'
   ```

2. **Update implementation-tasks.md** to include the endpoint

3. **Re-run staff-engineer** for that task

---

## Performance Issues

### Issue: "/orchestrate takes a long time"

**Symptoms**:
```
User runs: /orchestrate
[Waits 5+ minutes for agent to start]
```

**Cause**: Decision tree checking many conditions

**Solutions**:
1. **Use /auto-phase** instead for bulk operations:
   ```bash
   /auto-phase  # Runs multiple /orchestrate in loop
   ```

2. **Skip non-critical checks** (fast mode):
   - Set environment variable: `FAST_MODE=true`
   - Skips some enhancement agents

3. **Parallelize when possible**:
   - Accessibility + Performance agents can run in parallel
   - Update orchestrator to spawn parallel agents

---

### Issue: "Agents timeout after 30 minutes"

**Symptoms**:
```
⚠️  Agent staff-engineer exceeded 30 minute timeout
Lock cleared automatically
```

**Cause**: Task too complex or agent stuck

**Solutions**:
1. **Break task into smaller sub-tasks**:
   - Edit implementation-tasks.md
   - Split large task into 2-3 smaller tasks
   - Each <30 min of work

2. **Simplify acceptance criteria**:
   - Remove non-essential criteria
   - Move to separate task

3. **Increase timeout** (not recommended):
   - Edit orchestrator timeout from 30min to 60min
   - But investigate why task takes so long

---

## Testing Failures

### Issue: "Tests fail after implementation"

**Symptoms**:
```
npm test
FAIL  src/__tests__/auth/login.test.ts
  Expected status 200, got 500
```

**Cause**: Implementation doesn't match API contract

**Solutions**:
1. **Read the test failure**:
   ```bash
   npm test -- --verbose
   ```

2. **Common fixes**:
   - Check API route returns correct status codes
   - Verify response schema matches api-specs.yaml
   - Ensure error handling works

3. **If test is wrong**:
   - Update test to match actual (correct) behavior
   - Document why test was wrong

4. **If implementation is wrong**:
   - Fix the implementation to match specs
   - Or update specs if they were incorrect

---

### Issue: "E2E tests flaky"

**Symptoms**:
```
E2E tests pass sometimes, fail other times
Error: Element not found: button[type="submit"]
```

**Cause**: Race conditions, slow loading

**Solutions**:
1. **Add proper waits** in Playwright:
   ```typescript
   // ❌ BAD: No wait
   await page.click('button[type="submit"]');

   // ✅ GOOD: Wait for element
   await page.waitForSelector('button[type="submit"]');
   await page.click('button[type="submit"]');
   ```

2. **Increase timeouts**:
   ```typescript
   test.setTimeout(30000);  // 30 seconds
   ```

3. **Use better selectors**:
   ```typescript
   // ❌ BAD: Brittle selector
   await page.click('button:nth-child(2)');

   // ✅ GOOD: Semantic selector
   await page.click('button[aria-label="Submit form"]');
   ```

---

## Git Workflow Issues

### Issue: "Commits missing Co-Authored-By"

**Symptoms**:
```
git log shows:
  feat(auth): add login

But missing:
  Co-Authored-By: Claude <noreply@anthropic.com>
```

**Cause**: git-workflow-agent not using heredoc format

**Solutions**:
1. **Update last commit** (if not pushed):
   ```bash
   git commit --amend
   # Add Co-Authored-By line manually
   ```

2. **Fix git-workflow-agent instructions**:
   - Verify it uses heredoc format for commit messages
   - See rollback.md for correct format

3. **For future commits**:
   - git-workflow-agent should auto-include Co-Authored-By

---

### Issue: "Merge conflicts during rollback"

**Symptoms**:
```
/rollback task
Error: Merge conflict in src/app/api/auth/route.ts
```

**Cause**: File changed since the commit being reverted

**Solutions**:
1. **Resolve conflicts manually**:
   ```bash
   # Git will mark conflicts
   code src/app/api/auth/route.ts
   # Fix conflicts (remove <<<, ===, >>> markers)
   git add src/app/api/auth/route.ts
   git revert --continue
   ```

2. **Or abort rollback**:
   ```bash
   git revert --abort
   # Try different approach (manual fix instead of rollback)
   ```

---

## Deployment Problems

### Issue: "Build fails in production"

**Symptoms**:
```
Vercel deployment failed
Error: Type error in src/app/api/users/route.ts
```

**Cause**: TypeScript errors not caught locally

**Solutions**:
1. **Run type check locally**:
   ```bash
   npm run type-check
   # or
   npx tsc --noEmit
   ```

2. **Fix type errors**:
   - Add proper types
   - Use `as` type assertions carefully
   - Avoid `any` types

3. **Update tsconfig.json** for stricter checking:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

---

### Issue: "Environment variables missing in production"

**Symptoms**:
```
Runtime error: DATABASE_URL is not defined
```

**Cause**: Forgot to set env vars in Vercel/hosting

**Solutions**:
1. **Check .env.example** for required vars:
   ```bash
   cat .env.example
   ```

2. **Set in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add each variable from .env.example
   - Redeploy

3. **Validate env vars** at runtime:
   ```typescript
   if (!process.env.DATABASE_URL) {
     throw new Error('DATABASE_URL is required');
   }
   ```

---

## Recovery Procedures

### Complete Project Reset

If project is completely broken:

```bash
# 1. Backup current state
cp -r .claude .claude.backup

# 2. Reset to initial state
rm -rf .claude/context/*
rm -rf .claude/specs/*
rm -rf .claude/reports/*

# 3. Re-initialize
/start-project
# Provide project details again

# 4. Re-run Phase 0
/orchestrate  # product-strategy
/orchestrate  # api-design
/orchestrate  # database-design
/orchestrate  # system-architect
```

---

### Partial Rollback

If only one phase is broken:

```bash
# 1. Check current phase
/status

# 2. Rollback to start of phase
/rollback phase

# 3. Fix the issues in specs
code .claude/specs/implementation-tasks.md

# 4. Restart phase
/orchestrate
```

---

### Emergency Manual Fix

If you need to fix something quickly:

```bash
# 1. Bypass agents, edit files directly
code src/app/api/auth/route.ts

# 2. Test manually
npm run dev
# Test in browser

# 3. Commit manually
git add .
git commit -m "fix: manual emergency fix for auth issue"

# 4. Update project state
code .claude/context/project-state.json
# Mark task as "completed"

# 5. Continue with agents
/orchestrate
```

⚠️ **Warning**: Manual fixes should be rare. Always prefer using agents when possible.

---

## Getting Help

If troubleshooting doesn't resolve the issue:

1. **Check logs**:
   ```bash
   tail -n 200 .claude/context/orchestrator-log.md
   tail -n 200 .claude/context/agent-handoffs.md
   ```

2. **Check blockers**:
   ```bash
   /show-blockers
   ```

3. **Review recent commits**:
   ```bash
   git log --oneline -20
   ```

4. **Share context** when asking for help:
   - Current phase
   - Current task
   - Last successful agent
   - Error messages
   - Relevant log excerpts

---

Remember: Most issues can be resolved by:
1. Checking state files
2. Reading error messages carefully
3. Using /rollback when needed
4. Re-running agents after fixes

The system is designed to be resilient. Don't panic! 🚀
