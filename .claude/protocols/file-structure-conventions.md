# File Structure Conventions

This document defines where all files should be located in the agentic development system.

## Overview

The `.claude/` directory contains all system state, configuration, and outputs. Keep this directory organized to ensure smooth agent operation.

---

## Directory Structure

```
.claude/
├── CLAUDE.md                          # Root configuration (imports protocols)
├── protocols/                         # How the system works
│   ├── agent-communication-protocol.md
│   ├── file-structure-conventions.md
│   └── error-recovery-procedures.md
├── context/                          # Shared state (runtime)
│   ├── project-state.json           # Current state machine
│   ├── project-state.backup.json    # Auto-backup before updates
│   ├── agent-handoffs.md            # Agent communication log
│   ├── blockers.md                  # Issues needing user intervention
│   └── orchestrator-log.md          # Orchestration decisions
├── specs/                           # Design specifications
│   ├── project-idea.md              # Feature list & requirements
│   ├── implementation-tasks.md      # Task breakdown by phase
│   ├── architecture-design.md       # Technical architecture
│   ├── api-specs.yaml               # API contracts
│   ├── db-schema.md                 # Database schema
│   └── personas.md                  # User personas
├── reports/                         # Agent output reports
│   ├── code-review-phase-1.md
│   ├── code-review-phase-2.md
│   ├── test-results.md
│   ├── performance-report.md
│   ├── accessibility-report.md
│   ├── security-report.md
│   ├── decisions.md                 # Architectural decision records
│   └── screenshots/                 # UI validation screenshots
├── config/                          # Configuration
│   ├── agent-config.json            # Agent behavior settings
│   └── project-config.json          # Project-specific settings
├── learning/                        # System improvement
│   └── project-history.json         # Past project learnings
├── design/                          # Design assets
│   ├── tokens.json                  # Design tokens
│   └── components.md                # Component documentation
├── metrics/                         # Performance tracking
│   └── agent-metrics.json           # Agent performance data
├── docs/                            # System documentation
│   ├── system-overview.md
│   ├── agent-reference.md
│   └── troubleshooting.md
├── templates/                       # Reusable templates
│   └── agent-template.md            # Template for creating agents
└── commands/                        # Slash commands & agents
    ├── orchestrate.md
    ├── start-project.md
    ├── auto-phase.md
    ├── status.md
    ├── fix-blockers.md
    └── agents/                      # All subagents
        ├── product-strategy-advisor.md
        ├── api-contract-designer.md
        ├── database-designer.md
        ├── system-architect.md
        ├── premium-ux-designer.md
        ├── staff-engineer.md
        ├── code-refactorer.md
        ├── qa-testing-agent.md
        ├── senior-code-reviewer.md
        ├── accessibility-compliance-agent.md
        ├── performance-monitoring-agent.md
        ├── technical-documentation-agent.md
        ├── devops-agent.md
        ├── git-workflow-agent.md
        └── security-agent.md
```

---

## File Naming Conventions

### State Files
- **Pattern**: `kebab-case.json` or `kebab-case.md`
- **Examples**: `project-state.json`, `agent-handoffs.md`
- **Location**: `.claude/context/`

### Specification Files
- **Pattern**: `kebab-case.md` or `kebab-case.yaml`
- **Examples**: `project-idea.md`, `api-specs.yaml`
- **Location**: `.claude/specs/`

### Report Files
- **Pattern**: `report-name-[identifier].md`
- **Examples**: `code-review-phase-1.md`, `performance-report.md`
- **Location**: `.claude/reports/`

### Agent Files
- **Pattern**: `agent-name.md` (matches agent name exactly)
- **Examples**: `staff-engineer.md`, `senior-code-reviewer.md`
- **Location**: `.claude/commands/agents/`

### Slash Command Files
- **Pattern**: `command-name.md`
- **Examples**: `orchestrate.md`, `start-project.md`
- **Location**: `.claude/commands/`

---

## Source Code Structure

The agentic system will generate code following Next.js App Router conventions:

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/                  # Dashboard route group
│   │   ├── layout.tsx
│   │   ├── trips/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/                          # API routes
│   │   ├── auth/
│   │   │   └── route.ts
│   │   └── trips/
│   │       └── route.ts
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/                       # React components
│   ├── ui/                          # shadcn components
│   │   ├── button.tsx
│   │   └── input.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── trips/
│       ├── TripCard.tsx
│       └── TripList.tsx
├── lib/                             # Utilities
│   ├── auth.ts                      # Auth utilities
│   ├── db.ts                        # Database client
│   ├── utils.ts                     # General utilities
│   └── validations.ts               # Zod schemas
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts
│   └── useTrips.ts
├── types/                           # TypeScript types
│   ├── auth.ts
│   └── trip.ts
└── styles/                          # Styles
    └── globals.css
```

---

## File Ownership by Agent

### Product Strategy Advisor
**Creates**:
- `.claude/specs/project-idea.md`
- `.claude/specs/personas.md`

**Reads**:
- `.claude/learning/project-history.json`

### API Contract Designer
**Creates**:
- `.claude/specs/api-specs.yaml`

**Reads**:
- `.claude/specs/project-idea.md`

### Database Designer
**Creates**:
- `.claude/specs/db-schema.md`
- `prisma/schema.prisma` (or equivalent)

**Reads**:
- `.claude/specs/project-idea.md`

### System Architect
**Creates**:
- `.claude/specs/implementation-tasks.md`
- `.claude/specs/architecture-design.md`

**Reads**:
- `.claude/specs/project-idea.md`
- `.claude/specs/api-specs.yaml`
- `.claude/specs/db-schema.md`

### Staff Engineer
**Creates**:
- All source code in `src/`
- `.claude/reports/decisions.md` (architectural decisions)

**Reads**:
- `.claude/specs/implementation-tasks.md`
- `.claude/specs/architecture-design.md`
- `.claude/specs/api-specs.yaml`
- `.claude/specs/db-schema.md`

**Updates**:
- `.claude/context/project-state.json`

### Premium UX Designer
**Creates**:
- `.claude/design/tokens.json`
- `.claude/design/components.md`
- Component files in `src/components/`

**Reads**:
- `.claude/specs/implementation-tasks.md`

### QA Testing Agent
**Creates**:
- Test files (e.g., `src/__tests__/`, `e2e/`)
- `.claude/reports/test-results.md`

**Reads**:
- Source code files being tested
- `.claude/specs/project-idea.md` (for acceptance criteria)

### Senior Code Reviewer
**Creates**:
- `.claude/reports/code-review-phase-[N].md`

**Reads**:
- All source code files
- `.claude/specs/project-idea.md` (for acceptance criteria)

### Accessibility Compliance Agent
**Creates**:
- `.claude/reports/accessibility-report.md`

**Reads**:
- UI component files

### Performance Monitoring Agent
**Creates**:
- `.claude/reports/performance-report.md`

**Reads**:
- All source files

### Technical Documentation Agent
**Creates**:
- `README.md` (root and module-level)
- `docs/` directory with guides

**Reads**:
- All source files
- `.claude/specs/api-specs.yaml`

### DevOps Agent
**Creates**:
- `.github/workflows/` (CI/CD)
- `Dockerfile`
- `.env.example`
- Deployment configs

**Reads**:
- `.claude/specs/architecture-design.md`

### Git Workflow Agent
**Creates**:
- Git commits, branches, PRs

**Reads**:
- `.claude/context/project-state.json`
- Git repository state

### Security Agent
**Creates**:
- `.claude/reports/security-report.md`

**Reads**:
- All source files
- `package.json` (dependencies)

---

## Temporary Files

Agents should use temporary files for work-in-progress:

```
.claude/.tmp/
├── agent-name-workdir/
└── ...
```

Clean up temp files on completion or error.

---

## Backup Strategy

### Automatic Backups
- `project-state.json` → `project-state.backup.json` (before every update)
- Keep last 10 backups in `.claude/context/.backups/`

### Manual Checkpoints
User can create checkpoints via `/checkpoint` command:
- Creates git tag: `checkpoint-[timestamp]`
- Preserves entire state at that moment

---

## .gitignore Rules

```
# Agentic system temp files
.claude/.tmp/
.claude/context/.agent-lock
.claude/context/project-state.backup.json

# Keep these in git
.claude/protocols/
.claude/specs/
.claude/reports/
.claude/config/
.claude/commands/

# Optional: ignore local customizations
.claude/config/agent-config.local.json
```

---

## File Size Limits

- State files: < 1MB (keep concise)
- Report files: < 5MB (split if larger)
- Logs: Rotate when > 10MB

---

## Access Patterns

### Read-Only Files (Never Modified After Creation)
- `.claude/protocols/*.md`
- `.claude/specs/api-specs.yaml` (after Phase 0)
- `.claude/specs/db-schema.md` (after Phase 0)

### Append-Only Files (Never Modified, Only Appended)
- `.claude/context/agent-handoffs.md`
- `.claude/context/blockers.md`
- `.claude/context/orchestrator-log.md`

### Read-Write Files (Frequently Updated)
- `.claude/context/project-state.json`
- `.claude/reports/*.md`

### Write-Once Files (Created Once Per Phase)
- `.claude/reports/code-review-phase-[N].md`

---

This structure ensures organized, predictable file locations that all agents can rely on.
