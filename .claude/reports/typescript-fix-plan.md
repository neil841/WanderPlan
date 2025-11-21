# TypeScript Error Fix Plan

## Summary
40 TypeScript errors across 13 files

## Categories

### 1. Prisma Enum/Type Mismatches (Fixed) ✅
- ✅ ExpenseCategory enum - Fixed by re-exporting from Prisma
- ✅ ActivityActionType enum - Fixed by adding missing values to schema
- ✅ SocketEvent.MESSAGE_UPDATED - Fixed by adding to enum

### 2. Missing Prisma Query Includes (15 errors)
**Files**: polls routes, ideas routes
**Issue**: Queries don't include related data (creator, options, votes)
**Fix**: Add includes to Prisma queries

### 3. Missing Type Properties (8 errors)
**Files**: trips route, collaborators page, messages page
**Issue**: Properties missing from types (createdBy, title, url → fileUrl, size → fileSize)
**Fix**: Update property names or add to types

### 4. Response Type Mismatches (3 errors)
**Files**: ideas/route.ts, polls/route.ts
**Issue**: Response types missing `page` property
**Fix**: Update response type definitions

### 5. authOptions Export (2 errors)
**Files**: trips/[tripId]/route/route.ts, weather/route.ts
**Issue**: authOptions not exported from auth-options.ts
**Fix**: Add export or update imports to use `auth()` directly

### 6. Schema Issues (2 errors)
**Files**: trips/route.ts
**Issue**: Tag unique constraint `name_tripId` doesn't exist
**Fix**: Update Prisma schema unique constraint

### 7. Calendar Component Types (5 errors)
**Files**: TripCalendar.tsx
**Issue**: FullCalendar type mismatches
**Fix**: Update to match FullCalendar v6 types

### 8. Framer Motion Types (2 errors)
**Files**: CollaboratorList.tsx
**Issue**: Variant types with string ease values
**Fix**: Use proper ease array or predefined ease names

### 9. Form Resolver Types (3 errors)
**Files**: CreatePollDialog.tsx
**Issue**: Form type mismatch with allowMultipleVotes optional/required
**Fix**: Make consistent in form and validation schema

## Execution Plan

### Phase 1: Database & Core Types (DONE)
- ✅ Update Prisma schema enums
- ✅ Re-export Prisma types
- ✅ Add SocketEvent.MESSAGE_UPDATED

### Phase 2: API Query Fixes (30 min)
- [ ] Fix poll queries to include creator, options, votes
- [ ] Fix document property names (url → fileUrl, size → fileSize)
- [ ] Fix Tag unique constraint
- [ ] Add auth

Options export or update imports

### Phase 3: Type Definitions (15 min)
- [ ] Update IdeasResponse to include page
- [ ] Update PollsResponse to include page
- [ ] Update TripDetails type
- [ ] Update EditEventDialogProps

### Phase 4: Component Fixes (20 min)
- [ ] Fix TripCalendar FullCalendar types
- [ ] Fix CollaboratorList Framer Motion variants
- [ ] Fix CreatePollDialog form types
- [ ] Fix NotificationItem JsonValue type assertions

### Phase 5: Verification (10 min)
- [ ] Run `npm run type-check`
- [ ] Fix any remaining errors
- [ ] Run `npm run build` to verify

**Total Estimated Time**: 90 minutes
