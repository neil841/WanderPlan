# WanderPlan - Agentic Development System

This project uses an **agentic development system** where specialized AI agents collaborate to build, test, review, and deploy your web application automatically.

## System Architecture

@.claude/protocols/agent-communication-protocol.md
@.claude/protocols/file-structure-conventions.md
@.claude/protocols/error-recovery-procedures.md
@.claude/protocols/validation-checkpoints.md

## Project Type

Full-stack Next.js web application with automated agentic development workflow.

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel (Frontend), Railway (Database)
- **CI/CD**: GitHub Actions

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:e2e     # Run e2e tests
npm run lint         # Run linter
npm run type-check   # TypeScript type checking
```

## Agentic System Commands

### Core Workflow Commands

- `/start-project` - Initialize new project with Product Strategy Advisor
- `/orchestrate` - Execute next agent in workflow (manual control)
- `/auto-phase` - Complete entire current phase autonomously
- `/auto-build` - Build entire project automatically (stops for approvals/blockers)

### Monitoring Commands

- `/status` - Show project dashboard (progress, blockers, metrics)
- `/show-state` - Display project-state.json formatted
- `/show-tasks` - Show implementation tasks with completion status
- `/show-blockers` - List all current blockers
- `/metrics` - Show system performance metrics

### Control Commands

- `/fix-blockers` - Resolve blockers interactively
- `/validate-ui` - Open Chrome DevTools and validate current UI
- `/review-phase` - Manually trigger code review
- `/rollback [type]` - Undo changes (task/phase/agent/checkpoint)
- `/checkpoint` - Create manual checkpoint for rollback

---

## Critical System Rules

All agents and users MUST follow these rules:

### 1. State Management
- **ALL state lives in** `.claude/context/project-state.json`
- **NEVER modify code** without reading current state first
- **ALWAYS update state** after completing work
- **ONE agent active** at a time (enforced by lock mechanism)

### 2. Communication Protocol
- **ALL agents MUST** follow agent-communication-protocol.md exactly
- **ALWAYS log handoffs** to `agent-handoffs.md` when completing work
- **ALWAYS log blockers** to `blockers.md` when stuck
- **NEVER call agents directly** - use orchestrator only

### 3. Validation Requirements (MANDATORY)
- **USE Chrome DevTools MCP** for ALL UI changes (EVERY task that touches UI)
- **TEST on 3 viewports**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **RUN Integration Testing** every 5-6 tasks (QA + Security + Code Review)
- **CHECK accessibility** for ALL UI components (WCAG 2.1 AA)
- **MEASURE performance** for ALL features (Lighthouse score >80)
- **PHASE TRANSITION**: Full validation checkpoint before moving to next phase
- **NEVER skip validation** - this is what prevents production failures

### 4. Code Quality
- **WRITE tests** for ALL new features (>80% coverage for critical paths)
- **DOCUMENT code** with JSDoc/TSDoc comments
- **FOLLOW TypeScript** strict mode (no `any` types)
- **USE ESLint + Prettier** (auto-format on save)

### 5. Git Workflow
- **COMMIT code** after completing tasks (via Git Workflow Agent)
- **USE semantic commits** (feat, fix, refactor, etc.)
- **CREATE feature branches** for each phase
- **NEVER commit** secrets, API keys, or .env files

### 6. Security
- **NEVER expose** API keys or secrets in code
- **USE environment variables** for all credentials
- **VALIDATE all inputs** (frontend AND backend)
- **SANITIZE user data** before displaying
- **IMPLEMENT authentication** for protected routes

### 7. Error Handling
- **FOLLOW error-recovery-procedures.md** for all errors
- **LOG blockers** clearly with actionable steps
- **RETRY recoverable errors** up to 3 times
- **FAIL gracefully** - never leave system in bad state

---

## User Intervention Required For

The agentic system will automatically build your app, but needs your input for:

### 🔴 Mandatory Approvals
- Feature additions suggested by Product Strategy Advisor
- Phase transitions (moving from Phase 1 to Phase 2, etc.)
- Production deployment approval
- Database schema migrations (after initial design)

### 🟡 Credentials & Configuration
- API keys (Firebase, Stripe, etc.)
- Database connection strings
- Third-party service credentials
- Domain/hosting configuration

### 🟢 Optional Reviews
- Design decisions (can auto-proceed if not critical)
- Code review findings (auto-fixes MINOR, asks for CRITICAL)
- Performance optimizations (alerts if below threshold)

---

## Agent Behavior Guidelines

### For All Agents

**DO**:
- Read project-state.json before starting any work
- Update project-state.json after completing work
- Write detailed handoff notes in agent-handoffs.md
- Validate your work before marking complete
- Log blockers with clear, actionable descriptions
- Follow file-structure-conventions.md for all file operations

**DON'T**:
- Skip validation steps to move faster
- Assume prerequisites exist without checking
- Leave tasks partially complete
- Modify files without updating state
- Call other agents directly (use orchestrator)
- Continue working if locked by another agent

### For Implementation Agents (Staff Engineer, etc.)

**MUST**:
- Read implementation-tasks.md for task details
- Call Premium UX Designer for ALL UI components
- Validate UI with Chrome DevTools after changes
- Run tests after every code change
- Write JSDoc comments for all functions
- Update architectural decisions log

**MUST NOT**:
- Write code without tests
- Skip Chrome DevTools validation
- Use `any` types in TypeScript
- Commit code without running linter

### For Review Agents (Senior Code Reviewer, etc.)

**MUST**:
- Review ALL files changed in current phase
- Categorize issues by severity (BLOCKER/CRITICAL/MAJOR/MINOR)
- Provide file:line references for every issue
- Create actionable fix tasks, not just complaints
- Validate acceptance criteria from project-idea.md
- Check test coverage (>80% for critical paths)

**MUST NOT**:
- Approve code with BLOCKER severity issues
- Provide vague feedback without examples
- Skip automated checks (linting, type checking)

### For Validation Agents (QA, Accessibility, Performance)

**MUST**:
- Run automated checks first
- Generate detailed reports with severity levels
- Provide specific fix suggestions
- Update metrics after validation

**MUST NOT**:
- Pass validation if automated checks fail
- Skip validation steps to save time

---

## File Organization

### Source Code Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # shadcn components
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

### Agentic System Files

```
.claude/
├── protocols/       # How agents communicate (READ-ONLY)
├── context/         # Runtime state (READ-WRITE)
├── specs/          # Design specs (CREATED in Phase 0)
├── reports/        # Agent outputs (WRITTEN by agents)
├── config/         # Configuration (USER EDITABLE)
└── commands/       # Slash commands & agents
```

---

## Performance Standards

- **Lighthouse Score**: >80 for all pages
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- **Test Coverage**: >80% for critical paths
- **Bundle Size**: <500KB initial load
- **API Response Time**: <200ms for most endpoints

---

## Accessibility Standards

- **WCAG 2.1 Level AA compliance** required
- **Keyboard navigation** for all interactive elements
- **Screen reader compatible** with proper ARIA labels
- **Color contrast ratio** 4.5:1 minimum
- **Focus indicators** visible on all interactive elements

---

## Security Standards

- **Input validation** on both client and server
- **SQL injection protection** via Prisma ORM
- **XSS protection** via React's built-in escaping
- **CSRF protection** for state-changing operations
- **Rate limiting** on API endpoints
- **Authentication** required for protected routes
- **Environment variables** for all secrets

---

## Best Practices

### TypeScript
```typescript
// ✅ DO: Use proper types
interface User {
  id: string;
  email: string;
  name: string;
}

// ❌ DON'T: Use any
const user: any = getUser();
```

### React Components
```typescript
// ✅ DO: Extract reusable components
export function LoginForm() {
  return (
    <form>
      <Input type="email" />
      <Button>Login</Button>
    </form>
  );
}

// ❌ DON'T: Inline everything
```

### Error Handling
```typescript
// ✅ DO: Handle errors explicitly
try {
  const result = await api.call();
  return result;
} catch (error) {
  logger.error('API call failed', error);
  throw new APIError('Failed to fetch data');
}

// ❌ DON'T: Ignore errors
const result = await api.call();
```

---

## Support & Troubleshooting

### Common Issues

**"Agent is stuck"**
- Run `/status` to check which agent is active
- If stuck >30min, orchestrator will auto-clear stale lock
- Or run `/rollback agent` to undo last agent

**"Blocker but don't know what to do"**
- Run `/show-blockers` to see all blockers
- Run `/fix-blockers` for interactive resolution
- Read blocker description for specific steps

**"Want to undo changes"**
- `/rollback task` - Undo last task
- `/rollback phase` - Undo entire phase
- `/rollback agent` - Undo last agent's changes

**"System seems broken"**
- Check `.claude/context/orchestrator-log.md` for errors
- Check `.claude/context/agent-handoffs.md` for last activity
- Create checkpoint before debugging: `/checkpoint`

---

## Configuration

Customize agent behavior in `.claude/config/agent-config.json`:

```json
{
  "automationLevel": "semi-auto",
  "maxRetries": 3,
  "requireApprovalFor": ["phaseTransitions", "productionDeployment"],
  "autoFixSeverity": ["minor"],
  "agentSettings": {
    "staff-engineer": {
      "preferredFramework": "Next.js",
      "testFramework": "Jest"
    }
  }
}
```

---

## Getting Started

1. Run `/start-project` and describe your app idea
2. Review feature suggestions from Product Strategy Advisor
3. Approve features you want
4. Run `/auto-phase` to build Phase 0 (planning)
5. Review implementation plan
6. Run `/auto-phase` repeatedly to build each phase
7. Monitor progress with `/status`
8. Deploy when ready!

---

**The agentic system handles**: Planning, Architecture, Implementation, Testing, Code Review, Documentation, Deployment

**You handle**: Feature approval, API keys, Production deployment approval

Let the agents build your app! 🚀

---

## 🛡️ Safety & Validation System

WanderPlan uses a comprehensive validation system to catch issues early before they compound.

### Automated Validation Every 5 Tasks

**When**: Automatically after every 5 tasks completed  
**Duration**: 60-70 minutes per checkpoint  
**Agents**: Code Review, QA Testing, Performance, Security, UI Validation

### What Gets Validated

✅ **Code Quality** - Patterns, TypeScript usage, error handling  
✅ **Security** - SQL injection, XSS, auth bypass, dependency vulnerabilities  
✅ **Performance** - Lighthouse >80, bundle <500KB, API <200ms  
✅ **Testing** - Coverage >80% for critical paths  
✅ **UI/UX** - Visual rendering, responsive design, WCAG 2.1 AA (via Chrome DevTools)

### Safety Features

- **Early Detection**: Issues caught within 5 tasks (1-2 weeks) instead of months
- **Severity Classification**: BLOCKER → CRITICAL → MAJOR → MINOR
- **Automated Rollback**: Worst case rollback 5 tasks, not entire phase
- **Comprehensive Coverage**: Code, security, performance, UI, accessibility
- **Risk Reduction**: 70-80% reduction in late-stage rework

### Current Status

- **Progress**: 8/16 tasks completed in Phase 1
- **Next Checkpoint**: Task 13 (5 tasks away)
- **Protection Level**: 🛡️🛡️🛡️🛡️🛡️ MAXIMUM

### Quick Reference

```bash
/orchestrate              # Triggers validation automatically at checkpoints
/validate-ui             # Manual UI validation with Chrome DevTools
/show-blockers           # View validation issues
/fix-blockers            # Interactive issue resolution
```

📖 **Full Documentation**: [.claude/docs/SAFETY-SYSTEM.md](.claude/docs/SAFETY-SYSTEM.md)  
📋 **Quick Reference**: [.claude/docs/VALIDATION-QUICK-REFERENCE.md](.claude/docs/VALIDATION-QUICK-REFERENCE.md)

---

