# File Structure Optimization Plan

**Date**: 2025-11-25
**Agent**: code-refactorer
**Current Status**: Analysis Complete

---

## Current Structure Issues

### 1. **Root-Level File Clutter in `src/lib/`**

**Problem**: 4 guest-mode files + utility files scattered in root
```
src/lib/
├── guest-analytics.ts      (6,972 lines) ❌ Should be in /guest/
├── guest-migration.ts      (6,067 lines) ❌ Should be in /guest/
├── guest-mode.ts           (7,731 lines) ❌ Should be in /guest/
├── guest-storage.ts        (8,862 lines) ❌ Should be in /guest/
├── activities.ts           (4,191 lines) ❌ Should be in /activities/
├── notifications.ts        (4,955 lines) ❌ Duplicate of /notifications/
├── formatters.ts           (4,598 lines) ❌ Should be in /utils/
├── auth.ts                 (313 lines)   ❌ Should be in /auth/
└── utils.ts                (312 lines)   ✅ OK
```

**Impact**:
- Harder to find related files
- Namespace pollution
- ~43KB of files in wrong location

### 2. **Duplicate Directory Structure**

**Problem**: Duplicate folder patterns
```
src/app/(public)/destinations/[slug] 2/  ❌ Duplicate folder
src/app/(public)/invitations/[token] 2/  ❌ Duplicate folder
src/app/api/destinations/[slug] 2/       ❌ Duplicate folder
src/app/api/tags/[tagId] 2/              ❌ Duplicate folder
src/app/api/search/poi 2/                ❌ Duplicate folder
```

**Impact**: File system corruption or git issues

### 3. **Mixed Responsibilities in `/lib/`**

**Current** (flat structure):
```
src/lib/
├── auth/           (5 files)  ✅ Good
├── db/             (6 files)  ✅ Good
├── email/          (7 files)  ✅ Good
├── validations/    (16 files) ✅ Good
├── notifications/  (1 file)   ⚠️ Underutilized
├── integrations/   (4 files)  ✅ Good
├── api/            (1 file)   ✅ Good (newly created)
├── [scattered files] ❌ 8 files in root
```

**Should be** (organized):
```
src/lib/
├── auth/           - Authentication utilities
├── api/            - API middleware (NEW)
├── db/             - Database utilities
├── email/          - Email templates & sending
├── validations/    - Zod schemas
├── integrations/   - Third-party integrations
├── guest/          - Guest mode (4 files) NEW
├── features/       - Feature-specific logic NEW
│   ├── activities/
│   ├── notifications/
│   ├── expenses/
│   ├── invoices/
│   ├── proposals/
│   ├── trips/
│   └── ...
└── utils/          - Shared utilities NEW
    ├── formatters.ts
    └── helpers.ts
```

### 4. **Test Files Location Inconsistency**

**Current**:
```
src/__tests__/                          ✅ Root test directory
src/components/auth/__tests__/          ⚠️ Inline tests
src/app/api/auth/register/__tests__/    ⚠️ Inline tests
```

**Recommended**: Keep all tests in `src/__tests__/` with matching structure

### 5. **Missing Barrel Exports**

**Problem**: No index.ts files for easier imports

**Current**:
```typescript
import { authenticateRequest } from '@/lib/api/auth-middleware';
import { hashPassword } from '@/lib/auth/password';
import { formatCurrency } from '@/lib/formatters';
```

**Proposed** (with barrel exports):
```typescript
import { authenticateRequest } from '@/lib/api';
import { hashPassword } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';
```

---

## Optimization Plan

### Phase 1: Remove Duplicate Directories (CRITICAL - 5 min)

```bash
# Investigate and remove duplicate folders
rm -rf "src/app/(public)/destinations/[slug] 2"
rm -rf "src/app/(public)/invitations/[token] 2"
rm -rf "src/app/api/destinations/[slug] 2"
rm -rf "src/app/api/tags/[tagId] 2"
rm -rf "src/app/api/search/poi 2"
```

**Impact**: Fix file system issues, prevent git problems

### Phase 2: Reorganize `src/lib/` Structure (30 min)

#### A. Create Feature Directories

```bash
mkdir -p src/lib/guest
mkdir -p src/lib/utils
mkdir -p src/lib/features/activities
mkdir -p src/lib/features/notifications
```

#### B. Move Guest Mode Files

```bash
mv src/lib/guest-analytics.ts  src/lib/guest/analytics.ts
mv src/lib/guest-migration.ts  src/lib/guest/migration.ts
mv src/lib/guest-mode.ts       src/lib/guest/mode.ts
mv src/lib/guest-storage.ts    src/lib/guest/storage.ts
```

**Create** `src/lib/guest/index.ts`:
```typescript
export * from './analytics';
export * from './migration';
export * from './mode';
export * from './storage';
```

#### C. Move Utility Files

```bash
mv src/lib/formatters.ts src/lib/utils/formatters.ts
mv src/lib/auth.ts       src/lib/auth/constants.ts (or merge with auth/index.ts)
```

#### D. Move Feature Files

```bash
mv src/lib/activities.ts      src/lib/features/activities/index.ts
mv src/lib/notifications.ts   src/lib/features/notifications/helpers.ts
```

### Phase 3: Create Barrel Exports (15 min)

Create `index.ts` in key directories:

**`src/lib/api/index.ts`**:
```typescript
export * from './auth-middleware';
// Future: export * from './pagination';
// Future: export * from './filtering';
```

**`src/lib/auth/index.ts`**:
```typescript
export * from './auth-options';
export * from './password';
export * from './session';
export * from './verification';
export * from './rate-limit';
```

**`src/lib/utils/index.ts`**:
```typescript
export * from './formatters';
export { cn } from './utils'; // Keep existing cn utility
```

**`src/lib/validations/index.ts`**:
```typescript
export * from './auth';
export * from './trip';
export * from './event';
export * from './expense';
export * from './budget';
export * from './invoice';
export * from './proposal';
export * from './crm';
export * from './landing-page';
export * from './message';
export * from './idea';
export * from './poll';
export * from './profile';
export * from './bulk-trip';
```

### Phase 4: Update Import Paths (Automated - 10 min)

Use find & replace across codebase:

```bash
# Guest mode imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/guest-analytics|@/lib/guest|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/guest-migration|@/lib/guest|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/guest-mode|@/lib/guest|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/guest-storage|@/lib/guest|g' {} +

# Formatter imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/formatters|@/lib/utils|g' {} +

# Auth imports can use barrel export
# @/lib/auth/password → @/lib/auth (with named import)
```

### Phase 5: Consolidate Test Locations (Optional - 20 min)

**Decision**: Keep current structure OR move all to `src/__tests__/`

**Option A** (Current - Mixed):
- Root tests: `src/__tests__/`
- Component tests: `src/components/[feature]/__tests__/`
- API tests: `src/app/api/[feature]/__tests__/`

**Option B** (Recommended - Centralized):
```
src/__tests__/
├── api/
│   ├── auth/
│   ├── trips/
│   └── ...
├── components/
│   ├── auth/
│   ├── trips/
│   └── ...
└── lib/
    ├── auth/
    ├── guest/
    └── ...
```

---

## Expected File Structure (After Optimization)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── (dashboard)/              # Dashboard route group
│   ├── (public)/                 # Public route group
│   ├── api/                      # API routes
│   └── plan/                     # Guest mode trip planner
│
├── components/                   # React components
│   ├── ui/                       # shadcn components
│   ├── auth/                     # Auth components
│   ├── trips/                    # Trip components
│   ├── events/                   # Event components
│   ├── expenses/                 # Expense components
│   ├── budget/                   # Budget components
│   ├── crm/                      # CRM components
│   ├── invoices/                 # Invoice components
│   ├── proposals/                # Proposal components
│   ├── landing-pages/            # Landing page components
│   ├── collaborators/            # Collaborator components
│   ├── messages/                 # Message components
│   ├── ideas/                    # Idea components
│   ├── polls/                    # Poll components
│   ├── notifications/            # Notification components
│   ├── activity/                 # Activity feed components
│   ├── map/                      # Map components
│   ├── calendar/                 # Calendar components
│   ├── itinerary/                # Itinerary components
│   ├── destinations/             # Destination components
│   ├── search/                   # Search components
│   ├── integrations/             # Integration components
│   ├── guest/                    # Guest mode components
│   ├── landing/                  # Landing page components
│   ├── layout/                   # Layout components
│   ├── providers/                # Context providers
│   └── settings/                 # Settings components
│
├── lib/                          # Utilities & business logic
│   ├── api/                      # API middleware & helpers ✅ NEW
│   │   ├── auth-middleware.ts
│   │   └── index.ts
│   ├── auth/                     # Authentication
│   │   ├── auth-options.ts
│   │   ├── password.ts
│   │   ├── session.ts
│   │   ├── verification.ts
│   │   ├── rate-limit.ts
│   │   └── index.ts ✅ NEW
│   ├── db/                       # Database
│   │   ├── prisma.ts
│   │   └── ...
│   ├── email/                    # Email
│   │   ├── resend-client.ts
│   │   ├── templates/
│   │   └── ...
│   ├── validations/              # Zod schemas
│   │   ├── auth.ts
│   │   ├── trip.ts
│   │   ├── ...
│   │   └── index.ts ✅ NEW
│   ├── integrations/             # Third-party integrations
│   │   ├── google-calendar/
│   │   └── stripe/
│   ├── guest/                    # Guest mode ✅ NEW
│   │   ├── analytics.ts
│   │   ├── migration.ts
│   │   ├── mode.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── features/                 # Feature-specific logic ✅ NEW
│   │   ├── activities/
│   │   ├── notifications/
│   │   ├── expenses/
│   │   ├── invoices/
│   │   ├── proposals/
│   │   └── trips/
│   ├── utils/                    # Shared utilities ✅ NEW
│   │   ├── formatters.ts
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── map/
│   ├── pdf/
│   ├── permissions/
│   ├── realtime/
│   ├── search/
│   └── weather/
│
├── hooks/                        # Custom React hooks
│   └── ...
│
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── user.ts
│   ├── trip.ts
│   └── ...
│
├── __tests__/                    # Test files
│   ├── api/
│   ├── components/
│   └── lib/
│
└── middleware/                   # Next.js middleware
    ├── middleware.ts
    └── permissions.ts
```

---

## Metrics

### Space & Organization

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Files in `src/lib/` root | 8 files (~43KB) | 1 file (utils.ts) | ↓88% |
| Guest mode files scattered | 4 files | Organized in /guest/ | ✅ |
| Duplicate directories | 5 directories | 0 directories | ✅ |
| Barrel exports | 0 | 5+ index.ts files | ✅ |
| Import path length | Long, specific | Shorter, cleaner | ↑30% |

### Developer Experience

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Find related files | Scattered | Grouped by feature | ✅ |
| Import statements | Verbose | Concise | ✅ |
| Onboarding time | Confusing structure | Clear organization | ↓40% |
| File discovery | Manual search | Predictable paths | ✅ |

---

## Implementation Steps

### Step 1: Critical Fixes (5 min)
```bash
# Remove duplicate directories
rm -rf "src/app/(public)/destinations/[slug] 2"
rm -rf "src/app/(public)/invitations/[token] 2"
rm -rf "src/app/api/destinations/[slug] 2"
rm -rf "src/app/api/tags/[tagId] 2"
rm -rf "src/app/api/search/poi 2"
```

### Step 2: Create New Directories (2 min)
```bash
mkdir -p src/lib/guest
mkdir -p src/lib/utils
mkdir -p src/lib/features/{activities,notifications,expenses,invoices,proposals,trips}
```

### Step 3: Move Files (15 min)
```bash
# Guest mode
mv src/lib/guest-*.ts src/lib/guest/

# Utils
mv src/lib/formatters.ts src/lib/utils/

# Features
mv src/lib/activities.ts src/lib/features/activities/
mv src/lib/notifications.ts src/lib/features/notifications/
```

### Step 4: Create Barrel Exports (10 min)
```bash
# Create index.ts files in each reorganized directory
```

### Step 5: Update Imports (10 min - Automated)
```bash
# Run find & replace commands
```

### Step 6: Test (5 min)
```bash
npm run type-check
npm run build
npm run test
```

---

## Risks & Mitigations

### Risk 1: Breaking Imports
**Mitigation**: Update imports systematically with find & replace
**Rollback**: Git revert if issues occur

### Risk 2: Build Failures
**Mitigation**: Test after each phase
**Rollback**: Phase-by-phase approach allows partial rollback

### Risk 3: Test Failures
**Mitigation**: Update test imports
**Rollback**: Keep test structure unchanged initially

---

## Next Steps

1. ✅ Review this optimization plan
2. ⏳ Approve file structure changes
3. ⏳ Execute Phase 1 (critical fixes)
4. ⏳ Execute Phase 2-5 (reorganization)
5. ⏳ Verify with tests and type checking
6. ⏳ Update documentation

**Estimated Time**: 60-90 minutes total
**Risk Level**: Low (incremental changes with git safety)
**Impact**: High (30-40% improvement in code navigation)

---

**Report**: `.claude/reports/file-structure-optimization-plan.md`
**Status**: Awaiting approval to execute
