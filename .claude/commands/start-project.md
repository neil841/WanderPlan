---
description: Initialize a new project with the Product Strategy Advisor
---

You are initiating a new project with the Agentic Development System.

## Your Role

You will gather the user's app idea and pass it to the Product Strategy Advisor agent for analysis and feature suggestions. This is the entry point for the entire agentic development workflow.

## Protocol

### Step 1: Gather Project Information

**Interactive Questions** (ask one at a time for better UX):

1. **App Name**:
   - "What is your app called?"
   - Validate: Non-empty, reasonable length (3-50 chars)
   - Example: "TaskMaster Pro", "HealthTrack", "QuickChat"

2. **Main Purpose**:
   - "What is the core problem this app solves? Describe in 1-2 sentences."
   - Validate: Clear problem statement
   - Good example: "Helps freelancers track project time and generate invoices automatically"
   - Poor example: "A good app for tasks"

3. **Target Users**:
   - "Who will use this app? Be specific about the user persona."
   - Validate: Specific demographic/profession
   - Good example: "Freelance developers and designers who need to bill clients"
   - Poor example: "Everyone", "People"

4. **Key Features**:
   - "What features do you want? List all features you have in mind (one per line or comma-separated)."
   - Validate: At least 2-3 features provided
   - Examples:
     - "User login, Time tracking, Invoice generation, Project management"
     - "Recipe search, Save favorites, Shopping list, Meal planning"

5. **Technical Preferences** (optional):
   - "Any specific tech requirements? (e.g., 'Must use PostgreSQL', 'Need real-time updates')"
   - "Press Enter to skip if none."
   - Examples: "Firebase for auth", "Stripe for payments", "Real-time WebSockets"

### Step 2: Initialize Project State

Once you have the information, update `.claude/context/project-state.json`:

```json
{
  "version": "1.0.0",
  "projectName": "[App Name]",
  "initialized": true,
  "currentPhase": "phase-0-planning",
  "activeAgent": null,
  "agentLockTimestamp": null,
  "lastUpdated": "[current timestamp]",
  "phases": {
    "phase-0-planning": {
      "name": "Planning & Architecture",
      "status": "in-progress",
      "startedAt": "[current timestamp]",
      "completedAt": null,
      "tasks": {
        "task-0-product-strategy": "pending",
        "task-0-api-design": "pending",
        "task-0-database-design": "pending",
        "task-0-architecture": "pending"
      }
    }
  },
  "blockers": [],
  "metrics": {
    "totalTasks": 4,
    "completedTasks": 0,
    "failedTasks": 0,
    "totalAgentRuns": 0,
    "lastAgentRun": null,
    "agentRunHistory": [],
    "errorMetrics": {
      "totalErrors": 0,
      "recoverableErrors": 0,
      "blockerErrors": 0,
      "criticalErrors": 0,
      "staleLocks": 0,
      "skippedValidations": 0
    }
  },
  "userInput": {
    "appName": "[App Name]",
    "mainPurpose": "[Purpose]",
    "targetUsers": "[Users]",
    "requestedFeatures": ["feature1", "feature2", "..."]
  }
}
```

### Step 3: Create Initial Project Brief

Create `.claude/specs/project-brief.md` with the user's input:

```markdown
# [App Name] - Project Brief

## Overview
[Main Purpose]

## Target Users
[Who will use this]

## Requested Features
- Feature 1
- Feature 2
- ...

## Date Created
[Timestamp]
```

### Step 4: Log to Orchestrator

Append to `.claude/context/orchestrator-log.md`:

```markdown
## [Timestamp] PROJECT INITIALIZED

Project Name: [App Name]
Phase: phase-0-planning
Status: Ready for Product Strategy Advisor

User Requested Features:
- [List features]

Next Step: Run /orchestrate to start Product Strategy analysis
```

### Step 5: Inform User

Display a comprehensive initialization summary:

```markdown
✅ Project Initialized: [App Name]

📋 Your Requested Features:
- [List each feature with bullet points]

👥 Target Users: [Target users]
🎯 Main Purpose: [Purpose]

═══════════════════════════════════════════════════════════

## What Happens Next?

### Phase 0: Planning & Architecture

The system will automatically:

1. **Product Strategy Analysis** (`product-strategy-advisor`)
   - Analyze your app idea for completeness
   - Suggest additional features you might have missed
   - Create user personas
   - Generate acceptance criteria for each feature
   - Prioritize features using ICE framework
   - YOU'LL REVIEW: You'll approve/reject suggested features

2. **API Design** (`api-contract-designer`)
   - Design REST API endpoints (OpenAPI 3.0 spec)
   - Define request/response schemas
   - Add validation rules
   - AUTOMATED: Creates api-specs.yaml

3. **Database Design** (`database-designer`)
   - Design database schema (Prisma)
   - Define models, relationships, indexes
   - Add constraints and validations
   - AUTOMATED: Creates db-schema.md

4. **System Architecture** (`system-architect`)
   - Reviews all Phase 0 specs
   - Creates phased implementation plan
   - Breaks project into tasks with dependencies
   - AUTOMATED: Creates implementation-tasks.md

### Phase 1+: Implementation

After planning, the system will:
- Implement features one by one
- Write tests automatically
- Review code quality
- Commit to git
- Validate accessibility & performance
- Generate documentation

═══════════════════════════════════════════════════════════

## Ready to Start?

Run: `/orchestrate`

This will start the Product Strategy Advisor agent.

💡 **Tip**: You can run `/status` anytime to see progress
```

---

## Important Rules

- **DO NOT start any agents yet** - just initialize the project
- **Save all user input** to project-state.json AND project-brief.md
- **Validate user input** - ensure quality responses before continuing
- **User must run /orchestrate** to begin the workflow

---

## Troubleshooting

### Issue: User provides vague features
**Solution**: Ask clarifying questions
- "What do you mean by '[feature]'? Can you describe it in more detail?"
- Provide examples of good feature descriptions

### Issue: User provides too many features (>20)
**Solution**: Acknowledge and proceed
- "That's an ambitious project! The Product Strategy Advisor will help prioritize these."
- Still initialize - strategy advisor will help break into phases

### Issue: User unsure about target users
**Solution**: Help them narrow down
- "Think about who would benefit most from this app. Is it for professionals, students, hobbyists?"
- Provide persona examples: "e.g., Busy parents, Small business owners, etc."

### Issue: User wants features that conflict
**Solution**: Note conflicts, let strategy advisor handle
- Make a note in project-brief.md about potential conflicts
- Product strategy advisor will identify trade-offs

---

## Example Interaction

**Good Project Initialization**:

```
User: I want to build a task management app

You: What is your app called?
User: TaskFlow

You: What is the core problem this app solves?
User: Helps remote teams coordinate tasks and deadlines with automatic notifications

You: Who will use this app?
User: Remote software development teams (5-20 people)

You: What features do you want?
User: Task creation, Assignment to team members, Due dates, Notifications, Team dashboard, File attachments

You: Any specific tech requirements?
User: Need real-time updates when tasks change

✅ Project initialized with clear vision!
```

**Poor Project Initialization** (need to improve):

```
User: I want to build an app

You: What is your app called?
User: App

You: What is the core problem this app solves?
User: It's useful

🚫 Too vague - ask clarifying questions before initializing!
```
