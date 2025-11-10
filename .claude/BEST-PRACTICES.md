# Agentic System - Best Practices Guide

Guidelines for getting the most out of the agentic development system.

---

## Table of Contents

1. [Project Planning](#project-planning)
2. [Working with Agents](#working-with-agents)
3. [Code Quality](#code-quality)
4. [Testing Strategy](#testing-strategy)
5. [Git Workflow](#git-workflow)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)
9. [Security Best Practices](#security-best-practices)
10. [Deployment](#deployment)

---

## Project Planning

### ✅ DO: Start with Clear Requirements

**Good**:
```
App Name: TravelBuddy
Purpose: Helps groups of 3-8 friends plan trips together by sharing
         itineraries, splitting costs, and voting on activities
Users: Young professionals (25-35) who take 2-3 group trips per year
Features:
  - Group creation and invites
  - Shared itinerary with voting
  - Expense tracking and splitting
  - Activity suggestions based on location
  - Budget calculator
```

**Bad**:
```
App Name: App
Purpose: Travel stuff
Users: Everyone
Features: Whatever is needed
```

**Why**: Clear requirements lead to better agent decisions and fewer iterations.

---

### ✅ DO: Let Product Strategy Advisor Enhance Your Idea

**Pattern**:
1. Start with 3-5 core features
2. Let product-strategy-advisor suggest 10-15 more
3. Review and approve the valuable ones
4. Result: Comprehensive feature set you might have missed

**Example**:
```
You requested: Login, Trip planning, Expense tracking

Agent suggested:
✅ Password reset (critical - you forgot)
✅ Email verification (security - you forgot)
✅ User profiles (needed - you forgot)
✅ 404/500 pages (polish - you forgot)
⚠️  Social login (nice-to-have - you decide)
⚠️  Push notifications (complex - you decide)
```

**Tip**: Don't rush through Phase 0. It's the foundation for everything.

---

### ✅ DO: Break Large Projects into Phases

**Good** (system-architect output):
```
Phase 1: Core Auth (3 tasks, 1 week)
Phase 2: User Profiles (2 tasks, 3 days)
Phase 3: Trip Planning (5 tasks, 2 weeks)
Phase 4: Expense Tracking (4 tasks, 1 week)
Phase 5: Advanced Features (6 tasks, 2 weeks)
```

**Bad**:
```
Phase 1: Everything (20 tasks, 2 months)
```

**Why**: Smaller phases are easier to review, test, and deploy incrementally.

---

### ❌ DON'T: Skip Phase 0 Agents

**Anti-pattern**:
```
User: I'll just write the code myself and use agents for testing

Result:
- No API contract → staff-engineer confused
- No database schema → incorrect queries
- No task breakdown → agents don't know what to do
```

**Best practice**: Always run all Phase 0 agents, even for small projects.

---

## Working with Agents

### ✅ DO: Let Agents Complete Before Interrupting

**Good Pattern**:
```
User: /orchestrate
[staff-engineer starts]
[Wait 5-15 minutes]
✅ Task completed
User: /orchestrate  # Next agent
```

**Bad Pattern**:
```
User: /orchestrate
[staff-engineer starts]
[After 2 minutes]
User: Actually, change the requirements  # Interrupts agent
Result: Corrupted state, incomplete work
```

**Recovery if you must interrupt**:
```
1. Let current agent finish its current file
2. Use /rollback task to undo
3. Update requirements
4. Re-run agent
```

---

### ✅ DO: Review Agent Outputs

After each Phase 0 agent, review:

- **product-strategy-advisor** → `.claude/specs/project-idea.md`
  - ✓ Features make sense?
  - ✓ Acceptance criteria clear?
  - ✓ Personas representative?

- **api-contract-designer** → `.claude/specs/api-specs.yaml`
  - ✓ All features have endpoints?
  - ✓ Request/response schemas complete?
  - ✓ Validation rules appropriate?

- **database-designer** → `prisma/schema.prisma`
  - ✓ All data requirements covered?
  - ✓ Relationships correct?
  - ✓ Indexes on frequently queried fields?

- **system-architect** → `.claude/specs/implementation-tasks.md`
  - ✓ Tasks granular enough (<1 day each)?
  - ✓ Dependencies make sense?
  - ✓ Acceptance criteria measurable?

---

### ✅ DO: Use `/status` Frequently

**Check progress**:
```bash
/status

Shows:
- Current phase
- Tasks: 7/10 completed (70%)
- Last agent: staff-engineer
- Next: qa-testing-agent
```

**When to check**:
- After each agent completes
- Before running `/orchestrate`
- When debugging issues
- To show progress to stakeholders

---

### ✅ DO: Resolve Blockers Immediately

**Good**:
```
Agent creates blocker: MISSING_CREDENTIAL
User: /show-blockers
      /fix-blockers
      [Provides API key]
      /orchestrate  # Continue immediately
```

**Bad**:
```
Agent creates blocker: MISSING_CREDENTIAL
User: [Ignores it]
      /orchestrate  # 10 more times
Result: 10 more blockers, system stuck
```

**Rule**: Never let blockers accumulate. Resolve within 1 hour of creation.

---

### ❌ DON'T: Manually Edit project-state.json Unless Necessary

**Anti-pattern**:
```
User edits project-state.json:
  "task-1-auth": "completed"  # Marks as done manually
  But code not actually written

Result: State out of sync, agents confused
```

**Best practice**: Let agents update state. Only edit manually for recovery.

---

## Code Quality

### ✅ DO: Trust the Code Review Process

**The system has quality gates**:
```
1. staff-engineer implements
2. qa-testing-agent writes tests
3. senior-code-reviewer reviews
4. If issues: staff-engineer fixes
5. Loop until review passes
6. git-workflow-agent commits
```

**Don't skip steps**:
❌ Don't commit without review
❌ Don't skip testing
❌ Don't ignore review feedback

---

### ✅ DO: Set High Quality Standards

**Configure in CLAUDE.md**:
```markdown
## Quality Standards

- Test Coverage: >80% required
- TypeScript: Strict mode, no `any`
- Accessibility: WCAG 2.1 AA
- Performance: LCP <2.5s, FID <100ms, CLS <0.1
- Security: OWASP Top 10 compliance
- Code Complexity: Max cyclomatic complexity 10
```

**Agents will enforce these standards**.

---

### ✅ DO: Use Enhancement Agents

After core implementation:

```bash
# Code quality
/orchestrate  # code-refactorer (if complexity >10)

# Accessibility
/orchestrate  # accessibility-compliance-agent

# Performance
/orchestrate  # performance-monitoring-agent

# Security
/orchestrate  # security-agent

# Documentation
/orchestrate  # technical-documentation-agent

# Deployment
/orchestrate  # devops-agent
```

**Result**: Production-ready, enterprise-quality code.

---

### ❌ DON'T: Ignore Complexity Warnings

**Anti-pattern**:
```
senior-code-reviewer: "Function complexity: 25 (max: 10)"
User: [Ignores warning]
User: /orchestrate  # Next task

Result: Technical debt accumulates
```

**Best practice**:
```
senior-code-reviewer: "Function complexity: 25"
User: /orchestrate  # Spawns code-refactorer
code-refactorer: Refactors to complexity 6
User: /orchestrate  # Continue
```

---

## Testing Strategy

### ✅ DO: Write Tests for Every Feature

**qa-testing-agent creates**:
- Unit tests (business logic)
- Integration tests (API endpoints)
- Component tests (React components)
- E2E tests (critical user flows)

**Coverage targets**:
- Critical paths: 100%
- Business logic: 90%
- UI components: 80%
- Overall: >80%

---

### ✅ DO: Test Error Cases

**Good test**:
```typescript
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    // Happy path
  });

  it('should return 401 for invalid password', async () => {
    // Error case
  });

  it('should return 403 for unverified email', async () => {
    // Error case
  });

  it('should return 429 for too many attempts', async () => {
    // Rate limiting
  });
});
```

**Bad test**:
```typescript
describe('POST /api/auth/login', () => {
  it('should work', async () => {
    // Only tests happy path
  });
});
```

---

### ✅ DO: Run Tests Before Committing

**The system does this automatically**:
```
1. staff-engineer implements
2. qa-testing-agent writes AND RUNS tests
3. If tests fail → staff-engineer fixes
4. Loop until all tests pass
5. Then commit
```

**Manual testing**:
```bash
npm run test          # Unit + integration
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

---

## Git Workflow

### ✅ DO: Use Semantic Commits

**The system auto-generates**:
```
feat(auth): implement user registration

- Add POST /api/auth/register endpoint
- Add email verification flow
- Create registration UI
- Write unit tests (85% coverage)

Closes #12

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation
- `style`: Formatting, no code change
- `perf`: Performance improvement
- `chore`: Maintenance tasks

---

### ✅ DO: Review Commits Before Pushing

```bash
# After git-workflow-agent commits
git log -1 -p  # Review last commit with diff

# Check:
✓ Commit message clear?
✓ All intended files included?
✓ No accidental files (secrets, node_modules)?
✓ Tests passing?

# Then push
git push
```

---

### ✅ DO: Use Feature Branches

**Pattern**:
```
main (production)
  ├── develop (integration)
  │   ├── feature/auth (Phase 1)
  │   ├── feature/profiles (Phase 2)
  │   └── feature/trips (Phase 3)
```

**Workflow**:
```bash
# Start Phase 1
git checkout -b feature/auth

# Work on phase (agents commit here)
/auto-phase

# Phase complete, merge to develop
git checkout develop
git merge feature/auth

# Test on develop
npm run test

# When ready, merge to main
git checkout main
git merge develop
```

---

### ❌ DON'T: Force Push to Main

**Anti-pattern**:
```bash
git push --force origin main  # ❌ NEVER DO THIS
```

**Why**: Rewrites history, breaks other developers' copies.

**Best practice**: Use `/rollback` to revert commits cleanly.

---

## State Management

### ✅ DO: Backup State Files Regularly

**Auto-backup** (recommended):
```bash
# Add to .git/hooks/post-commit
cp .claude/context/project-state.json .claude/context/project-state.json.backup
cp .claude/context/blockers.md .claude/context/blockers.md.backup
```

**Manual backup**:
```bash
tar -czf claude-state-backup-$(date +%Y%m%d).tar.gz .claude/
```

---

### ✅ DO: Keep State Files in Git

**Add to git**:
```bash
git add .claude/context/project-state.json
git add .claude/context/agent-handoffs.md
git add .claude/context/blockers.md
git add .claude/context/orchestrator-log.md
git commit -m "chore: update project state"
```

**Why**: Track state changes over time, enables rollback.

---

### ❌ DON'T: Modify State During Agent Execution

**Anti-pattern**:
```
Agent running...
User edits project-state.json  # ❌ Race condition
Agent completes, overwrites user's changes
```

**Best practice**: Wait for agent to complete before manual edits.

---

## Error Handling

### ✅ DO: Let Agents Create Blockers

**When agent can't proceed**:
```
Agent detects: Missing Firebase API key
Agent creates: blocker-001 (MISSING_CREDENTIAL)
Agent stops: Waits for user input
User provides: API key via /fix-blockers
Agent continues: Implementation proceeds
```

**Don't bypass blockers** - they indicate real issues.

---

### ✅ DO: Use Rollback Strategically

**When to rollback**:
- ✅ Task implemented incorrectly → `/rollback task`
- ✅ Entire phase has issues → `/rollback phase`
- ✅ Agent made mistakes → `/rollback agent`

**When NOT to rollback**:
- ❌ Minor fixes (just edit the file)
- ❌ Cosmetic changes (create new task)
- ❌ After pushing to remote (breaks others)

---

## Performance Optimization

### ✅ DO: Use /auto-phase for Speed

**Manual** (slow):
```
/orchestrate  # Task 1 - wait
/orchestrate  # Task 2 - wait
/orchestrate  # Task 3 - wait
... 30 times
```

**Auto** (fast):
```
/auto-phase  # Runs all 30 tasks autonomously
```

**When to use**:
- Phase has many similar tasks
- Tasks have clear acceptance criteria
- You trust the agents to work independently

---

### ✅ DO: Run Enhancement Agents in Parallel

**Sequential** (slow):
```
/orchestrate  # accessibility-compliance-agent (10 min)
/orchestrate  # performance-monitoring-agent (10 min)
Total: 20 minutes
```

**Parallel** (fast):
```
orchestrator spawns both agents simultaneously
Total: 10 minutes
```

**Configure in orchestrate.md** for automatic parallel execution.

---

## Security Best Practices

### ✅ DO: Run Security Agent Before Production

```bash
# Before deploying
/orchestrate  # security-agent

Checks:
✓ OWASP Top 10 vulnerabilities
✓ Dependency vulnerabilities (npm audit)
✓ Exposed secrets (.env in git?)
✓ SQL injection risks
✓ XSS vulnerabilities
✓ Authentication bypasses
✓ Authorization issues
```

**Fix all CRITICAL and HIGH issues** before deploying.

---

### ✅ DO: Never Commit Secrets

**Bad**:
```javascript
const API_KEY = "sk_live_abc123def456";  // ❌ Hardcoded
```

**Good**:
```javascript
const API_KEY = process.env.STRIPE_API_KEY;  // ✅ From env

if (!API_KEY) {
  throw new Error('STRIPE_API_KEY is required');
}
```

**Verify**:
```bash
git grep -i "api.key\|secret\|password\|token" | grep -v ".env"
# Should return nothing
```

---

## Deployment

### ✅ DO: Use DevOps Agent for CI/CD

```bash
/orchestrate  # devops-agent

Creates:
- .github/workflows/ci.yml (GitHub Actions)
- .github/workflows/deploy.yml
- Dockerfile
- docker-compose.yml
- .dockerignore
- vercel.json (if using Vercel)
```

**Automated pipeline**:
```
Push to main
  ↓
GitHub Actions runs:
  ├── npm run test (all tests)
  ├── npm run type-check (TypeScript)
  ├── npm run lint (ESLint)
  └── npm run build (Next.js build)
  ↓
If all pass:
  └── Deploy to Vercel
```

---

### ✅ DO: Test in Staging First

**Deployment flow**:
```
develop branch → Staging environment → Test
  ↓
If tests pass
  ↓
main branch → Production environment → Monitor
```

**Never deploy directly to production** without staging validation.

---

### ✅ DO: Monitor After Deployment

**Set up monitoring** (devops-agent helps):
- Error tracking: Sentry
- Performance: Vercel Analytics
- Uptime: UptimeRobot
- Logs: Vercel Logs / CloudWatch

**Alert on**:
- Error rate >1%
- Response time >2s
- Downtime >1 min

---

## Summary: Golden Rules

1. **Never skip Phase 0** - Planning prevents problems
2. **Let agents complete** - Don't interrupt mid-task
3. **Review agent outputs** - Verify before continuing
4. **Resolve blockers immediately** - Don't let them accumulate
5. **Run all quality checks** - Tests, reviews, security
6. **Use semantic commits** - Clear history helps debugging
7. **Backup state files** - Enable recovery
8. **Use /auto-phase** - Save time on bulk work
9. **Run security agent** - Before every deployment
10. **Monitor production** - Know when issues happen

---

Follow these practices and you'll build production-grade applications efficiently and reliably! 🚀
