# Agent Communication Protocol

This protocol MUST be followed by ALL agents in the agentic system to ensure coordinated, error-free operation.

## Core Principles

1. **Single Source of Truth**: All state lives in `project-state.json`
2. **No Direct Agent-to-Agent Calls**: Agents communicate via shared state files
3. **Fail Gracefully**: Log errors to `blockers.md` and exit cleanly
4. **Audit Everything**: Write detailed handoff notes
5. **Validate Prerequisites**: Check all inputs before starting work

---

## Agent Lifecycle Protocol

Every agent MUST implement this exact sequence:

### Phase 1: Initialization (REQUIRED)

```markdown
1. Read `.claude/context/project-state.json`
2. Verify agent identity matches current task requirement
3. Check for stale lock (if lock exists >30min, report and exit)
4. Acquire lock by setting:
   - activeAgent: "your-agent-name"
   - agentLockTimestamp: current timestamp
5. Read relevant context files based on your role:
   - Implementation agents: read `implementation-tasks.md`
   - Review agents: read files changed in current phase
   - Planning agents: read `project-idea.md`
6. Validate all prerequisites exist (files, dependencies, etc.)
7. If prerequisites missing: Log to blockers.md and exit
```

**Example**:
```json
{
  "activeAgent": "staff-engineer",
  "agentLockTimestamp": "2025-11-07T10:30:00Z"
}
```

### Phase 2: Execution (REQUIRED)

```markdown
1. Mark current task as "in-progress" in project-state.json
2. Perform your specialized work
3. Call other agents ONLY via orchestrator (log handoff requests)
4. Document all decisions in appropriate files
5. Validate your work completion:
   - Implementation: Run tests
   - UI work: Validate with Chrome DevTools
   - Review: Ensure all files checked
6. If validation fails: Log specific issues to blockers.md
```

**State Update Example**:
```json
{
  "phases": {
    "phase-1-authentication": {
      "tasks": {
        "task-2-login-ui": "in-progress"
      }
    }
  }
}
```

### Phase 3: Completion (REQUIRED)

```markdown
1. Update project-state.json:
   - Mark task as "completed"
   - Clear activeAgent and agentLockTimestamp
   - Update lastUpdated timestamp
   - Increment metrics

2. Write to agent-handoffs.md:
   - Timestamp and your agent name
   - What you accomplished
   - Files you created/modified
   - What agent should run next
   - Any concerns or potential issues

3. If blockers encountered:
   - Write to blockers.md with clear description
   - Include what you need from user
   - Set blocker status in project-state.json

4. Generate artifacts in appropriate directories:
   - Reports: `.claude/reports/`
   - Specs: `.claude/specs/`
   - Docs: `.claude/docs/`

5. Exit gracefully (return control to orchestrator)
```

**Handoff Example**:
```markdown
## [2025-11-07 10:45:00] staff-engineer → qa-testing-agent

### What I Did
- Implemented login UI component (src/components/Login.tsx)
- Added JWT token management (src/lib/auth.ts)
- Created protected route middleware (src/middleware/auth.ts)
- Validated UI with Chrome DevTools ✓

### Files Changed
- src/components/Login.tsx (new, 150 lines)
- src/lib/auth.ts (new, 80 lines)
- src/middleware/auth.ts (new, 45 lines)
- src/app/login/page.tsx (modified, +25 lines)

### What's Next
- QA Testing Agent should write tests for:
  - Login form validation
  - JWT token creation/verification
  - Protected route middleware
  - Error handling flows

### Potential Issues
- Token refresh logic may need performance optimization
- Consider adding rate limiting for login attempts
```

---

## Error Handling Requirements

### Timeout Handling
- Maximum agent execution time: 10 minutes
- If exceeding 8 minutes: Save progress and prepare for graceful exit
- At 10 minutes: Force save state and exit with timeout error

### Dependency Failures
```markdown
If required file/dependency missing:
1. Do NOT proceed with work
2. Log to blockers.md:
   - What is missing
   - Why you need it
   - How user can provide it
3. Update project-state.json with blocker
4. Exit cleanly
```

### Validation Failures
```markdown
If your work fails validation:
1. Analyze what went wrong
2. If can self-correct within 3 attempts: Try fixing
3. After 3 failed attempts: Log to blockers.md
4. Never enter infinite retry loop
```

### State Corruption Detection
```markdown
If project-state.json is corrupted:
1. Attempt to load project-state.backup.json
2. If backup valid: Restore and continue
3. If backup also corrupted: Log to blockers.md and halt
4. Alert orchestrator to critical failure
```

---

## File Location Conventions

### State Files (`.claude/context/`)
- `project-state.json` - Current state (READ/WRITE by all agents)
- `project-state.backup.json` - Backup before each update (AUTO)
- `agent-handoffs.md` - Agent communication log (APPEND by all agents)
- `blockers.md` - Issues needing user intervention (APPEND when blocked)
- `orchestrator-log.md` - Orchestrator decisions (WRITE by orchestrator)

### Specification Files (`.claude/specs/`)
- `project-idea.md` - Feature list and requirements (READ by most agents)
- `implementation-tasks.md` - Task breakdown (READ by implementation agents)
- `architecture-design.md` - Architecture decisions (READ by all technical agents)
- `api-specs.yaml` - API contracts (READ by Staff Engineer, Backend)
- `db-schema.md` - Database schema (READ by Database, Staff Engineer)
- `personas.md` - User personas (READ by UX Designer, Product Strategy)

### Report Files (`.claude/reports/`)
- `code-review-[phase].md` - Code review findings (WRITE by Senior Code Reviewer)
- `test-results.md` - Test execution results (WRITE by QA Testing Agent)
- `performance-report.md` - Performance metrics (WRITE by Performance Monitoring)
- `accessibility-report.md` - Accessibility findings (WRITE by Accessibility Agent)
- `security-report.md` - Security audit results (WRITE by Security Agent)

---

## Communication Patterns

### Pattern 1: Sequential Handoff
```
Agent A completes → Writes handoff → Updates state → Exits
Orchestrator reads state → Spawns Agent B
Agent B reads handoff → Continues work
```

### Pattern 2: Parallel Validation
```
Staff Engineer completes feature → Updates state
Orchestrator spawns in parallel:
  - Accessibility Agent (reads feature files)
  - Performance Agent (reads feature files)
  - Security Agent (reads feature files)
All complete → Orchestrator aggregates results
```

### Pattern 3: Feedback Loop
```
Agent A completes → Agent B reviews → Finds issues
Agent B writes issues to reports → Updates state
Orchestrator reads state → Re-spawns Agent A with fix instructions
Agent A reads report → Fixes issues → Updates state
Max 3 iterations, then escalate to blocker
```

---

## Agent-Specific Requirements

### For Implementation Agents (Staff Engineer, etc.)
```markdown
MUST:
- Read implementation-tasks.md before starting
- Update task status in project-state.json
- Run tests after implementation
- Validate UI with Chrome DevTools (if UI work)
- Log architectural decisions
- Update file-level documentation

MUST NOT:
- Skip validation steps
- Leave tasks partially complete
- Commit code without testing
```

### For Review Agents (Senior Code Reviewer, etc.)
```markdown
MUST:
- Read all files changed in current phase
- Categorize issues by severity
- Provide file:line references
- Create actionable fix tasks
- Validate against acceptance criteria
- Check test coverage

MUST NOT:
- Provide vague feedback
- Approve code with BLOCKER issues
- Skip automated checks
```

### For Validation Agents (QA, Accessibility, Performance)
```markdown
MUST:
- Run automated checks first
- Generate detailed reports
- Categorize findings by severity
- Provide fix suggestions
- Update metrics

MUST NOT:
- Pass work that fails automated checks
- Skip validation steps for speed
```

---

## Lock Management

### Acquiring Lock
```json
{
  "activeAgent": "your-agent-name",
  "agentLockTimestamp": "2025-11-07T10:30:00Z"
}
```

### Checking Lock
```javascript
const lockAge = now - agentLockTimestamp;
if (lockAge > 30_minutes && activeAgent !== null) {
  // Lock is stale, likely agent crashed
  // Log warning and clear lock
  clearStaleLock();
}
```

### Releasing Lock
```json
{
  "activeAgent": null,
  "agentLockTimestamp": null
}
```

---

## Metrics Tracking

Every agent MUST update metrics on completion:

```json
{
  "metrics": {
    "totalAgentRuns": 25,
    "lastAgentRun": "staff-engineer",
    "agentRunHistory": [
      {
        "agent": "staff-engineer",
        "task": "task-2-login-ui",
        "startTime": "2025-11-07T10:30:00Z",
        "endTime": "2025-11-07T10:45:00Z",
        "duration": "15m",
        "status": "success"
      }
    ]
  }
}
```

---

## Best Practices

1. **Be Idempotent**: Running the same agent twice with same input should produce same output
2. **Be Atomic**: Complete entire task or none of it (use temp files, then move)
3. **Be Observable**: Log everything you do for debugging
4. **Be Defensive**: Validate all inputs, handle all errors
5. **Be Helpful**: Provide clear error messages and next steps
6. **Be Efficient**: Don't reload entire codebase, read only what you need

---

## Violation Consequences

Agents that violate this protocol may cause:
- State corruption
- Lost work
- Infinite loops
- Deadlocks
- Unpredictable behavior

**Always follow this protocol exactly.**
