# Implementation Tasks - WanderPlan

This document breaks down all 38 approved features into 6 implementation phases with 78 detailed tasks.

**Total Tasks**: 78
**Total Phases**: 6 (excluding Phase 0 which is complete)
**Estimated Timeline**: 16-20 weeks for full implementation

---

## Phase 0: Planning & Architecture ✅ COMPLETE

**Status**: Complete
**Duration**: 1 week
**Tasks**: 4/4 completed

| Task ID | Title | Status |
|---------|-------|--------|
| task-0-product-strategy | Product Strategy & Feature Planning | ✅ Complete |
| task-0-api-design | API Contract Design | ✅ Complete |
| task-0-database-design | Database Schema Design | ✅ Complete |
| task-0-architecture | System Architecture & Task Breakdown | ✅ Complete |

**Deliverables**:
- ✅ `.claude/specs/project-idea.md` (38 features)
- ✅ `.claude/specs/personas.md` (4 user personas)
- ✅ `.claude/specs/api-specs.yaml` (85 endpoints)
- ✅ `prisma/schema.prisma` (28 models)
- ✅ `.claude/specs/architecture-design.md`
- ✅ `.claude/specs/implementation-tasks.md` (this file)

---

## Phase 1: Foundation & Authentication

**Goal**: Set up project foundation, authentication system, and user management

**Duration**: 2-3 weeks
**Tasks**: 12
**Dependencies**: Phase 0 complete

### Task 1.1: Project Setup & Configuration

**ID**: `task-1-1-project-setup`
**Complexity**: M
**Dependencies**: None

**Description**:
Initialize Next.js 14 project with TypeScript, configure Tailwind CSS, shadcn/ui, ESLint, Prettier, and all development tools.

**Acceptance Criteria**:
- [ ] Next.js 14 project initialized with App Router
- [ ] TypeScript configured in strict mode
- [ ] Tailwind CSS installed and configured
- [ ] shadcn/ui initialized with theme system
- [ ] ESLint + Prettier configured and running
- [ ] Git initialized with proper .gitignore
- [ ] Environment variables template (.env.example) created
- [ ] Development server runs successfully

**Files to Create**:
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `next.config.js`
- `.eslintrc.json`
- `.prettierrc`
- `.env.example`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `components.json` (shadcn config)

**Testing Requirements**:
- Verify dev server starts without errors
- Verify TypeScript compilation succeeds
- Verify linter runs without errors

---

### Task 1.2: Database Setup & Prisma Configuration

**ID**: `task-1-2-database-setup`
**Complexity**: M
**Dependencies**: task-1-1-project-setup

**Description**:
Set up PostgreSQL database, configure Prisma ORM, run initial migration, and create database connection utilities.

**Acceptance Criteria**:
- [ ] PostgreSQL database created (local or Railway)
- [ ] Prisma initialized and configured
- [ ] `schema.prisma` file created with all 28 models
- [ ] Initial migration created and applied
- [ ] Prisma Client generated successfully
- [ ] Database connection utility created
- [ ] Connection pooling configured
- [ ] Seed script created for demo data

**Files to Create**:
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/db/prisma.ts`
- `src/lib/db/seed-data/users.ts`
- `src/lib/db/seed-data/trips.ts`

**Testing Requirements**:
- Run `prisma migrate dev` successfully
- Verify database connection works
- Run seed script successfully
- Query database with Prisma Client

---

### Task 1.3: shadcn/ui Component Installation

**ID**: `task-1-3-shadcn-components`
**Complexity**: S
**Dependencies**: task-1-1-project-setup

**Description**:
Install all required shadcn/ui components for authentication and base UI (Button, Input, Form, Card, etc.).

**Acceptance Criteria**:
- [ ] Button component installed
- [ ] Input component installed
- [ ] Form component installed (with react-hook-form + Zod)
- [ ] Card component installed
- [ ] Label component installed
- [ ] Alert component installed
- [ ] Toast component installed (Sonner)
- [ ] All components render correctly
- [ ] Theme system working (light/dark mode support)

**Files to Create**:
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`

**Testing Requirements**:
- Visual test each component
- Verify accessibility (keyboard navigation, ARIA)

---

### Task 1.4: NextAuth.js Configuration

**ID**: `task-1-4-nextauth-setup`
**Complexity**: L
**Dependencies**: task-1-2-database-setup

**Description**:
Configure NextAuth.js with Prisma adapter, set up credentials provider (email/password), configure session management, and create auth utilities.

**Acceptance Criteria**:
- [ ] NextAuth.js installed and configured
- [ ] Prisma adapter connected
- [ ] Credentials provider configured (email + password)
- [ ] JWT session strategy configured
- [ ] Auth callback functions implemented
- [ ] Session utilities created
- [ ] Auth middleware created for protected routes
- [ ] Environment variables configured (NEXTAUTH_SECRET, etc.)

**Files to Create**:
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth/auth-options.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/password.ts` (bcrypt utilities)
- `src/middleware.ts` (route protection)
- `src/types/auth.ts`

**Testing Requirements**:
- Verify NextAuth session creation works
- Test JWT token generation
- Test middleware protection

---

### Task 1.5: User Registration API

**ID**: `task-1-5-registration-api`
**Complexity**: M
**Dependencies**: task-1-4-nextauth-setup

**Description**:
Implement user registration API endpoint with email/password, input validation, password hashing, and email verification token generation.

**Acceptance Criteria**:
- [ ] POST `/api/auth/register` endpoint created
- [ ] Input validation with Zod (email format, password strength)
- [ ] Password hashing with bcrypt (10 rounds)
- [ ] Duplicate email check
- [ ] User creation in database
- [ ] Verification token generation
- [ ] Error handling (duplicate email, validation errors)
- [ ] Rate limiting configured

**Files to Create**:
- `src/app/api/auth/register/route.ts`
- `src/lib/validations/auth.ts` (Zod schemas)
- `src/lib/auth/verification.ts`

**Testing Requirements**:
- Unit tests for validation
- Integration test for user creation
- Test duplicate email handling
- Test password hashing

---

### Task 1.6: User Registration UI

**ID**: `task-1-6-registration-ui`
**Complexity**: M
**Dependencies**: task-1-3-shadcn-components, task-1-5-registration-api

**Description**:
Create user registration page with form validation, error handling, and success feedback.

**Acceptance Criteria**:
- [ ] Registration page created at `/register`
- [ ] Form with firstName, lastName, email, password fields
- [ ] Client-side validation with react-hook-form + Zod
- [ ] Password strength indicator
- [ ] Error message display
- [ ] Success message with email verification prompt
- [ ] Loading state during submission
- [ ] Link to login page
- [ ] Responsive design (mobile-friendly)
- [ ] Accessibility compliant (WCAG 2.1 AA)

**Files to Create**:
- `src/app/(auth)/register/page.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/PasswordStrength.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Accessibility audit (axe-core)
- Test form validation
- Test error handling
- Test success flow

---

### Task 1.7: Login API

**ID**: `task-1-7-login-api`
**Complexity**: M
**Dependencies**: task-1-4-nextauth-setup

**Description**:
Implement login API endpoint using NextAuth credentials provider with email verification check and password validation.

**Acceptance Criteria**:
- [ ] Login handled by NextAuth credentials provider
- [ ] Email verification check (warn if not verified)
- [ ] Password comparison with bcrypt
- [ ] JWT token creation
- [ ] Session creation
- [ ] Error handling (invalid credentials, unverified email)
- [ ] Rate limiting for brute force protection

**Files to Modify**:
- `src/lib/auth/auth-options.ts` (add credentials provider logic)

**Testing Requirements**:
- Test valid login
- Test invalid password
- Test nonexistent user
- Test unverified email warning

---

### Task 1.8: Login UI

**ID**: `task-1-8-login-ui`
**Complexity**: M
**Dependencies**: task-1-3-shadcn-components, task-1-7-login-api

**Description**:
Create login page with form, error handling, "Remember me" checkbox, and links to registration/password reset.

**Acceptance Criteria**:
- [ ] Login page created at `/login`
- [ ] Form with email and password fields
- [ ] Client-side validation
- [ ] Error message display
- [ ] Loading state during submission
- [ ] "Remember me" checkbox
- [ ] Link to registration page
- [ ] Link to password reset page
- [ ] Redirect to dashboard after successful login
- [ ] Responsive design
- [ ] Accessibility compliant

**Files to Create**:
- `src/app/(auth)/login/page.tsx`
- `src/components/auth/LoginForm.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Accessibility audit
- Test login flow end-to-end
- Test error handling

---

### Task 1.9: Email Verification System

**ID**: `task-1-9-email-verification`
**Complexity**: L
**Dependencies**: task-1-5-registration-api

**Description**:
Implement email verification flow: send verification email, verify token, and confirm email.

**Acceptance Criteria**:
- [ ] POST `/api/auth/verify-email/send` endpoint (resend verification)
- [ ] GET `/api/auth/verify-email` endpoint (verify token)
- [ ] Email sending service configured (SendGrid or Resend)
- [ ] Email template created (HTML + plain text)
- [ ] Token expiry handling (24 hour expiry)
- [ ] User.emailVerified update on success
- [ ] Verification success page
- [ ] Error handling (expired token, invalid token)

**Files to Create**:
- `src/app/api/auth/verify-email/send/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/lib/email/client.ts`
- `src/lib/email/templates/verification.tsx`
- `src/app/(auth)/verify-email/page.tsx`

**Testing Requirements**:
- Test email sending (use test mode)
- Test token verification
- Test token expiry
- Test duplicate verification

---

### Task 1.10: Password Reset Flow

**ID**: `task-1-10-password-reset`
**Complexity**: L
**Dependencies**: task-1-9-email-verification

**Description**:
Implement password reset flow: request reset, send email, verify token, update password.

**Acceptance Criteria**:
- [ ] POST `/api/auth/password-reset/request` endpoint
- [ ] POST `/api/auth/password-reset/confirm` endpoint
- [ ] Password reset email template
- [ ] Token generation with 1-hour expiry
- [ ] Password update with bcrypt hashing
- [ ] Password reset request page (`/forgot-password`)
- [ ] Password reset confirmation page (`/reset-password`)
- [ ] Success feedback
- [ ] Error handling (expired token, invalid token)

**Files to Create**:
- `src/app/api/auth/password-reset/request/route.ts`
- `src/app/api/auth/password-reset/confirm/route.ts`
- `src/lib/email/templates/password-reset.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`

**Testing Requirements**:
- Test reset request flow
- Test token expiry
- Test password update
- Test email sending

---

### Task 1.11: User Profile & Settings

**ID**: `task-1-11-user-profile`
**Complexity**: M
**Dependencies**: task-1-4-nextauth-setup

**Description**:
Create user profile page with settings: update name, email, password, timezone, locale, and profile picture.

**Acceptance Criteria**:
- [ ] GET `/api/user/profile` endpoint
- [ ] PATCH `/api/user/profile` endpoint
- [ ] Profile settings page at `/settings/profile`
- [ ] Form to update firstName, lastName, email
- [ ] Password change form (current + new password)
- [ ] Timezone selector
- [ ] Locale/language selector
- [ ] Profile picture upload (S3/R2 integration)
- [ ] Success/error feedback
- [ ] Email change requires re-verification

**Files to Create**:
- `src/app/api/user/profile/route.ts`
- `src/app/api/user/avatar/route.ts`
- `src/app/(dashboard)/settings/profile/page.tsx`
- `src/components/settings/ProfileForm.tsx`
- `src/components/settings/PasswordChangeForm.tsx`
- `src/components/settings/AvatarUpload.tsx`
- `src/lib/storage/s3.ts` (file upload utilities)

**Testing Requirements**:
- Test profile update
- Test password change
- Test avatar upload
- Test email change flow

---

### Task 1.12: Protected Route Layout & Navigation

**ID**: `task-1-12-dashboard-layout`
**Complexity**: M
**Dependencies**: task-1-4-nextauth-setup

**Description**:
Create dashboard layout with sidebar navigation, header with user menu, and protected route structure.

**Acceptance Criteria**:
- [ ] Dashboard layout created at `src/app/(dashboard)/layout.tsx`
- [ ] Sidebar navigation with menu items
- [ ] Header with user avatar and dropdown menu
- [ ] Logout functionality
- [ ] Mobile responsive navigation (hamburger menu)
- [ ] Active route highlighting
- [ ] Session check and redirect to login if not authenticated
- [ ] Loading state during session check

**Files to Create**:
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/UserMenu.tsx`
- `src/components/layout/MobileNav.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test authentication redirect
- Test logout flow
- Test mobile navigation
- Accessibility audit

---

## Phase 2: Trip Management Core

**Goal**: Implement trip creation, listing, management, and basic trip details

**Duration**: 2-3 weeks
**Tasks**: 13
**Dependencies**: Phase 1 complete

### Task 2.1: Trip List API

**ID**: `task-2-1-trip-list-api`
**Complexity**: M
**Dependencies**: task-1-2-database-setup

**Description**:
Implement trip listing API with filtering, search, pagination, and sorting.

**Acceptance Criteria**:
- [ ] GET `/api/trips` endpoint created
- [ ] Pagination support (page, limit)
- [ ] Filtering (status: upcoming/past/archived, tags)
- [ ] Search by title/destination
- [ ] Sorting (createdAt, startDate, endDate)
- [ ] Include trip metadata (collaborator count, event count, budget)
- [ ] Row-level access control (user's trips + shared trips)
- [ ] Response includes pagination metadata

**Files to Create**:
- `src/app/api/trips/route.ts`
- `src/lib/db/repositories/trip.repository.ts`
- `src/lib/validations/trip.ts`

**Testing Requirements**:
- Unit tests for repository
- Integration test for API endpoint
- Test pagination
- Test filtering and search
- Test access control

---

### Task 2.2: Trip List UI

**ID**: `task-2-2-trip-list-ui`
**Complexity**: M
**Dependencies**: task-2-1-trip-list-api, task-1-12-dashboard-layout

**Description**:
Create trip list page with grid/list view, filtering, search, and pagination.

**Acceptance Criteria**:
- [ ] Trip list page at `/trips`
- [ ] Grid and list view toggle
- [ ] Trip cards showing: title, destination, dates, cover image, collaborators
- [ ] Search input with debounce
- [ ] Filter by status (upcoming/past/archived)
- [ ] Filter by tags
- [ ] Pagination controls
- [ ] Empty state (no trips yet)
- [ ] Loading skeleton
- [ ] Link to create new trip
- [ ] Responsive design

**Files to Create**:
- `src/app/(dashboard)/trips/page.tsx`
- `src/components/trips/TripList.tsx`
- `src/components/trips/TripCard.tsx`
- `src/components/trips/TripFilters.tsx`
- `src/hooks/useTrips.ts` (TanStack Query)

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test filtering and search
- Test pagination
- Accessibility audit

---

### Task 2.3: Trip Creation API

**ID**: `task-2-3-trip-create-api`
**Complexity**: M
**Dependencies**: task-2-1-trip-list-api

**Description**:
Implement trip creation API with validation and initial budget creation.

**Acceptance Criteria**:
- [ ] POST `/api/trips` endpoint created
- [ ] Input validation (title required, date validation)
- [ ] Trip creation in database
- [ ] Budget creation (if provided)
- [ ] Cover image upload support
- [ ] Tag creation/association
- [ ] Return complete trip object
- [ ] Error handling

**Files to Create**:
- Modify `src/app/api/trips/route.ts` (add POST handler)
- `src/lib/validations/trip.ts` (trip creation schema)

**Testing Requirements**:
- Unit tests for validation
- Integration test for trip creation
- Test with/without budget
- Test cover image upload

---

### Task 2.4: Trip Creation UI

**ID**: `task-2-4-trip-create-ui`
**Complexity**: M
**Dependencies**: task-2-3-trip-create-api

**Description**:
Create trip creation dialog/page with form for basic trip details.

**Acceptance Criteria**:
- [ ] Trip creation dialog (modal)
- [ ] Form fields: title, destination, startDate, endDate, description
- [ ] Date range picker (start and end dates)
- [ ] Destination autocomplete (Nominatim API)
- [ ] Cover image upload
- [ ] Budget section (optional, amount + currency)
- [ ] Tag input with autocomplete
- [ ] Form validation
- [ ] Success feedback and redirect to trip details
- [ ] Error handling

**Files to Create**:
- `src/components/trips/CreateTripDialog.tsx`
- `src/components/trips/TripForm.tsx`
- `src/components/trips/DestinationAutocomplete.tsx`
- `src/components/ui/date-range-picker.tsx` (shadcn component)

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test form validation
- Test destination autocomplete
- Test date picker
- Accessibility audit

---

### Task 2.5: Trip Details API

**ID**: `task-2-5-trip-details-api`
**Complexity**: M
**Dependencies**: task-2-3-trip-create-api

**Description**:
Implement trip details API with complete trip data including events, collaborators, budget, and expenses.

**Acceptance Criteria**:
- [ ] GET `/api/trips/[tripId]` endpoint created
- [ ] Return complete trip object with relations:
  - Events (ordered by date and order field)
  - Collaborators with user details
  - Budget with expense summary
  - Documents
  - Tags
- [ ] Access control check (user is owner or collaborator)
- [ ] 404 if trip not found
- [ ] 403 if user lacks permission

**Files to Create**:
- `src/app/api/trips/[tripId]/route.ts`

**Testing Requirements**:
- Test trip retrieval with all relations
- Test access control
- Test 404 and 403 responses

---

### Task 2.6: Trip Details UI - Overview Tab

**ID**: `task-2-6-trip-overview-ui`
**Complexity**: L
**Dependencies**: task-2-5-trip-details-api

**Description**:
Create trip details page with overview tab showing trip metadata, dates, collaborators, and quick stats.

**Acceptance Criteria**:
- [ ] Trip details page at `/trips/[tripId]`
- [ ] Tab navigation (Overview, Itinerary, Calendar, Map, Budget, etc.)
- [ ] Overview tab showing:
  - Trip title, destination, dates
  - Cover image
  - Description
  - Collaborators list with avatars
  - Quick stats (X events, Y expenses, Z total budget)
  - Tag list
- [ ] Edit trip button (for owners/admins)
- [ ] Share trip button
- [ ] Archive trip button
- [ ] Responsive design

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/page.tsx`
- `src/components/trips/TripHeader.tsx`
- `src/components/trips/TripTabs.tsx`
- `src/components/trips/TripOverview.tsx`
- `src/components/trips/CollaboratorList.tsx`
- `src/hooks/useTrip.ts`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test data loading
- Accessibility audit

---

### Task 2.7: Trip Update API

**ID**: `task-2-7-trip-update-api`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement trip update API with permission checks and partial updates.

**Acceptance Criteria**:
- [ ] PATCH `/api/trips/[tripId]` endpoint created
- [ ] Permission check (owner or admin collaborator)
- [ ] Support partial updates
- [ ] Update trip metadata (title, destination, dates, description)
- [ ] Update cover image
- [ ] Update tags
- [ ] Validation
- [ ] Error handling (403 if no permission)

**Files to Modify**:
- `src/app/api/trips/[tripId]/route.ts` (add PATCH handler)

**Testing Requirements**:
- Test trip update
- Test permission checks
- Test partial updates
- Test validation

---

### Task 2.8: Trip Edit UI

**ID**: `task-2-8-trip-edit-ui`
**Complexity**: M
**Dependencies**: task-2-7-trip-update-api

**Description**:
Create trip edit dialog/page with form pre-filled with existing trip data.

**Acceptance Criteria**:
- [ ] Edit trip dialog (modal)
- [ ] Form pre-filled with existing data
- [ ] Same fields as trip creation
- [ ] Update cover image
- [ ] Success feedback
- [ ] Error handling
- [ ] Only shown to users with edit permission

**Files to Create**:
- `src/components/trips/EditTripDialog.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test form pre-fill
- Test update flow
- Accessibility audit

---

### Task 2.9: Trip Delete/Archive API

**ID**: `task-2-9-trip-delete-api`
**Complexity**: S
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement trip archive/unarchive and delete endpoints with permission checks.

**Acceptance Criteria**:
- [ ] PATCH `/api/trips/[tripId]/archive` endpoint (toggle isArchived)
- [ ] DELETE `/api/trips/[tripId]` endpoint (hard delete)
- [ ] Permission check (owner only for delete, admin for archive)
- [ ] Cascade delete all related data (events, expenses, etc.)
- [ ] Error handling

**Files to Create**:
- `src/app/api/trips/[tripId]/archive/route.ts`
- Modify `src/app/api/trips/[tripId]/route.ts` (add DELETE handler)

**Testing Requirements**:
- Test archive/unarchive
- Test delete
- Test cascade deletion
- Test permission checks

---

### Task 2.10: Trip Duplication API

**ID**: `task-2-10-trip-duplicate-api`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement trip duplication endpoint to clone trip with all events and structure.

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/duplicate` endpoint created
- [ ] Duplicate trip metadata
- [ ] Duplicate all events (with new IDs)
- [ ] Duplicate budget structure
- [ ] Do NOT duplicate: expenses, messages, ideas, polls, documents
- [ ] New trip title: "[Original Title] (Copy)"
- [ ] User becomes owner of duplicated trip
- [ ] Return new trip object

**Files to Create**:
- `src/app/api/trips/[tripId]/duplicate/route.ts`

**Testing Requirements**:
- Test trip duplication
- Verify events are copied
- Verify expenses are NOT copied
- Test permission checks

---

### Task 2.11: Trip Sharing API

**ID**: `task-2-11-trip-sharing-api`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement trip sharing with guest access token generation for view-only access.

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/share` endpoint
- [ ] Generate unique share token (UUID)
- [ ] Set token expiry (optional, default 30 days)
- [ ] GET `/api/trips/share/[token]` endpoint for public access
- [ ] Read-only access for shared link users
- [ ] Revoke share token endpoint
- [ ] List active share tokens

**Files to Create**:
- `src/app/api/trips/[tripId]/share/route.ts`
- `src/app/api/trips/share/[token]/route.ts`
- `src/app/(public)/trips/share/[token]/page.tsx` (public trip view)

**Testing Requirements**:
- Test share token generation
- Test public trip access
- Test token expiry
- Test token revocation

---

### Task 2.12: Trip Tags System

**ID**: `task-2-12-trip-tags`
**Complexity**: S
**Dependencies**: task-2-1-trip-list-api

**Description**:
Implement tag management for organizing trips.

**Acceptance Criteria**:
- [ ] GET `/api/tags` endpoint (list user's tags)
- [ ] POST `/api/tags` endpoint (create tag)
- [ ] DELETE `/api/tags/[tagId]` endpoint
- [ ] Tag autocomplete in trip forms
- [ ] Tag filtering in trip list
- [ ] Tag color customization

**Files to Create**:
- `src/app/api/tags/route.ts`
- `src/app/api/tags/[tagId]/route.ts`
- `src/components/trips/TagAutocomplete.tsx`
- `src/components/trips/TagBadge.tsx`

**Testing Requirements**:
- Test tag CRUD operations
- Test tag filtering
- Test autocomplete

---

### Task 2.13: Bulk Trip Operations

**ID**: `task-2-13-bulk-trip-ops`
**Complexity**: S
**Dependencies**: task-2-9-trip-delete-api

**Description**:
Implement bulk operations for trips: archive, delete, tag.

**Acceptance Criteria**:
- [ ] POST `/api/trips/bulk/archive` endpoint
- [ ] POST `/api/trips/bulk/delete` endpoint
- [ ] POST `/api/trips/bulk/tag` endpoint (add tags to multiple trips)
- [ ] Checkbox selection in trip list
- [ ] Bulk action toolbar
- [ ] Confirmation dialogs
- [ ] Success feedback

**Files to Create**:
- `src/app/api/trips/bulk/archive/route.ts`
- `src/app/api/trips/bulk/delete/route.ts`
- `src/app/api/trips/bulk/tag/route.ts`
- `src/components/trips/BulkActions.tsx`

**Testing Requirements**:
- Test bulk archive
- Test bulk delete
- Test bulk tag
- Test partial failures

---

## Phase 3: Itinerary & Events

**Goal**: Implement day-by-day itinerary builder with drag-and-drop, event management, calendar view, and map visualization

**Duration**: 2-3 weeks
**Tasks**: 11
**Dependencies**: Phase 2 complete

### Task 3.1: Event CRUD API

**ID**: `task-3-1-event-api`
**Complexity**: L
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement event management endpoints for all 6 event types (flight, hotel, activity, restaurant, transportation, destination).

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/events` endpoint
- [ ] GET `/api/trips/[tripId]/events` endpoint with filtering
- [ ] GET `/api/trips/[tripId]/events/[eventId]` endpoint
- [ ] PATCH `/api/trips/[tripId]/events/[eventId]` endpoint
- [ ] DELETE `/api/trips/[tripId]/events/[eventId]` endpoint
- [ ] Support all 6 event types with type-specific fields
- [ ] Location data storage (name, address, lat, lon)
- [ ] Cost tracking (amount, currency)
- [ ] Event ordering field for drag-and-drop
- [ ] Validation for each event type
- [ ] Permission checks (collaborator with edit access)

**Files to Create**:
- `src/app/api/trips/[tripId]/events/route.ts`
- `src/app/api/trips/[tripId]/events/[eventId]/route.ts`
- `src/lib/validations/event.ts`
- `src/types/event.ts`

**Testing Requirements**:
- Test CRUD for all event types
- Test event ordering
- Test permission checks
- Test location data validation

---

### Task 3.2: Event Reordering API

**ID**: `task-3-2-event-reorder-api`
**Complexity**: M
**Dependencies**: task-3-1-event-api

**Description**:
Implement event reordering endpoint for drag-and-drop support.

**Acceptance Criteria**:
- [ ] PATCH `/api/trips/[tripId]/events/reorder` endpoint
- [ ] Accept array of event IDs in new order
- [ ] Update `order` field for each event
- [ ] Validate all event IDs belong to trip
- [ ] Atomic transaction (all or nothing)
- [ ] Return updated events

**Files to Create**:
- `src/app/api/trips/[tripId]/events/reorder/route.ts`

**Testing Requirements**:
- Test reordering
- Test with invalid event IDs
- Test transaction rollback on error

---

### Task 3.3: Itinerary Builder UI - Day View

**ID**: `task-3-3-itinerary-day-view`
**Complexity**: XL
**Dependencies**: task-3-1-event-api, task-3-2-event-reorder-api

**Description**:
Create day-by-day itinerary builder with drag-and-drop using dnd-kit.

**Acceptance Criteria**:
- [ ] Itinerary tab in trip details page
- [ ] Day-by-day view grouped by date
- [ ] Unscheduled events section
- [ ] Drag-and-drop between days and within days
- [ ] Event cards showing: type icon, title, time, location, cost
- [ ] "Add Event" button for each day
- [ ] Event type selector (flight, hotel, activity, etc.)
- [ ] Smooth animations during drag
- [ ] Touch support for mobile
- [ ] Auto-save on reorder
- [ ] Loading states
- [ ] Empty state per day

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/itinerary/page.tsx`
- `src/components/itinerary/ItineraryBuilder.tsx`
- `src/components/itinerary/DayColumn.tsx`
- `src/components/itinerary/EventCard.tsx`
- `src/components/itinerary/DraggableEvent.tsx`
- `src/hooks/useEventReorder.ts`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test drag-and-drop functionality
- Test auto-save
- Test with 50+ events (performance)
- Accessibility audit (keyboard drag-and-drop)

---

### Task 3.4: Event Creation Forms

**ID**: `task-3-4-event-forms`
**Complexity**: XL
**Dependencies**: task-3-1-event-api

**Description**:
Create event creation forms for all 6 event types with type-specific fields.

**Acceptance Criteria**:
- [ ] Event creation dialog with type selector
- [ ] Dynamic form based on event type
- [ ] **Flight form**: airline, flight number, departure/arrival airports, times
- [ ] **Hotel form**: hotel name, check-in/out dates, confirmation number
- [ ] **Activity form**: activity name, start time, duration, booking URL
- [ ] **Restaurant form**: restaurant name, reservation time, cuisine type
- [ ] **Transportation form**: type (car/train/bus), departure/arrival times
- [ ] **Destination form**: place name, visit date
- [ ] Location autocomplete for all types (Nominatim)
- [ ] Cost input with currency selector
- [ ] Date and time pickers
- [ ] Notes field
- [ ] Form validation
- [ ] Success feedback

**Files to Create**:
- `src/components/events/CreateEventDialog.tsx`
- `src/components/events/FlightForm.tsx`
- `src/components/events/HotelForm.tsx`
- `src/components/events/ActivityForm.tsx`
- `src/components/events/RestaurantForm.tsx`
- `src/components/events/TransportationForm.tsx`
- `src/components/events/DestinationForm.tsx`
- `src/components/events/LocationAutocomplete.tsx`
- `src/components/ui/time-picker.tsx`

**Testing Requirements**:
- Visual validation for each form type
- Test form validation
- Test location autocomplete
- Accessibility audit

---

### Task 3.5: Event Edit & Delete

**ID**: `task-3-5-event-edit-delete`
**Complexity**: M
**Dependencies**: task-3-4-event-forms

**Description**:
Implement event editing and deletion with confirmation.

**Acceptance Criteria**:
- [ ] Edit event dialog (reuse creation forms with pre-fill)
- [ ] Delete event with confirmation dialog
- [ ] Success feedback
- [ ] Error handling
- [ ] Optimistic updates in UI
- [ ] Permission checks

**Files to Create**:
- `src/components/events/EditEventDialog.tsx`
- `src/components/events/DeleteEventDialog.tsx`

**Testing Requirements**:
- Test edit flow
- Test delete flow
- Test optimistic updates

---

### Task 3.6: Calendar View Integration

**ID**: `task-3-6-calendar-view`
**Complexity**: L
**Dependencies**: task-3-1-event-api

**Description**:
Integrate FullCalendar for monthly/weekly/daily calendar view of events.

**Acceptance Criteria**:
- [ ] Calendar tab in trip details page
- [ ] FullCalendar component with month/week/day views
- [ ] Events displayed on calendar
- [ ] Color coding by event type
- [ ] Click event to view details
- [ ] Drag event to reschedule (updates date)
- [ ] "Add Event" by clicking date
- [ ] Timezone support
- [ ] Responsive design

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/calendar/page.tsx`
- `src/components/calendar/TripCalendar.tsx`
- `src/components/calendar/EventTooltip.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test view switching
- Test event drag to reschedule
- Test timezone handling

---

### Task 3.7: Map View - Event Markers

**ID**: `task-3-7-map-markers`
**Complexity**: L
**Dependencies**: task-3-1-event-api

**Description**:
Implement Leaflet map view with markers for all events with locations.

**Acceptance Criteria**:
- [ ] Map tab in trip details page
- [ ] Leaflet map with OpenStreetMap tiles
- [ ] Markers for all events with lat/lon
- [ ] Custom marker icons by event type
- [ ] Marker clusters for dense areas
- [ ] Click marker to view event details
- [ ] Popup with event summary
- [ ] Auto-fit map bounds to show all markers
- [ ] Responsive design

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/map/page.tsx`
- `src/components/map/TripMap.tsx`
- `src/components/map/EventMarker.tsx`
- `src/components/map/EventPopup.tsx`
- `src/lib/map/icons.ts`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test with 100+ markers (performance)
- Test marker clustering
- Test popup interactions

---

### Task 3.8: Map View - Route Visualization

**ID**: `task-3-8-map-routes`
**Complexity**: M
**Dependencies**: task-3-7-map-markers

**Description**:
Add route visualization between events using Leaflet Routing Machine and OSRM.

**Acceptance Criteria**:
- [ ] GET `/api/trips/[tripId]/route` endpoint
- [ ] Call OSRM API to get route between event locations
- [ ] Return GeoJSON route data
- [ ] Display route polyline on map
- [ ] Show transportation mode icons
- [ ] Route distance and duration display
- [ ] Toggle route visibility
- [ ] Cache route data

**Files to Create**:
- `src/app/api/trips/[tripId]/route/route.ts`
- `src/lib/map/osrm.ts`
- `src/components/map/RouteLayer.tsx`

**Testing Requirements**:
- Test route generation
- Test with multiple waypoints
- Test OSRM API error handling

---

### Task 3.9: POI Search Integration

**ID**: `task-3-9-poi-search`
**Complexity**: M
**Dependencies**: task-3-7-map-markers

**Description**:
Integrate POI search using OSM Overpass API and Foursquare Places API.

**Acceptance Criteria**:
- [ ] GET `/api/search/poi` endpoint
- [ ] Accept query and location parameters
- [ ] Call OSM Overpass API (primary)
- [ ] Fallback to Foursquare API if needed
- [ ] Return POI results (name, category, location, rating)
- [ ] POI search UI in map view
- [ ] Add POI as event to itinerary
- [ ] Filter by category (restaurants, hotels, attractions, etc.)

**Files to Create**:
- `src/app/api/search/poi/route.ts`
- `src/lib/search/overpass.ts`
- `src/lib/search/foursquare.ts`
- `src/components/search/POISearch.tsx`
- `src/components/search/POIResult.tsx`

**Testing Requirements**:
- Test POI search
- Test Overpass → Foursquare fallback
- Test add to itinerary

---

### Task 3.10: Destination Guides

**ID**: `task-3-10-destination-guides`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement destination guides with curated content about cities/destinations.

**Acceptance Criteria**:
- [ ] GET `/api/destinations/[slug]` endpoint
- [ ] Destination guide page (`/destinations/[slug]`)
- [ ] Content: overview, top attractions, best time to visit, budget tips
- [ ] Integration with Wikipedia API for content
- [ ] Link from trip destination to guide
- [ ] Save destination to trip

**Files to Create**:
- `src/app/api/destinations/[slug]/route.ts`
- `src/app/(public)/destinations/[slug]/page.tsx`
- `src/lib/destinations/wikipedia.ts`
- `src/components/destinations/DestinationGuide.tsx`

**Testing Requirements**:
- Test destination guide rendering
- Test Wikipedia API integration
- Test save to trip

---

### Task 3.11: Weather Forecast Integration

**ID**: `task-3-11-weather`
**Complexity**: S
**Dependencies**: task-2-5-trip-details-api

**Description**:
Add weather forecast for trip destination using OpenWeatherMap API.

**Acceptance Criteria**:
- [ ] GET `/api/trips/[tripId]/weather` endpoint
- [ ] Call OpenWeatherMap API with trip location and dates
- [ ] Return daily forecast for trip duration
- [ ] Weather widget in trip overview
- [ ] Show temperature, conditions, precipitation
- [ ] Icon display

**Files to Create**:
- `src/app/api/trips/[tripId]/weather/route.ts`
- `src/lib/weather/openweather.ts`
- `src/components/trips/WeatherWidget.tsx`

**Testing Requirements**:
- Test weather data fetching
- Test with past dates (no forecast)
- Test API error handling

---

## Phase 4: Collaboration & Communication

**Goal**: Implement real-time collaboration, messaging, ideas/polls, activity feed, and permission management

**Duration**: 3-4 weeks
**Tasks**: 16
**Dependencies**: Phase 3 complete

### Task 4.1: Collaborator Management API

**ID**: `task-4-1-collaborator-api`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement collaborator invitation, management, and permission system.

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/collaborators` endpoint (invite)
- [ ] GET `/api/trips/[tripId]/collaborators` endpoint (list)
- [ ] PATCH `/api/trips/[tripId]/collaborators/[id]` endpoint (change role)
- [ ] DELETE `/api/trips/[tripId]/collaborators/[id]` endpoint (remove)
- [ ] Three roles: VIEWER, EDITOR, ADMIN
- [ ] Email invitation with accept/decline
- [ ] Pending invitation tracking
- [ ] Permission checks for all operations
- [ ] Only owner can change admin status

**Files to Create**:
- `src/app/api/trips/[tripId]/collaborators/route.ts`
- `src/app/api/trips/[tripId]/collaborators/[id]/route.ts`
- `src/lib/email/templates/invitation.tsx`
- `src/types/collaborator.ts`

**Testing Requirements**:
- Test invite flow
- Test role changes
- Test remove collaborator
- Test permission checks

---

### Task 4.2: Collaborator Management UI

**ID**: `task-4-2-collaborator-ui`
**Complexity**: M
**Dependencies**: task-4-1-collaborator-api

**Description**:
Create collaborator management UI with invite dialog and role management.

**Acceptance Criteria**:
- [ ] Collaborators tab in trip details
- [ ] List of current collaborators with avatars and roles
- [ ] "Invite Collaborator" button
- [ ] Invite dialog with email input and role selector
- [ ] Change role dropdown (owner/admin only)
- [ ] Remove collaborator button with confirmation
- [ ] Pending invitations section
- [ ] Resend invitation button
- [ ] Success/error feedback

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/collaborators/page.tsx`
- `src/components/collaborators/CollaboratorManagement.tsx`
- `src/components/collaborators/InviteDialog.tsx`
- `src/components/collaborators/CollaboratorCard.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test invite flow
- Test role changes
- Accessibility audit

---

### Task 4.3: Real-time Infrastructure Setup

**ID**: `task-4-3-realtime-setup`
**Complexity**: L
**Dependencies**: task-1-2-database-setup

**Description**:
Set up Socket.io or Pusher for real-time features (messaging, activity feed).

**Acceptance Criteria**:
- [ ] Choose Socket.io or Pusher based on complexity
- [ ] WebSocket server setup (if Socket.io)
- [ ] Pusher configuration (if Pusher)
- [ ] Channel/room structure for trips
- [ ] Authentication for WebSocket connections
- [ ] Connection utilities
- [ ] React hooks for real-time subscriptions
- [ ] Reconnection handling

**Files to Create**:
- `src/lib/realtime/client.ts`
- `src/lib/realtime/server.ts` (if Socket.io)
- `src/hooks/useRealtime.ts`
- `src/types/realtime.ts`

**Testing Requirements**:
- Test connection establishment
- Test reconnection
- Test authentication

---

### Task 4.4: Messaging API

**ID**: `task-4-4-messaging-api`
**Complexity**: M
**Dependencies**: task-4-3-realtime-setup

**Description**:
Implement real-time messaging API for trip discussions.

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/messages` endpoint
- [ ] GET `/api/trips/[tripId]/messages` endpoint with pagination
- [ ] PATCH `/api/trips/[tripId]/messages/[id]` endpoint (edit)
- [ ] DELETE `/api/trips/[tripId]/messages/[id]` endpoint
- [ ] Real-time broadcast via WebSocket
- [ ] Support for message threading (replyToId)
- [ ] Mark as read functionality
- [ ] Unread count endpoint
- [ ] Permission checks

**Files to Create**:
- `src/app/api/trips/[tripId]/messages/route.ts`
- `src/app/api/trips/[tripId]/messages/[id]/route.ts`
- `src/lib/realtime/events/message.ts`

**Testing Requirements**:
- Test message CRUD
- Test real-time broadcast
- Test threading
- Test permission checks

---

### Task 4.5: Messaging UI

**ID**: `task-4-5-messaging-ui`
**Complexity**: L
**Dependencies**: task-4-4-messaging-api

**Description**:
Create real-time messaging interface for trip discussions.

**Acceptance Criteria**:
- [ ] Messages tab in trip details
- [ ] Message list with infinite scroll
- [ ] Message input with send button
- [ ] Message bubbles with sender avatar and timestamp
- [ ] Edit/delete for own messages
- [ ] Threading support (reply to message)
- [ ] Unread indicator
- [ ] Typing indicator
- [ ] Real-time message updates
- [ ] Emoji picker (optional)
- [ ] Link preview (optional)

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/messages/page.tsx`
- `src/components/messages/MessageList.tsx`
- `src/components/messages/MessageBubble.tsx`
- `src/components/messages/MessageInput.tsx`
- `src/components/messages/TypingIndicator.tsx`
- `src/hooks/useMessages.ts`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test real-time updates
- Test threading
- Test infinite scroll
- Accessibility audit

---

### Task 4.6: Ideas/Suggestions API

**ID**: `task-4-6-ideas-api`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement ideas/suggestions system with voting for group decision-making.

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/ideas` endpoint
- [ ] GET `/api/trips/[tripId]/ideas` endpoint
- [ ] PATCH `/api/trips/[tripId]/ideas/[id]` endpoint (status change)
- [ ] DELETE `/api/trips/[tripId]/ideas/[id]` endpoint
- [ ] POST `/api/trips/[tripId]/ideas/[id]/vote` endpoint (upvote/downvote)
- [ ] Idea statuses: PENDING, APPROVED, REJECTED
- [ ] Vote count tracking
- [ ] Convert idea to event functionality

**Files to Create**:
- `src/app/api/trips/[tripId]/ideas/route.ts`
- `src/app/api/trips/[tripId]/ideas/[id]/route.ts`
- `src/app/api/trips/[tripId]/ideas/[id]/vote/route.ts`

**Testing Requirements**:
- Test idea CRUD
- Test voting
- Test status changes

---

### Task 4.7: Ideas/Suggestions UI

**ID**: `task-4-7-ideas-ui`
**Complexity**: M
**Dependencies**: task-4-6-ideas-api

**Description**:
Create ideas/suggestions interface with voting.

**Acceptance Criteria**:
- [ ] Ideas tab in trip details
- [ ] List of ideas with vote counts
- [ ] "Add Idea" button
- [ ] Idea creation dialog
- [ ] Upvote/downvote buttons
- [ ] Status badges (pending/approved/rejected)
- [ ] Convert to event button (for admins)
- [ ] Filter by status
- [ ] Sort by votes

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/ideas/page.tsx`
- `src/components/ideas/IdeaList.tsx`
- `src/components/ideas/IdeaCard.tsx`
- `src/components/ideas/CreateIdeaDialog.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test voting
- Test convert to event
- Accessibility audit

---

### Task 4.8: Polls API

**ID**: `task-4-8-polls-api`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement polling system for group decision-making.

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/polls` endpoint
- [ ] GET `/api/trips/[tripId]/polls` endpoint
- [ ] GET `/api/trips/[tripId]/polls/[id]` endpoint
- [ ] POST `/api/trips/[tripId]/polls/[id]/vote` endpoint
- [ ] DELETE `/api/trips/[tripId]/polls/[id]` endpoint (owner only)
- [ ] Poll with multiple options
- [ ] Single or multiple choice
- [ ] Vote tracking by user
- [ ] Results calculation
- [ ] Close poll functionality

**Files to Create**:
- `src/app/api/trips/[tripId]/polls/route.ts`
- `src/app/api/trips/[tripId]/polls/[id]/route.ts`
- `src/app/api/trips/[tripId]/polls/[id]/vote/route.ts`

**Testing Requirements**:
- Test poll creation
- Test voting
- Test results calculation
- Test close poll

---

### Task 4.9: Polls UI

**ID**: `task-4-9-polls-ui`
**Complexity**: M
**Dependencies**: task-4-8-polls-api

**Description**:
Create polling interface for group decisions.

**Acceptance Criteria**:
- [ ] Polls section in Messages or separate tab
- [ ] "Create Poll" button
- [ ] Poll creation dialog with options
- [ ] Active polls list
- [ ] Vote interface (radio or checkbox)
- [ ] Results visualization (bar chart)
- [ ] Close poll button (owner only)
- [ ] Closed polls archive

**Files to Create**:
- `src/components/polls/PollList.tsx`
- `src/components/polls/PollCard.tsx`
- `src/components/polls/CreatePollDialog.tsx`
- `src/components/polls/PollResults.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test poll creation
- Test voting
- Test results display
- Accessibility audit

---

### Task 4.10: Activity Feed API

**ID**: `task-4-10-activity-api`
**Complexity**: M
**Dependencies**: task-4-3-realtime-setup

**Description**:
Implement activity feed tracking all actions in trip (events, messages, ideas, etc.).

**Acceptance Criteria**:
- [ ] GET `/api/trips/[tripId]/activity` endpoint with pagination
- [ ] Automatic activity creation on:
  - Event create/edit/delete
  - Collaborator add/remove
  - Message sent
  - Idea created/voted
  - Poll created/voted
  - Expense added
- [ ] Activity types enum
- [ ] Real-time broadcast of new activities
- [ ] Filter by activity type
- [ ] Actor (user) information

**Files to Create**:
- `src/app/api/trips/[tripId]/activity/route.ts`
- `src/lib/activity/logger.ts`
- `src/types/activity.ts`

**Testing Requirements**:
- Test activity creation
- Test real-time updates
- Test pagination
- Test filtering

---

### Task 4.11: Activity Feed UI

**ID**: `task-4-11-activity-ui`
**Complexity**: M
**Dependencies**: task-4-10-activity-api

**Description**:
Create activity feed timeline showing all trip actions.

**Acceptance Criteria**:
- [ ] Activity tab in trip details
- [ ] Timeline view with icons and descriptions
- [ ] Grouped by date
- [ ] Actor avatars
- [ ] Filter by activity type
- [ ] Infinite scroll
- [ ] Real-time updates
- [ ] "Load more" button

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/activity/page.tsx`
- `src/components/activity/ActivityFeed.tsx`
- `src/components/activity/ActivityItem.tsx`
- `src/hooks/useActivity.ts`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test real-time updates
- Test filtering
- Test infinite scroll
- Accessibility audit

---

### Task 4.12: Notification System API

**ID**: `task-4-12-notifications-api`
**Complexity**: M
**Dependencies**: task-4-10-activity-api

**Description**:
Implement in-app notification system for important events.

**Acceptance Criteria**:
- [ ] GET `/api/notifications` endpoint
- [ ] PATCH `/api/notifications/[id]/read` endpoint
- [ ] PATCH `/api/notifications/mark-all-read` endpoint
- [ ] Notification creation for:
  - Collaborator invitation
  - New message (if @mentioned)
  - Idea status change
  - Poll created
- [ ] Real-time notification delivery
- [ ] Unread count endpoint

**Files to Create**:
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/read/route.ts`
- `src/lib/notifications/create.ts`

**Testing Requirements**:
- Test notification creation
- Test mark as read
- Test unread count

---

### Task 4.13: Notification UI

**ID**: `task-4-13-notifications-ui`
**Complexity**: M
**Dependencies**: task-4-12-notifications-api

**Description**:
Create notification dropdown in header with unread indicator.

**Acceptance Criteria**:
- [ ] Notification bell icon in header
- [ ] Unread count badge
- [ ] Dropdown with notification list
- [ ] Mark as read on click
- [ ] "Mark all as read" button
- [ ] Link to notification source
- [ ] Real-time updates
- [ ] Empty state

**Files to Create**:
- `src/components/notifications/NotificationDropdown.tsx`
- `src/components/notifications/NotificationItem.tsx`
- `src/hooks/useNotifications.ts`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test real-time updates
- Test mark as read
- Accessibility audit

---

### Task 4.14: Email Notification Settings

**ID**: `task-4-14-email-notifications`
**Complexity**: M
**Dependencies**: task-4-12-notifications-api

**Description**:
Add email notification preferences and email sending.

**Acceptance Criteria**:
- [ ] User settings for email notifications
- [ ] Preferences: daily digest, instant, or off
- [ ] Email templates for notifications
- [ ] Send email on notification creation (based on user preference)
- [ ] Unsubscribe link in emails
- [ ] Settings page for notification preferences

**Files to Create**:
- `src/app/api/user/notification-settings/route.ts`
- `src/app/(dashboard)/settings/notifications/page.tsx`
- `src/lib/email/templates/notification-digest.tsx`
- `src/lib/notifications/email.ts`

**Testing Requirements**:
- Test email sending (test mode)
- Test preference updates
- Test unsubscribe

---

### Task 4.15: Collaborator Invitation Acceptance

**ID**: `task-4-15-invitation-accept`
**Complexity**: M
**Dependencies**: task-4-1-collaborator-api

**Description**:
Implement invitation acceptance/decline flow for new collaborators.

**Acceptance Criteria**:
- [ ] Invitation email with accept/decline links
- [ ] GET `/api/invitations/[token]` endpoint (view invitation)
- [ ] POST `/api/invitations/[token]/accept` endpoint
- [ ] POST `/api/invitations/[token]/decline` endpoint
- [ ] Invitation acceptance page
- [ ] Update collaborator status to ACTIVE on accept
- [ ] Remove invitation on decline
- [ ] Redirect to trip after accept

**Files to Create**:
- `src/app/api/invitations/[token]/route.ts`
- `src/app/api/invitations/[token]/accept/route.ts`
- `src/app/api/invitations/[token]/decline/route.ts`
- `src/app/(public)/invitations/[token]/page.tsx`

**Testing Requirements**:
- Test accept flow
- Test decline flow
- Test expired invitation
- Test already accepted

---

### Task 4.16: Permission Checks Across App

**ID**: `task-4-16-permission-checks`
**Complexity**: M
**Dependencies**: task-4-1-collaborator-api

**Description**:
Add comprehensive permission checks throughout the application.

**Acceptance Criteria**:
- [ ] Permission utility functions (canEdit, canDelete, canAdmin)
- [ ] Middleware for API routes
- [ ] UI elements hidden/disabled based on permissions
- [ ] All edit operations check EDITOR or ADMIN role
- [ ] All delete operations check ADMIN role (or owner)
- [ ] All collaborator management checks ADMIN role
- [ ] Error messages for insufficient permissions

**Files to Create**:
- `src/lib/permissions/check.ts`
- `src/hooks/usePermissions.ts`
- `src/middleware/permissions.ts`

**Testing Requirements**:
- Test permission checks across all features
- Test UI element hiding
- Test API permission errors

---

## Phase 5: Financial & Professional Features

**Goal**: Implement budget tracking, expense management, expense splitting, CRM, proposals, invoices, and payments

**Duration**: 3-4 weeks
**Tasks**: 15
**Dependencies**: Phase 4 complete

### Task 5.1: Budget Management API

**ID**: `task-5-1-budget-api`
**Complexity**: M
**Dependencies**: task-2-5-trip-details-api

**Description**:
Implement budget management with category breakdown and expense tracking.

**Acceptance Criteria**:
- [ ] Budget created automatically with trip
- [ ] PATCH `/api/trips/[tripId]/budget` endpoint
- [ ] Budget categories (accommodation, food, activities, transport, other)
- [ ] Per-category budget amounts
- [ ] Total budget calculation
- [ ] Spent vs budget comparison
- [ ] Multi-currency support

**Files to Create**:
- `src/app/api/trips/[tripId]/budget/route.ts`
- `src/types/budget.ts`

**Testing Requirements**:
- Test budget update
- Test category management
- Test calculations

---

### Task 5.2: Budget UI

**ID**: `task-5-2-budget-ui`
**Complexity**: M
**Dependencies**: task-5-1-budget-api

**Description**:
Create budget overview and management interface.

**Acceptance Criteria**:
- [ ] Budget tab in trip details
- [ ] Total budget display
- [ ] Category breakdown with progress bars
- [ ] Edit budget button
- [ ] Budget edit dialog
- [ ] Spent vs budget visualization
- [ ] Over-budget warnings
- [ ] Multi-currency display

**Files to Create**:
- `src/app/(dashboard)/trips/[tripId]/budget/page.tsx`
- `src/components/budget/BudgetOverview.tsx`
- `src/components/budget/CategoryBreakdown.tsx`
- `src/components/budget/EditBudgetDialog.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test budget editing
- Test visualizations
- Accessibility audit

---

### Task 5.3: Expense CRUD API

**ID**: `task-5-3-expense-api`
**Complexity**: M
**Dependencies**: task-5-1-budget-api

**Description**:
Implement expense tracking with categorization and event linkage.

**Acceptance Criteria**:
- [ ] POST `/api/trips/[tripId]/expenses` endpoint
- [ ] GET `/api/trips/[tripId]/expenses` endpoint
- [ ] GET `/api/trips/[tripId]/expenses/[id]` endpoint
- [ ] PATCH `/api/trips/[tripId]/expenses/[id]` endpoint
- [ ] DELETE `/api/trips/[tripId]/expenses/[id]` endpoint
- [ ] Expense categories aligned with budget
- [ ] Link expense to event (optional)
- [ ] Multi-currency support
- [ ] Receipt upload support

**Files to Create**:
- `src/app/api/trips/[tripId]/expenses/route.ts`
- `src/app/api/trips/[tripId]/expenses/[id]/route.ts`
- `src/types/expense.ts`

**Testing Requirements**:
- Test expense CRUD
- Test category tracking
- Test event linkage

---

### Task 5.4: Expense Tracking UI

**ID**: `task-5-4-expense-ui`
**Complexity**: M
**Dependencies**: task-5-3-expense-api

**Description**:
Create expense list and creation interface.

**Acceptance Criteria**:
- [ ] Expenses section in Budget tab
- [ ] Expense list with filters (category, date)
- [ ] "Add Expense" button
- [ ] Expense creation dialog
- [ ] Receipt upload
- [ ] Link to event
- [ ] Edit/delete expense
- [ ] Total expenses calculation

**Files to Create**:
- `src/components/expenses/ExpenseList.tsx`
- `src/components/expenses/ExpenseCard.tsx`
- `src/components/expenses/CreateExpenseDialog.tsx`
- `src/components/expenses/ReceiptUpload.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test expense creation
- Test receipt upload
- Accessibility audit

---

### Task 5.5: Expense Splitting API

**ID**: `task-5-5-expense-split-api`
**Complexity**: L
**Dependencies**: task-5-3-expense-api

**Description**:
Implement expense splitting for group trips with settlement calculations.

**Acceptance Criteria**:
- [ ] Expense split tracking (who paid, who owes)
- [ ] Equal split option
- [ ] Custom split option (by percentage or amount)
- [ ] Split by specific collaborators
- [ ] Settlement calculation (who owes who)
- [ ] GET `/api/trips/[tripId]/expenses/settlements` endpoint
- [ ] Mark settlement as paid

**Files to Create**:
- Modify `src/app/api/trips/[tripId]/expenses/route.ts` (add split logic)
- `src/app/api/trips/[tripId]/expenses/settlements/route.ts`
- `src/lib/expenses/calculations.ts`

**Testing Requirements**:
- Test equal split
- Test custom split
- Test settlement calculations
- Test edge cases (unequal amounts)

---

### Task 5.6: Expense Splitting UI

**ID**: `task-5-6-expense-split-ui`
**Complexity**: M
**Dependencies**: task-5-5-expense-split-api

**Description**:
Create expense splitting interface with settlement view.

**Acceptance Criteria**:
- [ ] Split expense dialog
- [ ] Equal split button
- [ ] Custom split interface
- [ ] Collaborator selection
- [ ] Per-person amount display
- [ ] Settlement summary view
- [ ] Who owes who visualization
- [ ] "Mark as settled" button

**Files to Create**:
- `src/components/expenses/SplitExpenseDialog.tsx`
- `src/components/expenses/SettlementSummary.tsx`
- `src/components/expenses/SettlementCard.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test split calculations
- Test settlement display
- Accessibility audit

---

### Task 5.7: CRM Client Management API

**ID**: `task-5-7-crm-api`
**Complexity**: M
**Dependencies**: task-1-2-database-setup

**Description**:
Implement CRM system for travel agents to manage clients.

**Acceptance Criteria**:
- [ ] POST `/api/crm/clients` endpoint
- [ ] GET `/api/crm/clients` endpoint
- [ ] GET `/api/crm/clients/[id]` endpoint
- [ ] PATCH `/api/crm/clients/[id]` endpoint
- [ ] DELETE `/api/crm/clients/[id]` endpoint
- [ ] Client fields: name, email, phone, company, notes, tags
- [ ] Link client to trips
- [ ] Search and filter clients

**Files to Create**:
- `src/app/api/crm/clients/route.ts`
- `src/app/api/crm/clients/[id]/route.ts`
- `src/types/crm.ts`

**Testing Requirements**:
- Test client CRUD
- Test search and filter
- Test trip linkage

---

### Task 5.8: CRM Client Management UI

**ID**: `task-5-8-crm-ui`
**Complexity**: M
**Dependencies**: task-5-7-crm-api

**Description**:
Create CRM interface for managing clients.

**Acceptance Criteria**:
- [ ] Clients page at `/crm/clients`
- [ ] Client list with search and filters
- [ ] "Add Client" button
- [ ] Client creation dialog
- [ ] Client details page
- [ ] Edit/delete client
- [ ] Link client to trip
- [ ] Client tags

**Files to Create**:
- `src/app/(dashboard)/crm/clients/page.tsx`
- `src/app/(dashboard)/crm/clients/[id]/page.tsx`
- `src/components/crm/ClientList.tsx`
- `src/components/crm/ClientCard.tsx`
- `src/components/crm/CreateClientDialog.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test client management
- Accessibility audit

---

### Task 5.9: Proposal Creation API

**ID**: `task-5-9-proposal-api`
**Complexity**: M
**Dependencies**: task-5-7-crm-api

**Description**:
Implement proposal generation for professional trip planning.

**Acceptance Criteria**:
- [ ] POST `/api/proposals` endpoint
- [ ] GET `/api/proposals` endpoint
- [ ] GET `/api/proposals/[id]` endpoint
- [ ] PATCH `/api/proposals/[id]` endpoint
- [ ] DELETE `/api/proposals/[id]` endpoint
- [ ] Proposal fields: client, trip, line items, total, notes
- [ ] Proposal statuses: DRAFT, SENT, ACCEPTED, REJECTED
- [ ] PDF generation

**Files to Create**:
- `src/app/api/proposals/route.ts`
- `src/app/api/proposals/[id]/route.ts`
- `src/types/proposal.ts`

**Testing Requirements**:
- Test proposal CRUD
- Test status transitions
- Test PDF generation

---

### Task 5.10: Proposal UI

**ID**: `task-5-10-proposal-ui`
**Complexity**: M
**Dependencies**: task-5-9-proposal-api

**Description**:
Create proposal creation and viewing interface.

**Acceptance Criteria**:
- [ ] Proposals page at `/crm/proposals`
- [ ] Proposal list
- [ ] "Create Proposal" button
- [ ] Proposal editor with line items
- [ ] Client selector
- [ ] Trip selector
- [ ] Send proposal button (email)
- [ ] Proposal preview
- [ ] PDF download

**Files to Create**:
- `src/app/(dashboard)/crm/proposals/page.tsx`
- `src/app/(dashboard)/crm/proposals/[id]/page.tsx`
- `src/components/proposals/ProposalList.tsx`
- `src/components/proposals/ProposalEditor.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test proposal creation
- Test PDF generation
- Accessibility audit

---

### Task 5.11: Invoice Creation API

**ID**: `task-5-11-invoice-api`
**Complexity**: M
**Dependencies**: task-5-7-crm-api

**Description**:
Implement invoice generation and tracking.

**Acceptance Criteria**:
- [ ] POST `/api/invoices` endpoint
- [ ] GET `/api/invoices` endpoint
- [ ] GET `/api/invoices/[id]` endpoint
- [ ] PATCH `/api/invoices/[id]` endpoint
- [ ] DELETE `/api/invoices/[id]` endpoint
- [ ] Invoice fields: client, line items, total, dueDate, notes
- [ ] Invoice statuses: DRAFT, SENT, PAID, OVERDUE
- [ ] Invoice number generation
- [ ] PDF generation

**Files to Create**:
- `src/app/api/invoices/route.ts`
- `src/app/api/invoices/[id]/route.ts`
- `src/types/invoice.ts`

**Testing Requirements**:
- Test invoice CRUD
- Test invoice number generation
- Test PDF generation

---

### Task 5.12: Invoice UI

**ID**: `task-5-12-invoice-ui`
**Complexity**: M
**Dependencies**: task-5-11-invoice-api

**Description**:
Create invoice creation and management interface.

**Acceptance Criteria**:
- [ ] Invoices page at `/crm/invoices`
- [ ] Invoice list with filters
- [ ] "Create Invoice" button
- [ ] Invoice editor
- [ ] Send invoice button (email)
- [ ] Invoice preview
- [ ] PDF download
- [ ] Mark as paid button

**Files to Create**:
- `src/app/(dashboard)/crm/invoices/page.tsx`
- `src/app/(dashboard)/crm/invoices/[id]/page.tsx`
- `src/components/invoices/InvoiceList.tsx`
- `src/components/invoices/InvoiceEditor.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test invoice creation
- Test PDF generation
- Accessibility audit

---

### Task 5.13: Stripe Payment Integration

**ID**: `task-5-13-stripe-integration`
**Complexity**: L
**Dependencies**: task-5-11-invoice-api

**Description**:
Integrate Stripe for invoice payments.

**Acceptance Criteria**:
- [ ] Stripe account setup
- [ ] POST `/api/invoices/[id]/pay` endpoint
- [ ] Create Stripe Checkout session
- [ ] Payment success webhook
- [ ] Update invoice status to PAID
- [ ] Record payment in database
- [ ] Send payment confirmation email

**Files to Create**:
- `src/app/api/invoices/[id]/pay/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/stripe/client.ts`
- `src/lib/email/templates/payment-confirmation.tsx`

**Testing Requirements**:
- Test Stripe Checkout flow (test mode)
- Test webhook handling
- Test payment confirmation

---

### Task 5.14: Landing Page Builder API

**ID**: `task-5-14-landing-page-api`
**Complexity**: M
**Dependencies**: task-1-2-database-setup

**Description**:
Implement landing page builder for travel agents.

**Acceptance Criteria**:
- [ ] POST `/api/landing-pages` endpoint
- [ ] GET `/api/landing-pages` endpoint
- [ ] GET `/api/landing-pages/[slug]` endpoint
- [ ] PATCH `/api/landing-pages/[slug]` endpoint
- [ ] DELETE `/api/landing-pages/[slug]` endpoint
- [ ] Page fields: slug, title, content (JSON), isPublished
- [ ] Lead capture form integration

**Files to Create**:
- `src/app/api/landing-pages/route.ts`
- `src/app/api/landing-pages/[slug]/route.ts`
- `src/types/landing-page.ts`

**Testing Requirements**:
- Test landing page CRUD
- Test slug uniqueness

---

### Task 5.15: Landing Page Builder UI

**ID**: `task-5-15-landing-page-ui`
**Complexity**: L
**Dependencies**: task-5-14-landing-page-api

**Description**:
Create landing page builder and public landing pages.

**Acceptance Criteria**:
- [ ] Landing pages page at `/crm/landing-pages`
- [ ] "Create Landing Page" button
- [ ] Page editor (rich text or blocks)
- [ ] Publish/unpublish toggle
- [ ] Public landing page at `/p/[slug]`
- [ ] Lead capture form
- [ ] Lead storage in database

**Files to Create**:
- `src/app/(dashboard)/crm/landing-pages/page.tsx`
- `src/app/(dashboard)/crm/landing-pages/[slug]/page.tsx`
- `src/app/(public)/p/[slug]/page.tsx`
- `src/components/landing-pages/PageEditor.tsx`
- `src/components/landing-pages/LeadCaptureForm.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test page editor
- Test lead capture
- Accessibility audit

---

## Phase 6: Export, Polish & Deployment

**Goal**: Implement PDF export, calendar sync, error pages, loading states, testing, documentation, and deployment

**Duration**: 2-3 weeks
**Tasks**: 11
**Dependencies**: Phase 5 complete

### Task 6.1: PDF Export API

**ID**: `task-6-1-pdf-export-api`
**Complexity**: L
**Dependencies**: task-3-1-event-api

**Description**:
Implement PDF export for trips using @react-pdf/renderer with mobile-friendly layout.

**Acceptance Criteria**:
- [ ] GET `/api/trips/[tripId]/export/pdf` endpoint
- [ ] Generate PDF with:
  - Trip overview
  - Day-by-day itinerary
  - Event details with times and locations
  - Map with markers
  - Budget summary
  - Collaborator list
- [ ] Mobile-friendly layout
- [ ] Customizable options (include/exclude sections)
- [ ] Download or email PDF

**Files to Create**:
- `src/app/api/trips/[tripId]/export/pdf/route.ts`
- `src/lib/pdf/trip-pdf.tsx` (@react-pdf/renderer document)
- `src/lib/pdf/components/` (PDF components)

**Testing Requirements**:
- Test PDF generation
- Verify layout on mobile
- Test with large trips (50+ events)
- Test email delivery

---

### Task 6.2: PDF Export UI

**ID**: `task-6-2-pdf-export-ui`
**Complexity**: S
**Dependencies**: task-6-1-pdf-export-api

**Description**:
Create PDF export dialog with customization options.

**Acceptance Criteria**:
- [ ] "Export PDF" button in trip header
- [ ] Export dialog with options
- [ ] Include/exclude sections (map, budget, etc.)
- [ ] Download button
- [ ] Email button
- [ ] Loading state during generation
- [ ] Error handling

**Files to Create**:
- `src/components/trips/ExportPDFDialog.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test export options
- Test download and email

---

### Task 6.3: Google Calendar Sync

**ID**: `task-6-3-calendar-sync`
**Complexity**: L
**Dependencies**: task-3-1-event-api

**Description**:
Implement Google Calendar sync to export trip events.

**Acceptance Criteria**:
- [ ] Google OAuth integration
- [ ] POST `/api/integrations/google-calendar/sync` endpoint
- [ ] Create Google Calendar events for all trip events
- [ ] Include location and notes
- [ ] Two-way sync (optional - read-only for MVP)
- [ ] Disconnect integration

**Files to Create**:
- `src/app/api/integrations/google-calendar/auth/route.ts`
- `src/app/api/integrations/google-calendar/sync/route.ts`
- `src/lib/integrations/google-calendar.ts`

**Testing Requirements**:
- Test OAuth flow
- Test event creation
- Test sync with 50+ events

---

### Task 6.4: Calendar Sync UI

**ID**: `task-6-4-calendar-sync-ui`
**Complexity**: S
**Dependencies**: task-6-3-calendar-sync

**Description**:
Create calendar integration settings and sync interface.

**Acceptance Criteria**:
- [ ] "Sync to Calendar" button in trip details
- [ ] Google Calendar OAuth flow
- [ ] Sync confirmation dialog
- [ ] Success feedback
- [ ] Integration settings page
- [ ] Disconnect button

**Files to Create**:
- `src/components/integrations/CalendarSyncButton.tsx`
- `src/app/(dashboard)/settings/integrations/page.tsx`

**Testing Requirements**:
- Test OAuth flow
- Test sync confirmation
- Accessibility audit

---

### Task 6.5: Error Pages

**ID**: `task-6-5-error-pages`
**Complexity**: S
**Dependencies**: task-1-12-dashboard-layout

**Description**:
Create error pages for 404, 500, and 403 errors.

**Acceptance Criteria**:
- [ ] 404 page (not found)
- [ ] 500 page (server error)
- [ ] 403 page (forbidden)
- [ ] Consistent design with app
- [ ] Helpful error messages
- [ ] Navigation back to home/dashboard

**Files to Create**:
- `src/app/not-found.tsx`
- `src/app/error.tsx`
- `src/app/(dashboard)/unauthorized/page.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test error page rendering
- Accessibility audit

---

### Task 6.6: Loading States & Skeletons

**ID**: `task-6-6-loading-states`
**Complexity**: M
**Dependencies**: None

**Description**:
Add loading skeletons and states throughout the application.

**Acceptance Criteria**:
- [ ] Loading skeletons for:
  - Trip list
  - Trip details
  - Event list
  - Message list
  - Expense list
- [ ] Loading spinner component
- [ ] Suspense boundaries in App Router
- [ ] Smooth transitions

**Files to Create**:
- `src/components/ui/skeleton.tsx`
- `src/components/ui/spinner.tsx`
- `src/app/(dashboard)/trips/loading.tsx`
- `src/app/(dashboard)/trips/[tripId]/loading.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Test with slow 3G network throttling
- Accessibility audit

---

### Task 6.7: Empty States

**ID**: `task-6-7-empty-states`
**Complexity**: S
**Dependencies**: None

**Description**:
Add empty state components with helpful CTAs throughout the app.

**Acceptance Criteria**:
- [ ] Empty state for:
  - No trips yet
  - No events in trip
  - No messages
  - No expenses
  - No collaborators
- [ ] Helpful illustrations or icons
- [ ] Call-to-action buttons
- [ ] Consistent design

**Files to Create**:
- `src/components/ui/empty-state.tsx`
- `src/components/trips/EmptyTrips.tsx`
- `src/components/events/EmptyEvents.tsx`

**Testing Requirements**:
- Visual validation with Chrome DevTools
- Accessibility audit

---

### Task 6.8: Comprehensive Testing Suite

**ID**: `task-6-8-testing`
**Complexity**: XL
**Dependencies**: All implementation tasks

**Description**:
Write comprehensive test suite with Jest, React Testing Library, and Playwright.

**Acceptance Criteria**:
- [ ] Unit tests for utilities and hooks (>80% coverage)
- [ ] Component tests for all UI components
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows:
  - Registration and login
  - Trip creation
  - Event management
  - Collaboration
  - Expense tracking
- [ ] Test coverage report
- [ ] CI integration

**Files to Create**:
- `src/__tests__/` (unit tests)
- `src/components/__tests__/` (component tests)
- `e2e/` (Playwright tests)
- `jest.config.js`
- `playwright.config.ts`

**Testing Requirements**:
- Achieve >80% coverage for critical paths
- All E2E tests pass
- No flaky tests

---

### Task 6.9: Documentation

**ID**: `task-6-9-documentation`
**Complexity**: M
**Dependencies**: All implementation tasks

**Description**:
Create comprehensive documentation for the application.

**Acceptance Criteria**:
- [ ] README.md with setup instructions
- [ ] API documentation (based on OpenAPI spec)
- [ ] User guide (how to use the app)
- [ ] Developer guide (how to contribute)
- [ ] Environment variables documentation
- [ ] Deployment guide
- [ ] Architecture documentation

**Files to Create**:
- `README.md`
- `docs/API.md`
- `docs/USER_GUIDE.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/DEPLOYMENT.md`
- `docs/ARCHITECTURE.md`

**Testing Requirements**:
- Verify all links work
- Test setup instructions on fresh machine

---

### Task 6.10: Deployment Configuration

**ID**: `task-6-10-deployment`
**Complexity**: L
**Dependencies**: task-6-8-testing

**Description**:
Configure deployment to Vercel (app) and Railway (database) with CI/CD.

**Acceptance Criteria**:
- [ ] Vercel project created
- [ ] Railway PostgreSQL database created
- [ ] Environment variables configured
- [ ] GitHub Actions CI/CD pipeline:
  - Run tests on PR
  - Deploy to preview on PR
  - Deploy to production on merge to main
- [ ] Domain configuration (optional)
- [ ] SSL certificates
- [ ] Database backups configured

**Files to Create**:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `vercel.json`
- `railway.json`

**Testing Requirements**:
- Test deployment to preview
- Test CI pipeline
- Verify production deployment

---

### Task 6.11: Performance Optimization

**ID**: `task-6-11-performance`
**Complexity**: M
**Dependencies**: task-6-10-deployment

**Description**:
Optimize application performance to meet targets.

**Acceptance Criteria**:
- [ ] Lighthouse score >80 for all pages
- [ ] Core Web Vitals:
  - LCP <2.5s
  - FID <100ms
  - CLS <0.1
- [ ] Image optimization (next/image)
- [ ] Code splitting and lazy loading
- [ ] Database query optimization
- [ ] Caching strategy (TanStack Query)
- [ ] Bundle size <500KB initial load

**Files to Modify**:
- Various components for optimization
- Database queries for N+1 fixes
- Images for optimization

**Testing Requirements**:
- Run Lighthouse audit
- Test with Chrome DevTools Performance panel
- Test on slow 3G network
- Verify Core Web Vitals

---

## Summary

**Total Tasks**: 78
**Total Phases**: 6 (excluding Phase 0)

**Phase Breakdown**:
- Phase 0: Planning & Architecture - 4 tasks ✅ COMPLETE
- Phase 1: Foundation & Authentication - 12 tasks
- Phase 2: Trip Management Core - 13 tasks
- Phase 3: Itinerary & Events - 11 tasks
- Phase 4: Collaboration & Communication - 16 tasks
- Phase 5: Financial & Professional Features - 15 tasks
- Phase 6: Export, Polish & Deployment - 11 tasks

**Estimated Timeline**: 16-20 weeks total (4-5 months)

**Complexity Breakdown**:
- S (Small): 11 tasks (~1-2 days each)
- M (Medium): 40 tasks (~2-4 days each)
- L (Large): 21 tasks (~4-6 days each)
- XL (Extra Large): 6 tasks (~1-2 weeks each)

**Next Steps**:
1. Mark Phase 0 as complete in project-state.json
2. Set up Phase 1 tasks in project-state.json
3. Begin Phase 1 with task-1-1-project-setup
4. Use `/orchestrate` to progress through implementation

---

**Notes**:
- Tasks are designed to be completed by the staff-engineer agent with assistance from other specialized agents
- Each task has clear acceptance criteria for validation
- Testing requirements ensure quality at every step
- Dependencies prevent out-of-order execution
- All tasks align with the 38 approved features from project-idea.md
