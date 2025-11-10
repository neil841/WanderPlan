# WanderPlan Database Schema

## Overview

Complete PostgreSQL database schema for WanderPlan, designed to support 85 API endpoints across 38 features. The schema uses Prisma ORM with TypeScript for type-safe database operations.

**Location**: `/Users/neilbiswas/Documents/WanderPlan/prisma/schema.prisma`

**Statistics**:
- **28 Models** (database tables)
- **13 Enums** (for fixed value sets)
- **780 lines** of schema definition
- Database: PostgreSQL
- ORM: Prisma Client

---

## Core Model Categories

### 1. Authentication & User Management (5 models)

#### User
Primary user account model with profile information.

**Fields**:
- `id` (UUID, primary key)
- `email` (unique, indexed)
- `password` (hashed)
- `firstName`, `lastName`
- `avatarUrl`, `bio`, `phone`
- `timezone`
- `settings` (JSON) - notifications, privacy, preferences
- `emailVerified`

**Relations**:
- Has many: trips, events, messages, expenses, collaborations
- Supports: OAuth accounts, sessions

#### Account (NextAuth)
OAuth provider accounts (Google, GitHub, etc.)

**Fields**:
- Links to User
- Stores provider tokens and metadata
- Supports multiple providers per user

#### Session (NextAuth)
User sessions for authentication.

#### VerificationToken
Email verification tokens (expires in 24 hours).

#### PasswordResetToken
Password reset tokens (expires in 1 hour).

---

### 2. Trip Management (3 models)

#### Trip
Core trip entity with metadata.

**Fields**:
- `id` (UUID)
- `name`, `description`
- `startDate`, `endDate`
- `destinations` (String array)
- `visibility` (PRIVATE, SHARED, PUBLIC)
- `coverImageUrl`
- `isArchived` (soft delete support)
- `createdBy` (foreign key to User)

**Relations**:
- Has many: events, collaborators, messages, ideas, polls, expenses, documents, activities, tags
- Has one: budget

**Indexes**:
- `createdBy`
- `createdBy + isArchived` (composite for filtering)
- `visibility`
- `startDate`

#### TripCollaborator
Many-to-many relationship for trip sharing.

**Fields**:
- `tripId`, `userId`
- `role` (VIEWER, EDITOR, ADMIN)
- `status` (PENDING, ACCEPTED, DECLINED)
- `invitedBy`, `invitedAt`, `joinedAt`

**Unique Constraint**: `tripId + userId`

#### Tag
Trip categorization and organization.

**Fields**:
- `name`, `color`
- Linked to trip

---

### 3. Itinerary Management (1 model)

#### Event
Individual itinerary items (6 types).

**Fields**:
- `id`, `tripId`
- `type` (FLIGHT, HOTEL, ACTIVITY, RESTAURANT, TRANSPORTATION, DESTINATION)
- `title`, `description`
- `startDateTime`, `endDateTime`
- `location` (JSON: {name, address, lat, lon})
- `order` (for drag-and-drop)
- `notes`, `confirmationNumber`
- `cost`, `currency`
- `createdBy`

**Relations**:
- Belongs to: trip
- Has many: documents, expenses

**Indexes**:
- `tripId`
- `tripId + order` (for sorted retrieval)
- `type`
- `startDateTime`

---

### 4. Collaboration Features (7 models)

#### Message
Real-time trip messaging.

**Fields**:
- `content`, `replyTo` (threading support)
- `isEdited`

**Indexes**:
- `tripId + createdAt` (for timeline queries)

#### Idea
Trip suggestions with voting.

**Fields**:
- `title`, `description`
- `status` (OPEN, ACCEPTED, REJECTED)

#### IdeaVote
User votes on ideas (upvote/downvote).

**Fields**:
- `vote` (1 or -1)
- Unique constraint: `ideaId + userId`

#### Poll
Group decision-making polls.

**Fields**:
- `question`
- `allowMultipleVotes`
- `status` (OPEN, CLOSED)
- `expiresAt`

#### PollOption
Poll answer choices.

#### PollVote
User votes on poll options.

**Unique Constraint**: `pollId + optionId + userId`

#### Activity
Activity feed/timeline for trip updates.

**Fields**:
- `actionType` (TRIP_UPDATED, EVENT_CREATED, etc.)
- `actionData` (JSON with context-specific data)

---

### 5. Financial Management (4 models)

#### Budget
Trip-level budget tracking.

**Fields**:
- `totalBudget`, `currency`
- `categoryBudgets` (JSON structure):
  ```json
  {
    "accommodation": {"budgeted": 1000, "spent": 500, "remaining": 500},
    "transportation": {...},
    "food": {...},
    "activities": {...},
    "other": {...}
  }
  ```

**Relation**: One-to-one with Trip

#### Expense
Individual expense tracking.

**Fields**:
- `category` (ACCOMMODATION, TRANSPORTATION, FOOD, ACTIVITIES, SHOPPING, OTHER)
- `description`, `amount`, `currency`, `date`
- `paidBy` (user who paid)
- `receiptUrl`
- `eventId` (optional link to event)

#### ExpenseSplit
Who owes what for each expense.

**Fields**:
- `expenseId`, `userId`, `amount`

**Unique Constraint**: `expenseId + userId`

---

### 6. Document Management (1 model)

#### Document
File attachments for trips and events.

**Fields**:
- `name`, `type` (PASSPORT, VISA, BOOKING, TICKET, INSURANCE, OTHER)
- `fileUrl` (S3/R2 URL, TEXT type)
- `fileSize`, `mimeType`
- `eventId` (optional)
- `uploadedBy`

**Indexes**:
- `tripId`
- `eventId`

---

### 7. Professional/CRM Features (7 models)

#### CrmClient
Client management for travel agents.

**Fields**:
- `userId` (agent who owns this client)
- `firstName`, `lastName`, `email`, `phone`
- `status` (LEAD, ACTIVE, INACTIVE)
- `source`, `tags`, `notes`

**Indexes**:
- `userId`
- `email`
- `status`

#### Proposal
Client proposals with line items.

**Fields**:
- `clientId`, `tripId` (optional)
- `title`, `description`
- `totalPrice`, `currency`
- `status` (DRAFT, SENT, ACCEPTED, REJECTED)
- `validUntil`, `sentAt`

#### ProposalLineItem
Individual items in proposals.

**Fields**:
- `description`, `quantity`, `unitPrice`, `total`
- `order` (for sorting)

#### Invoice
Client invoicing with Stripe integration.

**Fields**:
- `invoiceNumber` (unique, indexed)
- `clientId`, `tripId` (optional)
- `subtotal`, `tax`, `total`, `currency`
- `status` (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- `dueDate`, `paidAt`

#### InvoiceLineItem
Individual items in invoices.

#### Payment
Payment records (Stripe integration).

**Fields**:
- `invoiceId`, `amount`, `currency`
- `stripePaymentId` (unique)
- `paymentMethod`, `status`

---

### 8. Marketing Features (2 models)

#### LandingPage
Custom landing pages for lead generation.

**Fields**:
- `slug` (unique URL)
- `title`, `description`
- `content` (JSON for page builder)
- `isPublished`

#### Lead
Lead capture and tracking.

**Fields**:
- `landingPageId` (source)
- `firstName`, `lastName`, `email`, `phone`, `message`
- `source`, `status` (NEW, CONTACTED, CONVERTED, LOST)
- `convertedToClientId` (link to CRM client)
- `assignedToId` (agent assigned)

---

## Enums

### EventType
- FLIGHT
- HOTEL
- ACTIVITY
- RESTAURANT
- TRANSPORTATION
- DESTINATION

### ExpenseCategory
- ACCOMMODATION
- TRANSPORTATION
- FOOD
- ACTIVITIES
- SHOPPING
- OTHER

### CollaboratorRole
- VIEWER (read-only access)
- EDITOR (can modify trip)
- ADMIN (can manage collaborators)

### CollaboratorStatus
- PENDING (invitation sent)
- ACCEPTED (joined trip)
- DECLINED (rejected invitation)

### InvoiceStatus
- DRAFT
- SENT
- PAID
- OVERDUE
- CANCELLED

### ProposalStatus
- DRAFT
- SENT
- ACCEPTED
- REJECTED

### IdeaStatus
- OPEN
- ACCEPTED
- REJECTED

### PollStatus
- OPEN
- CLOSED

### ActivityActionType
- TRIP_UPDATED
- EVENT_CREATED
- EVENT_UPDATED
- EVENT_DELETED
- COLLABORATOR_ADDED
- COLLABORATOR_REMOVED
- EXPENSE_ADDED
- MESSAGE_POSTED

### TripVisibility
- PRIVATE (only owner + collaborators)
- SHARED (collaborators can invite)
- PUBLIC (visible to everyone)

### DocumentType
- PASSPORT
- VISA
- BOOKING
- TICKET
- INSURANCE
- OTHER

### ClientStatus
- LEAD
- ACTIVE
- INACTIVE

### LeadStatus
- NEW
- CONTACTED
- CONVERTED
- LOST

---

## Key Features

### 1. Soft Deletes
Trips use `isArchived` boolean instead of hard deletes, allowing recovery.

### 2. JSON Fields
Flexible data storage for:
- User settings
- Event locations (lat/lon coordinates)
- Budget category breakdowns
- Landing page content

### 3. UUID Primary Keys
All models use UUID strings for globally unique identifiers.

### 4. Comprehensive Indexing
Indexes on:
- All foreign keys
- Frequently queried fields (email, status, dates)
- Composite indexes for common query patterns

### 5. Cascade Deletes
Proper cascade rules:
- Deleting user → deletes their accounts, sessions
- Deleting trip → deletes events, messages, collaborators
- Deleting expense → deletes splits

### 6. Timestamp Tracking
All models include:
- `createdAt` (auto-set on creation)
- `updatedAt` (auto-updated on modification)

### 7. NextAuth Integration
Full support for NextAuth.js Prisma adapter:
- User, Account, Session, VerificationToken models
- OAuth provider support

---

## Relationship Summary

### User Relationships
- Creates trips (one-to-many)
- Collaborates on trips (many-to-many via TripCollaborator)
- Creates events, messages, ideas, expenses
- Manages CRM clients, proposals, invoices
- Creates landing pages and receives leads

### Trip Relationships
- Has events (one-to-many, ordered)
- Has collaborators (many-to-many)
- Has messages, ideas, polls (one-to-many)
- Has one budget
- Has expenses, documents, tags (one-to-many)

### Event Relationships
- Belongs to trip
- Has documents (one-to-many)
- Has expenses (one-to-many)

### Expense Relationships
- Belongs to trip
- Optionally belongs to event
- Has splits (one-to-many)

---

## Data Types

### Decimals
Financial fields use `Decimal(10, 2)`:
- Budgets, expenses, invoice amounts
- Precise to 2 decimal places

### Text Fields
Large text fields use `@db.Text`:
- Descriptions, notes, messages
- URLs (for S3/Cloudflare R2 paths)

### Dates
- `@db.Date` for dates without time
- `DateTime` for timestamps
- All dates stored in UTC

### Currency
Always stored as 3-character ISO codes (`@db.Char(3)`):
- USD, EUR, GBP, etc.

---

## Performance Optimizations

### Composite Indexes
- `Trip`: `(createdBy, isArchived)` for filtering user's active trips
- `Event`: `(tripId, order)` for sorted itinerary retrieval
- `Message`: `(tripId, createdAt)` for timeline queries

### Unique Constraints
Prevent duplicates:
- `User.email`
- `Invoice.invoiceNumber`
- `TripCollaborator(tripId, userId)`
- `IdeaVote(ideaId, userId)`
- `PollVote(pollId, optionId, userId)`

---

## Migration Considerations

### Initial Setup
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Push to database
npx prisma db push
```

### Seeding
Create seed data for:
- Demo user accounts
- Sample trips with events
- Test expenses and budgets

### Production Deployment
```bash
# Generate production migration
npx prisma migrate deploy
```

---

## Environment Variables Required

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wanderplan?schema=public"
```

For production (connection pooling):
```env
DATABASE_URL="postgresql://user:password@host:5432/wanderplan"
DIRECT_URL="postgresql://user:password@host:5432/wanderplan"
```

---

## Future Enhancements

Potential additions:
1. **Notifications table** - Push/email notification queue
2. **AuditLog table** - Track all database changes
3. **SavedSearches table** - Save destination/POI searches
4. **TripTemplate table** - Reusable trip templates
5. **Webhooks table** - Outbound webhook configurations

---

## Schema Validation

To validate the schema:

```bash
# Format schema
npx prisma format

# Validate schema
npx prisma validate

# Generate types
npx prisma generate
```

---

This schema provides a robust foundation for all WanderPlan features while maintaining data integrity, performance, and scalability.
