---
description: Show project dashboard with progress, blockers, and metrics
---

You are displaying the project status dashboard.

## Protocol

### Step 1: Read State Files

Read:
- `.claude/context/project-state.json`
- `.claude/context/blockers.md`
- `.claude/context/agent-handoffs.md` (last 3 entries)

### Step 2: Calculate Statistics

```javascript
const stats = {
  totalPhases: Object.keys(state.phases).length,
  completedPhases: countWhere(state.phases, p => p.status === "completed"),
  currentPhase: state.currentPhase,
  totalTasks: state.metrics.totalTasks,
  completedTasks: state.metrics.completedTasks,
  inProgressTasks: countWhere(getAllTasks(), t => t.status === "in-progress"),
  pendingTasks: countWhere(getAllTasks(), t => t.status === "pending"),
  activeBlockers: state.blockers.filter(b => !b.resolved).length,
  lastActivity: state.lastUpdated
};
```

### Step 3: Display Dashboard

```markdown
╔════════════════════════════════════════════════════════════╗
║           [Project Name] - Development Status              ║
╚════════════════════════════════════════════════════════════╝

📊 OVERALL PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phases:     [2/5 complete] ████████░░░░░░░░░░ 40%
Tasks:      [12/45 complete] ███░░░░░░░░░░░░░░░░ 27%
Last Update: [2 minutes ago]

🎯 CURRENT PHASE: [Phase Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: [In Progress] (60% complete)

Tasks:
✓ task-1-name (completed)
✓ task-2-name (completed)
⟳ task-3-name (in-progress) ← Currently here
○ task-4-name (pending)
○ task-5-name (pending)

🤖 ACTIVE AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Agent Name] - Working on [Task Name]
Started: [5 minutes ago]

⚠️  BLOCKERS ([count])
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[If blockers exist, list them]
1. [Blocker 1 description]
2. [Blocker 2 description]

→ Run /fix-blockers to resolve

[If no blockers]
✓ No blockers - smooth sailing!

📝 RECENT ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[10:45] staff-engineer completed "Build login UI"
[10:50] qa-testing-agent wrote tests for login
[10:55] senior-code-reviewer found 2 minor issues
[11:00] staff-engineer fixed issues

📈 METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Agent Runs:    [25]
Successful:          [23] (92%)
With Blockers:       [2]  (8%)
Avg Time per Task:   [15 minutes]
Test Coverage:       [82%]

🎮 NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[If agent working]
→ Agent is working... check back soon

[If blockers exist]
→ Run /fix-blockers to unblock progress

[If ready for next step]
→ Run /orchestrate to continue

[If phase complete]
→ Phase complete! Run /orchestrate to start next phase
```

### Display Format Based on State

**If Project Not Initialized:**
```markdown
📋 Project Not Initialized

Run /start-project to begin
```

**If All Complete:**
```markdown
🎉 PROJECT COMPLETE!

All [N] phases implemented and tested.
Ready for deployment!

📊 Final Statistics:
- Total Phases: [N]
- Total Tasks: [N]
- Lines of Code: [N]
- Test Coverage: [X]%
- Total Time: [N] hours

🚀 Next Steps:
1. Run final validation: /validate-ui
2. Review deployment guide: docs/DEPLOYMENT.md
3. Deploy to production
```

---

## Phase Progress Visualization

Show all phases with visual progress:

```markdown
PHASES OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Phase 0: Planning & Architecture (100%)
✓ Phase 1: Authentication System (100%)
→ Phase 2: User Profile Management (60%) ← You are here
○ Phase 3: Trip Planning Features (0%)
○ Phase 4: Social & Sharing (0%)
○ Phase 5: Polish & Deploy (0%)
```

---

## Helpful Tips Based on State

Add contextual tips:

```markdown
💡 TIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[If many pending tasks]
You can run /auto-phase to complete this phase automatically

[If blockers exist]
Blockers are blocking progress - resolve them to continue

[If tests failing]
Tests are failing - staff-engineer is fixing them

[If first phase]
This is your first phase! The system is learning your preferences.

[If near completion]
You're almost done! Only [N] tasks remaining.
```

---

## Color Coding (if terminal supports)

- ✓ Green: Completed
- ⟳ Yellow: In Progress
- ○ Gray: Pending
- ⚠️  Red: Blockers
- → Blue: Current location

---

This dashboard gives the user complete visibility into system state.
