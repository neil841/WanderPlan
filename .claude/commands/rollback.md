---
description: Undo changes (task/phase/agent level) via git
---

You are handling rollback operations using git to undo changes safely.

## 🎯 Mission

Safely undo changes at different levels: task, phase, or agent.

## 📋 Usage

```bash
/rollback task      # Undo last completed task
/rollback phase     # Undo entire current phase
/rollback agent     # Undo last agent's changes
```

## 🔄 Rollback Task

### Process

```javascript
1. Read `.claude/context/project-state.json`
2. Find last completed task in current phase
3. Read `.claude/context/agent-handoffs.md` to see what files changed
4. Use git to revert changes
5. Update state
```

### Steps

```bash
# 1. Find last commit related to task
git log --oneline -10

# 2. Show what will be reverted
git show [commit-hash]

# 3. Ask user for confirmation
Display: "⚠️  About to rollback task: [task-name]"
Display: ""
Display: "Changes to be reverted:"
Display: "[List files from git show]"
Display: ""
Display: "Commits to revert: [X]"
Display: ""
Display: "This will:"
Display: "- Revert code changes"
Display: "- Mark task as 'pending' in project-state.json"
Display: "- Create revert commit in git"
Display: ""
Display: "Continue? (yes/no)"

if (userInput === "yes") {
  # 4. Revert commit
  git revert [commit-hash]

  # 5. Update state
  updateProjectState({
    task: { status: "pending" },
    metrics: { completedTasks: decrementBy(1) }
  });

  # 6. Log
  logToOrchestratorLog("Rolled back task: [task-name]");

  Display: "✅ Task [task-name] rolled back"
  Display: "Status: pending"
  Display: "Run /orchestrate to retry"
}
```

## 🔄 Rollback Phase

### Process

```javascript
# More extensive - reverts all tasks in phase

1. Identify all commits in current phase
2. Show summary of changes
3. Confirm with user
4. Revert all commits
5. Update state (mark all tasks pending)
```

### Steps

```bash
# 1. Find phase start commit
git log --grep="Phase [N]" --oneline

# 2. List all commits since phase start
git log [phase-start-commit]..HEAD --oneline

# 3. Ask confirmation
Display: "⚠️  PHASE ROLLBACK"
Display: ""
Display: "Phase: [N] - [Phase Name]"
Display: "Tasks to rollback: [X]"
Display: "Commits to revert: [Y]"
Display: ""
Display: "This is a significant operation that will:"
Display: "- Revert ALL code changes in this phase"
Display: "- Mark ALL phase tasks as 'pending'"
Display: "- Create [Y] revert commits"
Display: ""
Display: "Are you absolutely sure? (type 'ROLLBACK PHASE' to confirm)"

if (userInput === "ROLLBACK PHASE") {
  # 4. Revert all commits (newest to oldest)
  commits = getCommitsSincePhaseStart();
  for commit in commits.reverse():
    git revert commit --no-edit

  # 5. Update state
  updateProjectState({
    phase: {
      status: "in-progress",
      tasks: markAllAsPending()
    },
    metrics: {
      completedTasks: decrementBy(taskCount)
    }
  });

  Display: "✅ Phase [N] rolled back"
  Display: "All [X] tasks marked as pending"
  Display: "Run /orchestrate to restart phase"
}
```

## 🔄 Rollback Agent

### Process

```javascript
# Undo just the last agent's work
# Useful if agent made mistake but task not yet committed

1. Read last entry in agent-handoffs.md
2. Identify files changed
3. Use git to undo changes (if not committed, use git checkout)
4. Update state
```

### Steps

```bash
# 1. Check if changes are committed
git status

if (changesCommitted) {
  # Revert last commit
  git log -1 --oneline
  Display: "Last commit: [commit-message]"
  Display: "Revert this commit? (yes/no)"

  if (userInput === "yes") {
    git revert HEAD
    Display: "✅ Last commit reverted"
  }
} else {
  # Changes not committed yet
  Display: "Uncommitted changes detected"
  Display: "Files modified:"
  git diff --name-only

  Display: ""
  Display: "Discard these changes? (yes/no)"

  if (userInput === "yes") {
    git checkout .
    Display: "✅ Uncommitted changes discarded"
  }
}

# Update state
updateProjectState({
  activeAgent: null,
  agentLockTimestamp: null
});

Display: "Agent work rolled back"
Display: "Run /orchestrate to retry with different agent"
```

## ⚠️ Safety Features

### 1. Create Backup First

```bash
# Before any rollback
git branch backup-before-rollback-[timestamp]

Display: "✅ Backup branch created: backup-before-rollback-[timestamp]"
Display: "If rollback causes issues, restore with:"
Display: "git checkout backup-before-rollback-[timestamp]"
```

### 2. Dry Run Option

```bash
Display: "Preview changes before rollback? (yes/no)"

if (userInput === "yes") {
  # Show what would be reverted
  git show [commits]

  Display: ""
  Display: "Proceed with rollback? (yes/no)"
}
```

### 3. Cannot Rollback if Pushed

```bash
# Check if commits are pushed
git log origin/main..HEAD

if (noPendingCommits) {
  Display: "⚠️  WARNING: These commits have been pushed to remote"
  Display: "Rolling back pushed commits will rewrite history"
  Display: "This can cause issues for other developers"
  Display: ""
  Display: "Options:"
  Display: "1. Cancel rollback"
  Display: "2. Continue anyway (not recommended)"
  Display: "3. Create fix commit instead of reverting"

  # Guide user to safer option
}
```

## 📊 Rollback Summary

After rollback:

```markdown
⏪ Rollback Complete

**Type**: [Task/Phase/Agent]
**Target**: [Name]

**Changes Reverted**:
- Files modified: [X]
- Lines removed: [Y]
- Commits reverted: [Z]

**State Updated**:
- Task status: [status]
- Completed tasks: [before] → [after]

**Backup Created**:
Branch: backup-before-rollback-[timestamp]

**Next Steps**:
- Review changes: git log
- Retry task: /orchestrate
- Or continue: /auto-phase

**To Restore Backup** (if needed):
git checkout backup-before-rollback-[timestamp]
```

## 🚨 Error Handling

### Merge Conflicts During Revert

```bash
if (revertConflict) {
  Display: "❌ Merge conflict during revert"
  Display: "Files with conflicts:"
  git diff --name-only --diff-filter=U

  Display: ""
  Display: "Options:"
  Display: "1. Abort rollback"
  Display: "2. Resolve conflicts manually"

  if (userInput === "1") {
    git revert --abort
    Display: "Rollback aborted"
  } else {
    Display: "Resolve conflicts in the listed files"
    Display: "Then run: git revert --continue"
  }
}
```

### No Commits to Revert

```bash
Display: "ℹ️  No commits found to revert"
Display: "This task may not have been committed yet"
Display: "Check: git status"
```

## 💡 Use Cases

### Use Case 1: Undo Buggy Implementation

```bash
# Staff engineer implemented feature with bug
/rollback task

# Fix the bug manually or let agent retry
/orchestrate
```

### Use Case 2: Wrong Approach for Phase

```bash
# Realized entire phase used wrong architecture
/rollback phase

# Update architecture design
# Restart phase with correct approach
/orchestrate
```

### Use Case 3: Agent Made Mistake

```bash
# QA agent wrote incorrect tests
/rollback agent

# Review what went wrong
# Run /orchestrate to retry with corrected approach
```

## ⚠️ Important Notes

- **Rollback is destructive**: Make sure you want to undo changes
- **Backup is automatic**: Every rollback creates a backup branch
- **Cannot rollback Phase 0**: Planning phase changes are in spec files, not code
- **Consider fix forward**: Sometimes it's better to fix issues rather than rollback
- **Check with team**: If working with others, coordinate before rolling back

Remember: Rollback is a safety net, not a primary workflow tool. Use /orchestrate to retry tasks instead when possible!
