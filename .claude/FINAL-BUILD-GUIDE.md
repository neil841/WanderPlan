# Final Build Guide - Complete the Agentic System

## 🎯 Current Status

### ✅ COMPLETE (Ready to Use)
1. **Infrastructure** - All protocols, state management, configuration ✓
2. **Commands** - /start-project, /orchestrate, /status ✓
3. **Phase 0 Agents** - All 4 planning agents complete ✓
   - product-strategy-advisor ✓
   - api-contract-designer ✓
   - database-designer ✓
   - system-architect ✓

### 🔨 REMAINING WORK

**Critical for MVP** (5 agents):
1. staff-engineer (implementation)
2. qa-testing-agent (testing)
3. senior-code-reviewer (review)
4. git-workflow-agent (version control)
5. premium-ux-designer (UI/UX)

**Enhancement** (6 agents):
6. code-refactorer
7. accessibility-compliance-agent
8. performance-monitoring-agent
9. technical-documentation-agent
10. devops-agent
11. security-agent

**Commands** (5 commands):
- /auto-phase
- /fix-blockers
- /rollback
- /validate-ui
- /show-blockers

---

## 📋 AGENT TEMPLATE (Copy This for Each Agent)

```markdown
---
name: agent-name
description: Brief description of when to use this agent
model: sonnet
color: blue
---

You are [role description].

---

## ⚙️ AGENT INITIALIZATION (REQUIRED)

### Step 1: Read & Validate State
\`\`\`javascript
1. Read \`.claude/context/project-state.json\`
2. Verify current task is "[task-id]"
3. Verify activeAgent === null OR stale lock >30min
4. Verify prerequisites completed
\`\`\`

### Step 2: Acquire Lock
\`\`\`json
{
  "activeAgent": "agent-name",
  "agentLockTimestamp": "[ISO timestamp]",
  "phases": {
    "[phase-name]": {
      "tasks": {
        "[task-id]": "in-progress"
      }
    }
  }
}
\`\`\`

### Step 3: Read Required Context
- **MUST READ**: [List required files]
- **OPTIONAL**: [List optional files]

---

## 🎯 YOUR MISSION

[What this agent does - 3-5 bullet points]

---

## 📋 YOUR PROCESS

[Step-by-step process this agent follows]

---

## 📤 OUTPUT DELIVERABLES

### Deliverable 1: [filename]

[What this file contains]

---

## ✅ AGENT COMPLETION (REQUIRED)

### Step 1: Update State

\`\`\`json
{
  "activeAgent": null,
  "agentLockTimestamp": null,
  "lastUpdated": "[ISO timestamp]",
  "phases": {
    "[phase]": {
      "tasks": {
        "[task-id]": "completed"
      }
    }
  },
  "metrics": {
    "totalAgentRuns": "[increment]",
    "completedTasks": "[increment]",
    "lastAgentRun": "agent-name"
  }
}
\`\`\`

### Step 2: Write Handoff

\`\`\`markdown
## [Timestamp] agent-name → next-agent

### What I Did
- [Summary]

### Files Created/Modified
- [List]

### What's Next
- [What agent should run next]

### Important Notes
- [Any warnings or concerns]
\`\`\`

### Step 3: Display Summary

\`\`\`markdown
✅ [Agent Name] Complete!

[Summary of work]
[Key stats]
[Next steps]
\`\`\`

---

## 🚨 ERROR HANDLING

[How to handle errors]

---

## 📏 QUALITY STANDARDS

[What makes output high quality]
```

---

## 🚀 CRITICAL AGENTS - DETAILED SPECS

### 1. staff-engineer

**File**: `.claude/commands/agents/staff-engineer.md`

**Mission**:
- Implements tasks from implementation-tasks.md
- Calls Premium UX Designer for UI components
- Uses Chrome DevTools MCP for UI validation
- Writes code with tests
- Updates project state

**Key Capabilities**:
- Read implementation-tasks.md for current task
- Generate Next.js code (App Router, TypeScript)
- Call Premium UX Designer agent (via Task tool)
- Use Chrome DevTools MCP tools:
  - `mcp__chrome-devtools__new_page` - Open page
  - `mcp__chrome-devtools__take_snapshot` - Take UI snapshot
  - `mcp__chrome-devtools__click` - Test interactions
- Write JSDoc comments
- Create tests alongside code
- Log architectural decisions to .claude/reports/decisions.md

**Process**:
1. Read current task from implementation-tasks.md
2. Check acceptance criteria
3. If UI work: Call premium-ux-designer
4. Implement code (components, API routes, lib functions)
5. Write tests
6. Validate with Chrome DevTools if UI
7. Update project-state.json
8. Write handoff

**Output**:
- Source code files
- Test files
- .claude/reports/decisions.md entry

---

### 2. qa-testing-agent

**File**: `.claude/commands/agents/qa-testing-agent.md`

**Mission**:
- Writes unit tests for business logic
- Writes integration tests for API endpoints
- Writes E2E tests for user flows
- Runs test suite
- Reports coverage

**Key Capabilities**:
- Read files created by Staff Engineer
- Generate Jest tests
- Generate Playwright E2E tests
- Run `npm run test`
- Parse test results
- Calculate coverage

**Process**:
1. Read what Staff Engineer built
2. Identify testable units
3. Write unit tests (Jest)
4. Write API tests (Jest + Supertest)
5. Write E2E tests (Playwright) for UI flows
6. Run test suite
7. Check coverage (must be >80% for critical paths)
8. If tests fail: log blocker
9. If coverage low: write more tests
10. Update state

**Output**:
- Test files (*.test.ts, *.spec.ts)
- .claude/reports/test-results.md

---

### 3. senior-code-reviewer

**File**: `.claude/commands/agents/senior-code-reviewer.md`

**Mission**:
- Reviews all code changes in phase
- Categorizes issues by severity
- Creates actionable fix tasks
- Validates acceptance criteria

**Key Capabilities**:
- Use Bash tool to get git diff for phase
- Read all changed files
- Check against acceptance criteria
- Identify issues:
  - BLOCKER: Security issues, data corruption, critical bugs
  - CRITICAL: Performance issues, poor error handling, missing tests
  - MAJOR: Code duplication, complex functions, missing docs
  - MINOR: Style issues, naming improvements

**Process**:
1. Run `git diff` to see all changes in phase
2. Read all changed files
3. Check acceptance criteria from implementation-tasks.md
4. Run automated checks (linter, type checker)
5. Manual review for logic, security, performance
6. Categorize all issues
7. Create code-review-phase-[N].md
8. If BLOCKER issues: halt and create tasks for Staff Engineer
9. Update state

**Output**:
- .claude/reports/code-review-phase-[N].md

---

### 4. git-workflow-agent

**File**: `.claude/commands/agents/git-workflow-agent.md`

**Mission**:
- Creates semantic commits
- Manages branches
- Creates pull requests

**Key Capabilities**:
- Use Bash tool for git commands
- Generate semantic commit messages
- Create feature branches
- Create PRs via `gh` CLI

**Process**:
1. Read what was completed from agent-handoffs.md
2. Stage changed files: `git add [files]`
3. Generate commit message (semantic):
   - feat: New feature
   - fix: Bug fix
   - refactor: Code refactoring
   - test: Add tests
   - docs: Documentation
4. Commit: `git commit -m "message"`
5. If phase complete: Create PR via `gh pr create`
6. Update state

**Output**:
- Git commits
- Git branches
- Pull requests

---

### 5. premium-ux-designer

**File**: `.claude/commands/agents/premium-ux-designer.md`

**Mission**:
- Creates design tokens
- Styles components with shadcn/ui + Tailwind
- Adds animations with Framer Motion
- Ensures WCAG 2.1 AA compliance

**Key Capabilities**:
- Generate Tailwind classes
- Use shadcn/ui components
- Create Framer Motion animations
- Ensure accessibility (ARIA labels, semantic HTML)

**Process**:
1. Receive design requirements from Staff Engineer
2. If first time: Create .claude/design/tokens.json
3. Use shadcn/ui components as base
4. Add Tailwind styling
5. Add Framer Motion animations
6. Ensure keyboard navigation
7. Add ARIA labels
8. Return styled component to Staff Engineer

**Output**:
- .claude/design/tokens.json (first time)
- Styled component code

---

## 🔧 UTILITY COMMANDS - DETAILED SPECS

### /auto-phase

**File**: `.claude/commands/auto-phase.md`

```markdown
---
description: Complete entire current phase autonomously
---

You are running autonomous phase completion.

## Protocol:

1. Loop:
   a. Read project-state.json
   b. Check for blockers → If yes: STOP and notify user
   c. Check if phase complete → If yes: STOP and notify success
   d. Run /orchestrate
   e. Wait for agent completion
   f. Repeat

2. Max iterations: 50 (safety limit)

3. If stuck (same task failing 3x): STOP and escalate

4. Display progress after each agent:
   \`\`\`
   Phase 1 Progress: 7/10 tasks complete (70%)
   Just completed: task-1-login-ui
   Next: task-1-password-reset
   \`\`\`

5. When phase complete:
   \`\`\`
   🎉 Phase 1 Complete!
   - Tasks: 10/10
   - Duration: 2 hours
   - Tests: 45 passing
   - Coverage: 85%

   Run /orchestrate to start Phase 2
   \`\`\`
```

---

### /fix-blockers

**File**: `.claude/commands/fix-blockers.md`

```markdown
---
description: Interactive blocker resolution
---

You are helping user resolve blockers.

## Protocol:

1. Read .claude/context/blockers.md

2. List all unresolved blockers:
   \`\`\`
   You have 2 blockers:

   1. [blocker-001] Need Firebase API key
      Agent: staff-engineer
      Impact: Cannot implement authentication

   2. [blocker-002] Approve suggested features
      Agent: product-strategy-advisor
      Impact: Cannot proceed to API design
   \`\`\`

3. For each blocker, ask user how to resolve

4. User provides resolution

5. Update blockers.md (mark as resolved)

6. Update project-state.json (remove blocker)

7. Display:
   \`\`\`
   ✅ Blocker [blocker-001] resolved!

   Remaining blockers: 1

   Run /orchestrate to continue
   \`\`\`
```

---

### /rollback

**File**: `.claude/commands/rollback.md`

```markdown
---
description: Undo changes (task/phase/agent)
---

You are rolling back changes.

## Usage:
- /rollback task - Undo last completed task
- /rollback phase - Undo entire current phase
- /rollback agent - Undo last agent's changes

## Protocol for /rollback task:

1. Read project-state.json to find last completed task

2. Read agent-handoffs.md to see what files changed

3. Use git to revert those changes:
   \`\`\`bash
   git log --oneline -1  # Get last commit
   git revert <hash>     # Revert it
   \`\`\`

4. Update project-state.json:
   - Mark task as "pending"
   - Decrement completedTasks

5. Log to orchestrator-log.md

6. Display:
   \`\`\`
   ⏪ Rolled back: task-1-login-ui

   Changes reverted:
   - src/components/LoginForm.tsx (deleted)
   - src/app/login/page.tsx (restored)

   Task status: pending

   Run /orchestrate to retry
   \`\`\`

## Safety:
- Confirm with user before rollback
- Create backup before rollback
- Can only rollback uncommitted work or last commit
```

---

### /validate-ui

**File**: `.claude/commands/validate-ui.md`

```markdown
---
description: Manual UI validation with Chrome DevTools
---

You are validating UI manually.

## Protocol:

1. Ask user which URL to validate

2. Use Chrome DevTools MCP:
   \`\`\`javascript
   // Open page
   mcp__chrome-devtools__new_page({ url: "http://localhost:3000/login" })

   // Take snapshot
   mcp__chrome-devtools__take_snapshot()

   // Take screenshot
   mcp__chrome-devtools__take_screenshot()
   \`\`\`

3. Run accessibility checks:
   \`\`\`javascript
   mcp__chrome-devtools__evaluate_script({
     function: \`() => {
       const results = axe.run();
       return results;
     }\`
   })
   \`\`\`

4. Check performance:
   - Use performance API
   - Measure LCP, FID, CLS

5. Display results:
   \`\`\`
   UI Validation Results:

   ✅ Visual: Looks good
   ⚠️  Accessibility: 2 issues found
      - Missing alt text on logo
      - Color contrast too low on button
   ✅ Performance: LCP 1.8s, FID 45ms, CLS 0.05

   Recommendations:
   1. Add alt="Company Logo" to <img>
   2. Increase button contrast ratio
   \`\`\`

6. Save report to .claude/reports/ui-validation-[date].md
```

---

### /show-blockers

**File**: `.claude/commands/show-blockers.md`

```markdown
---
description: Display all current blockers
---

Read .claude/context/blockers.md and display:

\`\`\`
Current Blockers: 2

1. [blocker-001] USER_APPROVAL_REQUIRED
   Agent: product-strategy-advisor
   Created: 2 hours ago
   Status: Unresolved

   Details: User must approve suggested features
   Impact: Cannot proceed with API design

   To resolve: Review .claude/specs/project-idea.md
                and tell me which features to include

2. [blocker-002] MISSING_CREDENTIAL
   Agent: staff-engineer
   Created: 30 minutes ago
   Status: Unresolved

   Details: Need Firebase API key
   Impact: Cannot implement authentication

   To resolve: Run /fix-blockers

─────────────────────────────────────────

To resolve: /fix-blockers
\`\`\`
```

---

## 📝 QUICK BUILD INSTRUCTIONS

### Step 1: Build Critical 5 Agents (Priority)

1. **staff-engineer.md**
   - Copy agent template
   - Add capabilities from "Critical Agents - Detailed Specs" above
   - Test: Create a simple task and see if it implements code

2. **qa-testing-agent.md**
   - Copy agent template
   - Add test generation capabilities
   - Test: Run after staff-engineer, verify tests are created

3. **senior-code-reviewer.md**
   - Copy agent template
   - Add review capabilities
   - Test: Run after qa-testing, verify review report created

4. **git-workflow-agent.md**
   - Copy agent template
   - Add git capabilities
   - Test: Run after code complete, verify commit created

5. **premium-ux-designer.md** (enhance existing)
   - Add agent protocol to existing file
   - Test: Called by staff-engineer for UI work

### Step 2: Build 5 Utility Commands

1. /auto-phase - Copy spec above, test with Phase 1
2. /fix-blockers - Copy spec above, test with approval blocker
3. /rollback - Copy spec above, test rollback
4. /validate-ui - Copy spec above, test UI validation
5. /show-blockers - Copy spec above, test display

### Step 3: Test End-to-End

```bash
# Full workflow test
/start-project
# Describe app
/orchestrate  # Product Strategy
# Approve features
/orchestrate  # API Design
/orchestrate  # Database Design
/orchestrate  # System Architect
/orchestrate  # Staff Engineer (task-1-project-setup)
/orchestrate  # QA Testing
/orchestrate  # Senior Code Reviewer
/orchestrate  # Git Workflow
# Repeat for more tasks
```

### Step 4: Build Remaining 6 Agents (Enhancement)

Use same template pattern:
- code-refactorer
- accessibility-compliance-agent
- performance-monitoring-agent
- technical-documentation-agent
- devops-agent
- security-agent

---

## 🎯 TESTING CHECKLIST

- [ ] /start-project creates project-state.json
- [ ] /orchestrate spawns product-strategy-advisor
- [ ] Product strategy creates project-idea.md
- [ ] User can approve features
- [ ] /orchestrate spawns api-contract-designer
- [ ] API designer creates api-specs.yaml
- [ ] /orchestrate spawns database-designer
- [ ] Database designer creates schema.prisma
- [ ] /orchestrate spawns system-architect
- [ ] System architect creates implementation-tasks.md
- [ ] Phase 0 marked complete
- [ ] /orchestrate spawns staff-engineer for Phase 1
- [ ] Staff engineer implements code
- [ ] QA testing agent writes tests
- [ ] Senior code reviewer reviews code
- [ ] Git workflow agent commits code
- [ ] /status shows accurate progress
- [ ] /auto-phase completes entire phase
- [ ] Error recovery works (blockers logged)

---

## 💡 TIPS

1. **Start Simple**: Get 1 agent working end-to-end before building others
2. **Test Frequently**: After each agent, run /orchestrate to test
3. **Use Existing Agents**: product-strategy-advisor is the perfect reference
4. **Follow Protocol**: Every agent must follow agent-communication-protocol.md
5. **Log Everything**: Helps with debugging
6. **Handle Errors**: Every agent needs error handling
7. **Update State**: Critical for orchestrator to know what's next

---

## 🚀 FINAL RESULT

When complete, you'll have:
- ✅ Full Phase 0 (planning) - DONE
- ✅ Complete Phase 1-N workflow (implementation)
- ✅ 11+ specialized agents
- ✅ 8+ utility commands
- ✅ Error recovery & rollback
- ✅ Chrome DevTools integration
- ✅ Full git workflow
- ✅ Autonomous operation with human oversight

**A production-ready agentic development system that can build entire web applications autonomously!**

---

Good luck! The foundation is solid - now just fill in the remaining agents using the patterns established. You've got this! 🎉
