# WanderPlan - Agentic Development System

> An AI-powered agentic system that builds, tests, reviews, and deploys web applications autonomously.

## 🌟 What is This?

This project uses an **agentic loop** - a system where specialized AI agents collaborate to build your entire web application with minimal human intervention. You describe what you want, approve features, and the agents handle the rest.

## 🤖 The Agentic Loop

```
You Describe App → Agents Suggest Features → You Approve
  → Agents Design Architecture → Agents Build Code → Agents Test
  → Agents Review → Agents Fix Issues → Agents Deploy
```

**Agents work 24/7, never get tired, and follow best practices perfectly.**

## ✨ What Gets Automated

- ✅ Feature analysis and suggestions
- ✅ API contract design (OpenAPI specs)
- ✅ Database schema design (Prisma)
- ✅ Architecture planning
- ✅ Code implementation (React, Next.js, TypeScript)
- ✅ UI/UX design (shadcn/ui + Tailwind)
- ✅ Test writing (Jest, Playwright)
- ✅ Code reviews
- ✅ Accessibility validation (WCAG 2.1 AA)
- ✅ Performance optimization
- ✅ Security audits
- ✅ Git commits & PRs
- ✅ Documentation generation
- ✅ CI/CD setup
- ✅ Deployment

## 🎯 What You Control

You only intervene for:
- ✋ Approving suggested features
- ✋ Providing API keys/credentials
- ✋ Approving phase transitions
- ✋ Production deployment approval

Everything else runs automatically!

## 🚀 Quick Start

### 1. Initialize Your Project

```bash
/start-project
```

Describe your app:
- **App Name**: WanderPlan
- **Purpose**: Travel planning and itinerary management
- **Features**: Trip planning, budget tracking, photo sharing, etc.

### 2. Review Suggestions

The Product Strategy Advisor analyzes your idea and suggests missing features:

```
📋 Your Requested Features: 5
✨ Suggested Additional Features: 15
  🔴 CRITICAL: 5 (strongly recommended)
  🟡 HIGH VALUE: 7 (recommended)
  🟢 NICE-TO-HAVE: 3 (optional)
```

### 3. Approve Features

```
Approve all CRITICAL and HIGH VALUE features
```

### 4. Let It Build

```bash
/orchestrate   # Run next step
/auto-phase    # Complete entire phase automatically
/status        # Check progress anytime
```

Watch as agents:
- Design your API
- Design your database
- Plan implementation phases
- Build each feature
- Write tests
- Review code
- Deploy

## 📊 System Architecture

```
.claude/
├── protocols/           # How agents communicate
├── context/            # Runtime state
│   ├── project-state.json      # Current state
│   ├── agent-handoffs.md       # Agent communication log
│   └── blockers.md             # Issues needing your input
├── specs/              # Design documents
│   ├── project-idea.md
│   ├── api-specs.yaml
│   ├── db-schema.md
│   └── implementation-tasks.md
├── reports/            # Agent outputs
│   ├── code-review-phase-1.md
│   ├── test-results.md
│   └── performance-report.md
└── commands/
    └── agents/         # 15+ specialized agents
```

## 🤖 Meet Your Agents

### Planning Team
- **Product Strategy Advisor**: Analyzes ideas, suggests features
- **API Contract Designer**: Creates OpenAPI specs
- **Database Designer**: Designs Prisma schemas
- **System Architect**: Plans implementation phases

### Implementation Team
- **Staff Engineer**: Writes production-ready code
- **Premium UX Designer**: Creates beautiful UIs
- **Code Refactorer**: Cleans up messy code

### Quality Team
- **QA Testing Agent**: Writes comprehensive tests
- **Senior Code Reviewer**: Reviews code quality
- **Accessibility Agent**: Ensures WCAG compliance
- **Performance Agent**: Optimizes speed
- **Security Agent**: Finds vulnerabilities

### Operations Team
- **Git Workflow Agent**: Manages version control
- **DevOps Agent**: Sets up CI/CD & deployment
- **Documentation Agent**: Generates docs

## 🎮 Commands

### Core Workflow
- `/start-project` - Initialize new project
- `/orchestrate` - Run next agent (manual control)
- `/auto-phase` - Complete entire phase autonomously
- `/auto-build` - Build entire project (stops for approvals only)

### Monitoring
- `/status` - Beautiful dashboard with progress
- `/show-tasks` - Task list with completion status
- `/show-blockers` - Current blockers

### Control
- `/fix-blockers` - Resolve blockers interactively
- `/rollback [type]` - Undo changes (task/phase/agent)
- `/validate-ui` - Manual UI validation
- `/checkpoint` - Create restore point

## 📈 Example Output

### Phase 0: Planning (15 minutes)
```
✅ Product strategy analysis complete
✅ 25 features defined (10 original + 15 suggested)
✅ API specification created (45 endpoints)
✅ Database schema designed (12 tables)
✅ Implementation plan created (5 phases, 45 tasks)
```

### Phase 1: Authentication (2 hours)
```
✅ JWT authentication implemented
✅ Login/Register UI built
✅ Email verification added
✅ Password reset flow complete
✅ 23 tests written (100% coverage)
✅ Code review passed
✅ Accessibility score: 98/100
✅ Performance score: 94/100
```

### Phase 2-N: Features (varies)
Agents build each feature following the same cycle:
**Implement → Test → Review → Fix → Validate → Commit**

## 🔒 Security & Quality Standards

- **TypeScript strict mode** - No `any` types allowed
- **80%+ test coverage** - Required for critical paths
- **WCAG 2.1 AA** - All UI components compliant
- **Lighthouse >80** - Performance enforced
- **Security scans** - Automated vulnerability detection
- **Code reviews** - Every line reviewed before merge

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel (frontend), Railway (database)
- **CI/CD**: GitHub Actions

## 📖 Documentation

- **System Overview**: `CLAUDE.md`
- **Build Status**: `.claude/SYSTEM-STATUS.md`
- **Agent Protocols**: `.claude/protocols/`
- **API Docs**: `.claude/specs/api-specs.yaml`
- **Database Docs**: `.claude/specs/db-schema.md`

## 🐛 Troubleshooting

### Agent is stuck
```bash
/status  # Check if agent lock is stale
# System auto-clears locks after 30 minutes
```

### Want to undo changes
```bash
/rollback task    # Undo last task
/rollback phase   # Undo entire phase
/rollback agent   # Undo last agent's changes
```

### See what's blocking progress
```bash
/show-blockers
/fix-blockers    # Interactive resolution
```

### System seems broken
```bash
# Check logs
cat .claude/context/orchestrator-log.md
cat .claude/context/agent-handoffs.md

# Create checkpoint before debugging
/checkpoint
```

## 🎯 Benefits

### For You
- ⚡ **10x faster development** - Agents work 24/7
- 🎨 **Professional quality** - Best practices built-in
- 🧪 **Comprehensive testing** - 80%+ coverage standard
- 📱 **Accessibility** - WCAG 2.1 AA compliant
- ⚡ **Performance** - Lighthouse >80 enforced
- 🔒 **Secure** - Automated security audits

### For Your Team
- 📚 **Complete documentation** - Auto-generated
- 🔄 **Version control** - Clean git history
- 🎯 **Clear progress** - Visual dashboards
- 🐛 **Quality assurance** - Multi-agent review
- 🚀 **Easy deployment** - CI/CD included

## 🤝 How It Works (Technical)

1. **State Machine**: All agents read/write to `project-state.json`
2. **Communication**: Agents log handoffs in `agent-handoffs.md`
3. **Orchestration**: `/orchestrate` command spawns appropriate agent
4. **Validation**: Multiple agents validate different aspects (tests, accessibility, performance)
5. **Feedback Loops**: Issues found → agent fixes → re-validates (max 3 iterations)
6. **Error Recovery**: Automatic retries, graceful failures, user escalation

## 📝 License

MIT

## 🙏 Credits

Built with Claude Code and Anthropic's Agent SDK.

Powered by:
- Claude Sonnet 4.5
- Chrome DevTools MCP
- Context7 (library documentation)

---

**Ready to build your app?** Run `/start-project` and let the agents do the work!
