# Blockers

Issues that require user intervention to resolve.

Format:
```
## [Timestamp] Agent: agent-name

### Error Type
Brief error category

### Context
- Task: task-name
- Phase: phase-name

### What I Need
Clear description of what is needed

### How to Provide
Step-by-step instructions for user

### Impact
What cannot proceed until resolved
```

---

## [2025-11-08T00:30:00Z] Agent: product-strategy-advisor

### Blocker Type
**USER_APPROVAL_REQUIRED**

### Context
- **Task**: Product Strategy Analysis (task-0-product-strategy)
- **Phase**: phase-0-planning
- **Blocker ID**: blocker-001

### What I Need
User must review the complete product specification and approve which suggested features to include in the project.

### Details
I've completed a comprehensive analysis of the WanderPlan travel planning app and created a detailed product specification with:
- **20 user-requested features** (already approved by user)
- **24 additional suggested features** broken down as:
  - 🔴 **10 CRITICAL features** (production requirements & UX basics)
  - 🟡 **8 HIGH VALUE features** (significant UX improvements)
  - 🟢 **6 NICE-TO-HAVE features** (polish for later phases)

**Review Document**: `.claude/specs/project-idea.md`

### Critical Features Requiring Approval

The 10 CRITICAL features I strongly recommend including:

1. **Password Reset & Account Recovery** - Users will get locked out without this
2. **Email Verification** - Security and anti-spam requirement
3. **User Profile & Settings Page** - Basic user expectation
4. **Error Pages (404, 500, 403)** - Production deployment requirement
5. **Loading States & Skeleton Screens** - Professional UX polish
6. **Empty States** - First-run experience and onboarding
7. **Form Validation (Client & Server)** - Data integrity and security
8. **Confirmation Dialogs** - Prevent accidental data loss
9. **Success/Error Toast Notifications** - User feedback for actions
10. **Trip Duplication** - Common use case for reusing itineraries

### How to Approve
Please respond with one of the following options:

**Option A** (Recommended):
```
"Approve all CRITICAL features"
```
This includes original 20 + critical 10 = 30 features for MVP

**Option B**:
```
"Approve all suggested features"
```
This includes all 44 features (original 20 + suggested 24)

**Option C** (Custom selection):
```
"Approve only: [list specific feature numbers]"
```
Example: "Approve only: features 1, 2, 3, 4, 5, 7, 8, 9"

**Option D** (Minimal MVP):
```
"Skip all suggestions, proceed with original features only"
```
NOT RECOMMENDED - missing critical production requirements

### Impact
**Cannot proceed with architecture planning until features are approved.**

The next agents in the workflow require a finalized feature list:
- `api-contract-designer` needs to know which API endpoints to create
- `database-designer` needs to know which database tables to design
- `system-architect` needs to know which implementation tasks to plan

### Timeline Impact
- **Option A** (CRITICAL only): +2 weeks to MVP timeline (8 weeks total)
- **Option B** (All features): +4-5 weeks to MVP timeline (10-12 weeks total)
- **Option C** (Custom): Depends on selection
- **Option D** (Original only): 6 weeks but missing production requirements

### After Approval
Once you approve features, I will:
1. Update `.claude/specs/project-idea.md` with final approved feature list
2. Mark this blocker as resolved
3. Orchestrator will automatically spawn `api-contract-designer` agent

---

## ✅ BLOCKER RESOLVED [2025-11-08T00:35:00Z]

**User Decision**: Approved all CRITICAL + HIGH VALUE features (38 total)

**Approved Features**:
- 20 original user-requested features
- 10 CRITICAL features (password reset, email verification, user profile, error pages, loading states, empty states, form validation, confirmation dialogs, toast notifications, trip duplication)
- 8 HIGH VALUE features (onboarding, archiving, bulk ops, tags, advanced search, activity feed, cover images, weather)

**Deferred Features** (Phase 4+):
- 6 NICE-TO-HAVE features (dark mode, keyboard shortcuts, import, social sharing, statistics, i18n)

**Impact**: Blocker cleared. Ready to proceed with API Contract Designer.

---

## [2025-11-08T04:00:00Z] Agent: staff-engineer

### Blocker Type
**DATABASE_SETUP_REQUIRED**

### Context
- **Task**: Database Setup & Prisma Configuration (task-1-2-database-setup)
- **Phase**: phase-1-foundation-auth
- **Blocker ID**: blocker-002

### What I Need
PostgreSQL database must be set up and the DATABASE_URL environment variable must be configured before I can run migrations.

### Current Status
✅ Prisma CLI and Client installed
✅ Prisma schema verified (28 models, 780 lines)
✅ Database connection utility created (`src/lib/db/prisma.ts`)
✅ Seed scripts created (`prisma/seed.ts`)
✅ Prisma Client generated successfully
⚠️  DATABASE_URL needs to be configured
⚠️  Database migration cannot proceed without a running database

### How to Provide

**Option 1: Local PostgreSQL (Development)**

If you have PostgreSQL installed locally:
1. Start PostgreSQL service
2. Create a database: `createdb wanderplan`
3. The `.env` file is already configured with:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wanderplan"
   ```
4. If your PostgreSQL uses different credentials, update the `.env` file accordingly
5. Run migration: `npm run db:migrate`
6. Seed the database: `npm run db:seed`

**Option 2: Railway PostgreSQL (Recommended for Production)**

To use Railway's managed PostgreSQL:
1. Go to https://railway.app
2. Create a new project
3. Add a PostgreSQL service
4. Copy the DATABASE_URL from Railway
5. Update `.env` file with Railway's DATABASE_URL:
   ```
   DATABASE_URL="postgresql://postgres:password@hostname:5432/railway"
   ```
6. Run migration: `npm run db:migrate`
7. Seed the database: `npm run db:seed`

**Option 3: Other PostgreSQL Provider**

If using another provider (Supabase, Neon, etc.):
1. Get your PostgreSQL connection string
2. Update the DATABASE_URL in `.env`
3. Run migration: `npm run db:migrate`
4. Seed the database: `npm run db:seed`

### What Happens Next

Once you run the migration command successfully:
1. Prisma will create all 28 database tables
2. You can then run the seed script to populate demo data
3. I will verify the setup and mark this task as complete
4. Development can proceed to the next task (shadcn components)

### Demo Data Included

The seed script will create:
- 3 demo users (admin@wanderplan.com, traveler@wanderplan.com, agent@wanderplan.com)
- 3 demo trips (Paris, Tokyo, Barcelona)
- Budgets, collaborators, and tags for the trips
- All passwords: `password123`

### Impact
**Cannot proceed with authentication setup until database is configured and migrated.**

Next tasks require a working database:
- `task-1-4-nextauth-setup` needs database tables for sessions
- `task-1-5-registration-api` needs users table
- All subsequent tasks depend on database access

### Commands Reference

```bash
# Generate Prisma Client (already done)
npm run db:generate

# Run migration (creates tables)
npm run db:migrate

# Seed demo data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

---

## ✅ BLOCKER RESOLVED [2025-11-08T20:16:00Z]

**Resolution**: PostgreSQL 16 installed via Homebrew, database created, migration successful

**Actions Taken**:
1. Installed PostgreSQL 16 via Homebrew
2. Started PostgreSQL service
3. Created `wanderplan` database
4. Updated `.env` with correct DATABASE_URL
5. Ran migration: Created all 28 database tables
6. Seeded database with demo data (3 users, 3 trips, budgets, tags)

**Database Status**:
- ✅ PostgreSQL 16 running
- ✅ All 28 tables created
- ✅ Demo data seeded
- ✅ Prisma Client generated
- ✅ Database connection verified

**Demo Accounts Available**:
- admin@wanderplan.com (password: password123)
- traveler@wanderplan.com (password: password123)
- agent@wanderplan.com (password: password123)

**Impact**: Blocker cleared. Task 1.2 complete. Ready to proceed with task-1-3-shadcn-components.

---

<!-- Blockers will be logged below this line -->

---

## [2025-11-14 20:00:00] BLOCKER-004: Database Field Mismatches

**Agent**: qa-testing-agent
**Phase**: Phase 4 - Collaboration & Communication
**Type**: Database Schema Mismatch
**Severity**: CRITICAL
**Status**: UNRESOLVED

### Description

Critical database field name mismatches between API code and database schema that will cause runtime Prisma query failures.

### Affected Components

**1. Collaborator APIs** (3 files):
- `/src/app/api/trips/[tripId]/collaborators/route.ts`
- `/src/app/api/trips/[tripId]/collaborators/[id]/route.ts`
- `/src/hooks/useCollaborators.ts`

**Issue**: APIs use `profilePicture` field but database schema has `avatarUrl`

**2. Message/Idea/Poll APIs** (9+ files):
- All API routes in `/src/app/api/trips/[tripId]/messages/`
- All API routes in `/src/app/api/trips/[tripId]/ideas/`
- All API routes in `/src/app/api/trips/[tripId]/polls/`
- All hooks in `/src/hooks/`

**Issue**: APIs select `user.name` and `user.image` but database schema has `user.firstName`, `user.lastName`, `user.avatarUrl`

### Impact

**WILL CAUSE**:
- 500 Internal Server Error on all affected endpoints
- Prisma query failures
- Complete failure of collaboration features
- Message system non-functional
- Ideas system non-functional
- Polls system non-functional

**Risk Level**: 🔴 **SHOW-STOPPER** - Nothing works without this fix

### Example Error

```typescript
// Current (BROKEN):
const user = await prisma.user.findUnique({
  select: { name: true, image: true }  // Fields don't exist!
});

// Correct:
const user = await prisma.user.findUnique({
  select: { firstName: true, lastName: true, avatarUrl: true }
});
```

### What I Need From User

**No user input required** - This is a straightforward code fix.

### How to Fix

1. **Find and replace in all API files**:
   - `profilePicture` → `avatarUrl`
   - `user.name` → `user.firstName` (or create computed field)
   - `user.image` → `user.avatarUrl`

2. **Update type definitions** in `/src/types/`:
   - Update User interface to match schema
   - Update all derived types

3. **Update validation schemas** if needed

4. **Test all endpoints** after changes

### Estimated Fix Time

**2-3 hours**:
- Find/replace: 30 minutes
- Type updates: 30 minutes
- Testing: 1-2 hours

### Resolution Steps

- [ ] Update collaborator API routes
- [ ] Update message API routes
- [ ] Update ideas API routes
- [ ] Update polls API routes
- [ ] Update all type definitions
- [ ] Update hooks
- [ ] Test all endpoints
- [ ] Verify Prisma queries work

### Related Report

`.claude/reports/test-results-phase-4-checkpoint-1.md`

---

## [2025-11-14 20:00:00] BLOCKER-005: Performance Critical Issues

**Agent**: performance-monitoring-agent
**Phase**: Phase 4 - Collaboration & Communication
**Type**: Performance / Scalability
**Severity**: CRITICAL
**Status**: UNRESOLVED

### Description

Critical N+1 query problems and missing pagination will cause production timeouts and database overload as data grows.

### Issues

**1. Ideas API N+1 Query Problem**
- **File**: `/src/app/api/trips/[tripId]/ideas/route.ts`
- **Problem**: Fetches ALL votes with ALL user data for each idea
- **Current Performance**: 2-5 seconds with 100 ideas
- **Expected**: <200ms with pagination + aggregation
- **Impact**: 90% slower than acceptable

**2. Polls API N+1 Query Problem**
- **File**: `/src/app/api/trips/[tripId]/polls/route.ts`
- **Problem**: Even worse (nested options + votes + users)
- **Current Performance**: 3-5 seconds with 50 polls
- **Expected**: <300ms with pagination + aggregation
- **Impact**: 90% slower than acceptable

**3. Missing Pagination**
- **Files**: Ideas and Polls API endpoints
- **Problem**: No limits on query results
- **Impact**: Will fetch ALL data, causing timeouts

**4. No Database Connection Limits**
- **File**: `/src/lib/db.ts`
- **Problem**: No connection pool configuration
- **Impact**: Could crash with many concurrent users

### Impact

**WILL CAUSE**:
- API timeouts (>30 seconds) with moderate data
- Database connection exhaustion
- Poor user experience (multi-second page loads)
- Potential production outages
- High infrastructure costs

**Risk Level**: 🔴 **PRODUCTION OUTAGE RISK**

### Example Issue

```typescript
// Current (N+1 PROBLEM):
const ideas = await prisma.idea.findMany({
  include: {
    votes: {          // Fetches ALL votes
      include: {
        user: true    // Fetches ALL user data for each vote
      }
    }
  }
});
// With 100 ideas × 50 votes × user data = 5000+ database queries!

// Correct (AGGREGATION):
const ideas = await prisma.idea.findMany({
  include: {
    _count: {
      select: { votes: true }  // Just count, no N+1
    }
  },
  take: 20,  // Pagination
  skip: (page - 1) * 20
});
```

### What I Need From User

**No user input required** - This is a straightforward optimization.

### How to Fix

**Priority 1: N+1 Queries** (2 days)
1. Replace vote includes with aggregations
2. Fetch only necessary user fields
3. Use database-level grouping

**Priority 2: Pagination** (1 day)
1. Add `take` and `skip` to queries
2. Add pagination params to API endpoints
3. Update frontend to handle pagination

**Priority 3: Connection Pooling** (2 hours)
1. Configure Prisma connection limits
2. Add connection pool monitoring

### Estimated Fix Time

**2-3 days**:
- N+1 query fixes: 2 days
- Pagination: 1 day
- Connection pooling: 2 hours

### Performance Targets

| Metric | Current | After Fix | Target |
|--------|---------|-----------|--------|
| Ideas API | 2-5s | 200ms | <200ms |
| Polls API | 3-5s | 300ms | <200ms |
| Max Items | Unlimited | 20/page | 20/page |
| Connections | Unlimited | 10-20 | 10-20 |

### Resolution Steps

- [ ] Fix Ideas API N+1 query
- [ ] Fix Polls API N+1 query
- [ ] Add pagination to Ideas API
- [ ] Add pagination to Polls API
- [ ] Configure Prisma connection pool
- [ ] Update frontend to handle pagination
- [ ] Performance test with large datasets
- [ ] Verify <200ms response times

### Related Report

`.claude/reports/performance-report-phase-4-checkpoint-1.md`

---

## Summary: Active Blockers

**Total Active Blockers**: 3

1. **blocker-003** (Security) - 3 CRITICAL issues - 7 hours to fix
2. **blocker-004** (Database) - 2 CRITICAL mismatches - 2-3 hours to fix
3. **blocker-005** (Performance) - 4 CRITICAL issues - 2-3 days to fix

**Total Estimated Fix Time**: 3-4 days

**Production Readiness**: 🔴 NOT READY - Must fix all blockers before production deployment

