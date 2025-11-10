# Agentic System - Performance Optimization Guide

Strategies to maximize the speed and efficiency of the agentic development workflow.

---

## Table of Contents

1. [Workflow Optimization](#workflow-optimization)
2. [Agent Performance](#agent-performance)
3. [Parallel Execution](#parallel-execution)
4. [Caching Strategies](#caching-strategies)
5. [Resource Management](#resource-management)
6. [Bottleneck Identification](#bottleneck-identification)

---

## Workflow Optimization

### Use /auto-phase for Bulk Operations

**Scenario**: Implementing Phase 2 with 8 tasks

**Manual Approach** (slow):
```bash
# Total time: ~2-3 hours of manual /orchestrate commands
/orchestrate  # Task 2.1 - staff-engineer (15 min)
/orchestrate  # Task 2.1 - qa-testing (10 min)
/orchestrate  # Task 2.1 - code-review (8 min)
/orchestrate  # Task 2.1 - git-workflow (2 min)
# Repeat 7 more times...
```

**Optimized Approach** (fast):
```bash
# Total time: Same duration, but hands-free
/auto-phase  # Runs all tasks autonomously until blocker or completion
```

**Time Saved**: ~1.5 hours of manual intervention

**Metrics**:
- Manual: 35 minutes per task × 8 tasks = 280 minutes (4.7 hours)
- Auto: 280 minutes of agent work, but 0 minutes of your time

---

### Batch Similar Tasks Together

**Inefficient**:
```markdown
## implementation-tasks.md
Phase 1: Auth
  - task-1-login
Phase 2: Profile
  - task-2-profile-view
Phase 3: Back to Auth
  - task-3-password-reset  # ← Related to Phase 1, but separate phase
```

**Optimized**:
```markdown
## implementation-tasks.md
Phase 1: Authentication & User Management (grouped)
  - task-1-login
  - task-2-password-reset
  - task-3-profile-view
  - task-4-profile-edit
```

**Why Faster**:
- Context switching reduced
- Agent reads same specs once for all related tasks
- Tests can be batched (1 test suite instead of 3)

---

### Skip Non-Critical Enhancement Agents in Development

**Full Quality Mode** (production):
```javascript
// Every task runs:
staff-engineer → qa-testing → code-review → git-workflow
  ↓
If complexity >10: code-refactorer
  ↓
If has UI: accessibility + performance agents
  ↓
Phase complete: security + documentation agents
```

**Fast Development Mode** (prototyping):
```javascript
// Every task runs:
staff-engineer → qa-testing (unit only) → git-workflow

// Skip:
- code-refactorer (unless critical)
- accessibility-compliance (run once at end)
- performance-monitoring (run once at end)
- security-agent (run before production only)
```

**Configuration** (.claude/context/mode.json):
```json
{
  "mode": "fast",  // or "quality"
  "skip": [
    "code-refactorer",
    "accessibility-compliance-agent",
    "performance-monitoring-agent"
  ]
}
```

**Time Saved**: ~40% faster iterations

⚠️ **Warning**: Always run full quality mode before production deployment!

---

## Agent Performance

### Optimize Task Granularity

**Too Large** (slow):
```markdown
### Task 1.1: Complete User Management System
**Complexity**: XL (Extra Large)
**Time**: 4-6 hours
**Includes**:
- Registration, login, logout
- Profile management
- Settings page
- Password reset
- Email verification
- Social login
```

**Problems**:
- Single agent timeout (>30 min limit)
- Hard to review
- If fails, lose lots of work

**Optimized** (fast):
```markdown
### Task 1.1: User Registration
**Complexity**: M (Medium)
**Time**: 2-3 hours

### Task 1.2: User Login
**Complexity**: S (Small)
**Time**: 1-2 hours

### Task 1.3: Password Reset
**Complexity**: S (Small)
**Time**: 1-2 hours
```

**Benefits**:
- No timeouts
- Easier to review incrementally
- If one fails, others unaffected
- Can run in parallel (different devs)

**Rule of Thumb**: Tasks should be <3 hours of agent work

---

### Reduce Context Loading

**Slow Agent**:
```javascript
// staff-engineer reads everything every time
reads: project-brief.md (not needed anymore)
reads: personas.md (not needed for implementation)
reads: api-specs.yaml (all 2000 lines)
reads: db-schema.md (all models)
reads: implementation-tasks.md (all tasks)
```

**Fast Agent**:
```javascript
// staff-engineer reads only what's needed
reads: implementation-tasks.md (current task only)
reads: api-specs.yaml (relevant endpoints only)
reads: db-schema.md (relevant models only)
```

**Optimization** (in agent instructions):
```markdown
### Step 3: Read Required Context

**MUST READ** (always):
- Current task from implementation-tasks.md (lines X-Y only)
- Relevant API endpoints from api-specs.yaml (search for task-related endpoints)
- Relevant DB models from schema.prisma (search for task-related models)

**SKIP** (not needed):
- project-brief.md (Phase 0 only)
- personas.md (Phase 0 only)
- Full api-specs.yaml (too large)
```

**Time Saved**: ~30% faster agent initialization

---

## Parallel Execution

### Parallel Agent Spawning

**Sequential** (slow):
```javascript
// orchestrator spawns one at a time
await spawnAgent("accessibility-compliance-agent");  // 10 min
await spawnAgent("performance-monitoring-agent");    // 10 min
// Total: 20 minutes
```

**Parallel** (fast):
```javascript
// orchestrator spawns simultaneously
await Promise.all([
  spawnAgent("accessibility-compliance-agent"),  // 10 min
  spawnAgent("performance-monitoring-agent"),    // 10 min
]);
// Total: 10 minutes
```

**When Safe to Parallelize**:
✅ accessibility + performance (independent)
✅ Multiple code-refactoring tasks (different files)
✅ Documentation generation + CI/CD setup (different outputs)

**When NOT Safe**:
❌ staff-engineer + qa-testing (qa needs code first)
❌ code-review + git-workflow (git needs review to pass)
❌ api-design + database-design (may have dependencies)

---

### Parallel Phase Execution (Advanced)

**Sequential Phases** (default):
```
Phase 1: Auth (3 tasks) - 2 days
  ↓ wait
Phase 2: Profiles (2 tasks) - 1 day
  ↓ wait
Phase 3: Trips (5 tasks) - 3 days
Total: 6 days
```

**Parallel Phases** (if independent):
```
Phase 1: Auth (3 tasks) ────┐
Phase 2: Trips (5 tasks) ───┤─ All run simultaneously
Phase 3: Payments (4 tasks) ┘
Total: 3 days (longest phase)
```

**Requires**:
- Phases must be independent (no shared code)
- Careful merge conflict management
- Multiple agent instances

**Setup**:
```bash
# Terminal 1
cd project
/auto-phase  # Phase 1

# Terminal 2
cd project-copy
/auto-phase  # Phase 2

# Merge when both complete
```

**Time Saved**: 50% if phases are independent

---

## Caching Strategies

### Cache Agent Decisions

**Problem**: Orchestrator recalculates decisions every time

**Without Cache**:
```javascript
// Every /orchestrate call
read project-state.json
read implementation-tasks.md
parse all tasks
determine next task
check dependencies
select agent
// Total: ~5-10 seconds
```

**With Cache**:
```javascript
// First /orchestrate
[compute as above, cache result]

// Subsequent /orchestrate (if state unchanged)
return cached_next_agent
// Total: <1 second
```

**Implementation** (.claude/cache/orchestrator-cache.json):
```json
{
  "lastStateHash": "abc123def456",
  "nextAgent": "qa-testing-agent",
  "nextTask": "task-1-login",
  "cachedAt": "2025-01-08T15:00:00Z"
}
```

**Cache Invalidation**:
- Invalidate when project-state.json changes
- Invalidate after 10 minutes (stale cache)

---

### Cache API Specs and DB Schemas

**Problem**: Agents re-parse large files repeatedly

**Optimization**:
```javascript
// First agent run
api_specs = parseYAML("api-specs.yaml");  // 2-3 seconds
cache.set("api_specs_v1", api_specs);

// Subsequent agents
api_specs = cache.get("api_specs_v1");  // <100ms
```

**Storage** (.claude/cache/specs-cache.json):
```json
{
  "api_specs_v1": { ...parsed JSON... },
  "db_schema_v1": { ...parsed schema... },
  "cachedAt": "2025-01-08T15:00:00Z"
}
```

---

## Resource Management

### Limit Concurrent Agents

**Problem**: Running too many agents simultaneously overwhelms system

**Bad**:
```javascript
// Spawn 10 agents at once
Promise.all([
  spawn("agent1"), spawn("agent2"), spawn("agent3"),
  spawn("agent4"), spawn("agent5"), spawn("agent6"),
  spawn("agent7"), spawn("agent8"), spawn("agent9"),
  spawn("agent10")
]);
// System crawls, memory issues
```

**Good**:
```javascript
// Limit to 3 concurrent agents
const queue = [agent1, agent2, ..., agent10];
const concurrent = 3;

while (queue.length > 0) {
  const batch = queue.splice(0, concurrent);
  await Promise.all(batch.map(spawn));
}
```

**Recommended Limits**:
- Local development: 2-3 concurrent agents
- CI/CD: 5-10 concurrent agents (more resources)
- Production: 1 agent at a time (safety)

---

### Memory Management

**Problem**: Long-running agents accumulate memory

**Monitoring**:
```javascript
// Before agent starts
const memBefore = process.memoryUsage().heapUsed;

// After agent completes
const memAfter = process.memoryUsage().heapUsed;
const memDelta = (memAfter - memBefore) / 1024 / 1024;

console.log(`Agent used ${memDelta.toFixed(2)} MB`);

if (memDelta > 500) {
  console.warn("Agent used excessive memory!");
}
```

**Cleanup**:
```javascript
// After each agent
clearCache();
global.gc && global.gc();  // Force garbage collection
```

---

## Bottleneck Identification

### Profile Agent Execution Time

**Instrumentation**:
```javascript
// In orchestrator
const start = Date.now();

spawnAgent("staff-engineer");

const duration = Date.now() - start;
logMetric("agent_duration", {
  agent: "staff-engineer",
  task: "task-1-login",
  duration_ms: duration
});
```

**Analysis** (.claude/metrics/agent-performance.json):
```json
{
  "staff-engineer": {
    "avg_duration_ms": 450000,  // 7.5 minutes
    "max_duration_ms": 1800000,  // 30 minutes (timeout)
    "runs": 25
  },
  "qa-testing-agent": {
    "avg_duration_ms": 240000,  // 4 minutes
    "max_duration_ms": 600000,  // 10 minutes
    "runs": 25
  }
}
```

**Identify Bottlenecks**:
```
Slowest agents:
1. staff-engineer (7.5 min avg)  ← Optimize this
2. code-refactorer (6 min avg)
3. senior-code-reviewer (5 min avg)
```

---

### Optimize Slow Agents

**Example**: staff-engineer taking too long

**Diagnosis**:
```bash
# Check what staff-engineer does
tail -f .claude/context/agent-handoffs.md

Findings:
- Reads all 2000 lines of api-specs.yaml (slow)
- Calls premium-ux-designer for every component (slow)
- Writes tests inline with implementation (slow)
```

**Optimizations**:
1. **Read less context**:
   ```javascript
   // Before: Read entire api-specs.yaml
   // After: Search for relevant endpoints only
   grep "POST /api/auth" api-specs.yaml
   ```

2. **Cache UX components**:
   ```javascript
   // Before: Call ux-designer for every form
   // After: Reuse existing form component
   if (componentExists("AuthForm")) {
     reuse("AuthForm");
   } else {
     spawnDesigner();
   }
   ```

3. **Defer test writing**:
   ```javascript
   // Before: Write tests inline
   // After: Let qa-testing-agent write all tests
   ```

**Result**: staff-engineer avg time: 7.5 min → 4 min (47% faster)

---

### Monitor Phase Completion Time

**Tracking**:
```json
// .claude/metrics/phase-performance.json
{
  "phase-0-planning": {
    "duration_ms": 1200000,  // 20 minutes
    "tasks": 4,
    "agents_run": 4
  },
  "phase-1-core-features": {
    "duration_ms": 7200000,  // 2 hours
    "tasks": 10,
    "agents_run": 40  // 10 tasks × 4 agents each
  }
}
```

**Identify Long Phases**:
```
Phase 3: Trip Planning (6 hours) ← Too long, break into 2 phases
Phase 1: Core Auth (2 hours) ← Good
```

---

## Performance Benchmarks

### Target Times

**Phase 0 (Planning)**:
- product-strategy-advisor: 5-10 min
- api-contract-designer: 10-15 min
- database-designer: 8-12 min
- system-architect: 15-25 min
- **Total**: 40-60 min

**Phase 1+ (Implementation, per task)**:
- staff-engineer: 10-20 min
- qa-testing-agent: 5-10 min
- senior-code-reviewer: 5-10 min
- git-workflow-agent: 1-2 min
- **Total per task**: 20-40 min

**Enhancement Agents (per phase)**:
- code-refactorer: 5-10 min
- accessibility-compliance: 8-12 min
- performance-monitoring: 8-12 min
- security-agent: 10-15 min
- technical-documentation: 5-8 min
- devops-agent: 15-20 min
- **Total**: 50-80 min

**Complete Project** (example: 30 tasks across 4 phases):
- Phase 0: 1 hour
- Phase 1-4: 30 tasks × 30 min avg = 15 hours
- Enhancement: 4 phases × 1 hour avg = 4 hours
- **Total**: ~20 hours of agent work

**With /auto-phase**: 20 hours hands-free, overnight runs possible

---

## Quick Wins Checklist

✅ **Use /auto-phase** for hands-free bulk work
✅ **Batch similar tasks** into same phase
✅ **Optimize task granularity** (<3 hours each)
✅ **Parallelize independent agents**
✅ **Cache parsed specs and schemas**
✅ **Skip non-critical agents** during development
✅ **Limit concurrent agents** (2-3 max)
✅ **Monitor agent performance** to find bottlenecks
✅ **Reuse components** instead of regenerating
✅ **Profile and optimize** slow agents

**Expected Speedup**: 30-50% faster overall workflow

---

Build faster without sacrificing quality! 🚀
