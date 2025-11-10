# Getting Started with the Agentic Development System

## 🎉 Welcome!

You now have a complete **agentic development system** that can build web applications autonomously. This guide will help you understand how to use it.

## 📚 What You Have

### ✅ Fully Operational (Ready to Use)
1. **Complete Infrastructure**
   - Directory structure
   - State management system
   - Error recovery system
   - Agent communication protocol

2. **Working Commands**
   - `/start-project` - Initialize new project
   - `/orchestrate` - Run next agent in workflow
   - `/status` - View progress dashboard

3. **Phase 0 Agents (Planning)** - COMPLETE
   - Product Strategy Advisor ✓
   - API Contract Designer ✓
   - Database Designer ✓
   - System Architect (needs enhancement)

### 🔨 Needs Completion

**Critical Agents** (for full workflow):
- Staff Engineer (implementation)
- QA Testing Agent (testing)
- Senior Code Reviewer (quality)
- Git Workflow Agent (version control)

**Enhancement Agents** (add later):
- Premium UX Designer
- Accessibility Agent
- Performance Agent
- DevOps Agent
- Security Agent
- Documentation Agent

**Utility Commands**:
- /auto-phase
- /fix-blockers
- /rollback
- /validate-ui

---

## 🚀 Your First Project (Step-by-Step)

### Step 1: Start a New Project

```bash
/start-project
```

You'll be asked:
1. **App Name**: e.g., "TripPlanner"
2. **Main Purpose**: e.g., "Help users plan and organize their trips"
3. **Target Users**: e.g., "Travel enthusiasts, vacation planners"
4. **Key Features**: e.g., "Trip creation, itinerary building, budget tracking, photo sharing"

The system will:
- Initialize `project-state.json`
- Create `project-brief.md`
- Set up Phase 0 (Planning)

### Step 2: Check Status

```bash
/status
```

You'll see:
```
╔════════════════════════════════════════════╗
║        TripPlanner - Development Status     ║
╚════════════════════════════════════════════╝

📊 OVERALL PROGRESS
Phases:     [0/5 complete] ░░░░░░░░░░░░░░░░ 0%
Tasks:      [0/4 complete] ░░░░░░░░░░░░░░░░ 0%

🎯 CURRENT PHASE: Planning & Architecture
Status: In Progress (0% complete)

Tasks:
○ task-0-product-strategy (pending)
○ task-0-api-design (pending)
○ task-0-database-design (pending)
○ task-0-architecture (pending)

🎮 NEXT ACTION
→ Run /orchestrate to start Product Strategy analysis
```

### Step 3: Run First Agent

```bash
/orchestrate
```

The **Product Strategy Advisor** will:
1. Read your project brief
2. Analyze your features
3. Identify missing critical features
4. Suggest additional features
5. Create user personas
6. Generate acceptance criteria

**Output**:
- `.claude/specs/project-idea.md` - Complete feature list
- `.claude/specs/personas.md` - User personas

You'll see:
```
✅ Product Strategy Analysis Complete!

📊 Analysis Summary:
- Original features requested: 4
- Additional features suggested: 15
  - 🔴 CRITICAL: 5 (strongly recommended)
  - 🟡 HIGH VALUE: 7 (recommended)
  - 🟢 NICE-TO-HAVE: 3 (optional)

⏸️  AWAITING YOUR APPROVAL
Review: .claude/specs/project-idea.md

Options:
- "Approve all suggestions"
- "Approve all CRITICAL and HIGH VALUE"
- "Approve only: [list features]"
```

### Step 4: Approve Features

Read the suggestions in `project-idea.md`, then tell the agent:

```
Approve all CRITICAL and HIGH VALUE features
```

The agent will update `project-idea.md` with your final approved list.

### Step 5: Continue the Loop

```bash
/orchestrate
```

**API Contract Designer** runs:
- Designs all API endpoints
- Creates OpenAPI specification
- Defines request/response schemas
- Documents authentication

**Output**: `.claude/specs/api-specs.yaml`

```bash
/orchestrate
```

**Database Designer** runs:
- Designs database schema
- Creates Prisma schema file
- Defines relationships
- Adds indexes

**Output**: `prisma/schema.prisma` + `.claude/specs/db-schema.md`

```bash
/orchestrate
```

**System Architect** runs (when enhanced):
- Reviews all Phase 0 work
- Creates implementation plan
- Breaks work into phases
- Defines tech stack

**Output**: `.claude/specs/implementation-tasks.md`

### Step 6: Phase 0 Complete! 🎉

```bash
/status
```

```
✅ Phase 0: Planning Complete!

Summary:
- Features Defined: 20 total (5 original + 15 approved)
- API Endpoints: 45
- Database Tables: 12
- Implementation Phases: 5
- Estimated Tasks: 45

📄 Deliverables:
- project-idea.md (product specification)
- api-specs.yaml (API contracts)
- db-schema.md (database design)
- implementation-tasks.md (task breakdown)

🎯 Next Phase: Phase 1 - Authentication System
Ready to proceed? Run /orchestrate
```

---

## 🔄 The Development Loop (Phases 1-N)

Once Phase 0 is complete and implementation agents are built, each feature follows this cycle:

### Cycle Overview
```
1. Staff Engineer implements feature
   ↓
2. QA Testing Agent writes tests
   ↓
3. Tests pass? → Continue | Tests fail? → Staff Engineer fixes
   ↓
4. Validation Agents run (Accessibility, Performance, Security)
   ↓
5. Issues found? → Staff Engineer fixes → Re-validate
   ↓
6. Senior Code Reviewer reviews code
   ↓
7. BLOCKER issues? → Staff Engineer fixes → Re-review
   ↓
8. Git Workflow Agent commits code
   ↓
9. Move to next task → Repeat
```

### Running a Phase

**Manual Control** (step-by-step):
```bash
/orchestrate  # Run one agent
/status       # Check what happened
/orchestrate  # Run next agent
```

**Semi-Automatic** (complete phase):
```bash
/auto-phase   # Runs until phase complete or blocker
```

**Full Automatic** (entire project):
```bash
/auto-build   # Runs until project complete (stops for approvals/blockers)
```

---

## 📊 Understanding the Dashboard

When you run `/status`, you see:

### Overall Progress
```
Phases:     [2/5 complete] ████████░░░░░░░░ 40%
```
Shows completed phases vs total phases.

### Current Phase
```
🎯 CURRENT PHASE: Authentication System
Status: In Progress (60% complete)

Tasks:
✓ task-1-jwt-setup (completed)
✓ task-2-login-ui (completed)
⟳ task-3-protected-routes (in-progress)
○ task-4-password-reset (pending)
```

Symbols:
- ✓ Completed
- ⟳ In Progress
- ○ Pending

### Active Agent
```
🤖 ACTIVE AGENT
staff-engineer - Working on "Protected Routes"
Started: 5 minutes ago
```

Shows which agent is currently working.

### Blockers
```
⚠️  BLOCKERS (1)
1. Need Firebase API key for authentication
→ Run /fix-blockers to resolve
```

Shows what needs your attention.

### Recent Activity
```
📝 RECENT ACTIVITY
[10:45] staff-engineer completed "Build login UI"
[10:50] qa-testing-agent wrote tests for login
[10:55] senior-code-reviewer found 2 minor issues
[11:00] staff-engineer fixed issues
```

Shows last 4-5 agent actions.

---

## 🚨 Common Scenarios

### Scenario 1: Agent Needs Your Input (Blocker)

```
⚠️  Blocker Encountered

Agent: staff-engineer
Issue: Need Firebase API key for authentication

To resolve: /fix-blockers
```

**What to do**:
1. Run `/fix-blockers`
2. Follow the prompts
3. Provide the requested information
4. Agent will resume automatically

### Scenario 2: Something Went Wrong

```
❌ staff-engineer failed after 3 attempts
Issue: Tests keep failing

Check: .claude/reports/test-results.md
```

**What to do**:
1. Check the error logs
2. Option A: `/rollback agent` and try again
3. Option B: Manually investigate the issue
4. Option C: `/orchestrate` to see if senior-code-reviewer can help

### Scenario 3: Want to Change Direction

```
# Undo last task
/rollback task

# Undo entire phase
/rollback phase

# Start over from Phase 0
/rollback phase-0
```

### Scenario 4: Want to See What's Happening

```
# See state
cat .claude/context/project-state.json

# See agent communication
cat .claude/context/agent-handoffs.md

# See system decisions
cat .claude/context/orchestrator-log.md

# See blockers
cat .claude/context/blockers.md
```

---

## 🎯 Best Practices

### DO:
- ✅ Run `/status` frequently to monitor progress
- ✅ Read `project-idea.md` before approving features
- ✅ Review agent handoffs to understand decisions
- ✅ Create checkpoints before major changes (`/checkpoint`)
- ✅ Let agents fix their own issues (they usually can)

### DON'T:
- ❌ Manually edit `project-state.json` (agents manage this)
- ❌ Delete `.claude/context/` files (system needs them)
- ❌ Interrupt agents mid-work (let them finish)
- ❌ Skip Phase 0 (planning is critical)
- ❌ Approve all features without reading (be strategic)

---

## 🔧 Troubleshooting

### "Agent is stuck for 30+ minutes"

The orchestrator will auto-clear stale locks. Or manually:
```bash
/orchestrate  # Will detect and clear stale lock
```

### "Too many blockers"

```bash
/show-blockers  # List all
/fix-blockers   # Interactive resolution
```

### "Want to start over"

```bash
# Delete project-state.json
rm .claude/context/project-state.json

# Re-initialize
/start-project
```

### "System seems broken"

1. Check logs:
```bash
cat .claude/context/orchestrator-log.md
```

2. Create backup:
```bash
/checkpoint
```

3. Try rollback:
```bash
/rollback phase
```

---

## 📖 Next Steps

### Immediate
1. **Complete remaining agents** - Follow templates in SYSTEM-STATUS.md
2. **Test Phase 1** - Implement your first feature end-to-end
3. **Refine workflows** - Adjust agent behavior based on results

### Soon
1. **Add utility commands** - /auto-phase, /fix-blockers, etc.
2. **Enhance agents** - Add more capabilities
3. **Add monitoring** - Metrics dashboard

### Later
1. **Multi-project support** - Reuse agents across projects
2. **Learning system** - Agents learn from past projects
3. **Parallel execution** - Run multiple agents simultaneously (where safe)

---

## 🎓 Understanding the System

### Key Concepts

**State Machine**:
- All agents read/write to `project-state.json`
- Orchestrator decides which agent runs based on state
- State tracks phases, tasks, blockers, metrics

**Agent Protocol**:
- Every agent follows same pattern: Init → Work → Complete
- Agents communicate via `agent-handoffs.md`
- Agents log blockers to `blockers.md`

**Feedback Loops**:
- Build → Test → Review → Fix → Re-validate
- Max 3 iterations before escalating to blocker

**Error Recovery**:
- Automatic retries (3x)
- Graceful failures
- State backups
- Rollback capability

### File System

```
.claude/
├── protocols/          # System rules (READ-ONLY)
├── context/           # Runtime state (READ-WRITE)
├── specs/             # Design docs (CREATED once)
├── reports/           # Agent outputs (APPEND-ONLY)
└── commands/          # Agents & commands
```

---

## 🎊 You're Ready!

You have everything you need to:
1. ✅ Initialize projects
2. ✅ Run Phase 0 (planning)
3. ✅ Understand the system
4. ✅ Monitor progress
5. ✅ Handle blockers
6. ✅ Recover from errors

**Next**: Run `/start-project` and build something amazing!

---

**Questions?** Check:
- `CLAUDE.md` - System configuration
- `.claude/SYSTEM-STATUS.md` - Build progress
- `.claude/protocols/` - Detailed protocols
- `README.md` - Project overview
