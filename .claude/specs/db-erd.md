# WanderPlan Database Entity Relationship Diagram

## Visual Schema Overview

This document provides a visual representation of the database relationships.

---

## Core Entity Groups

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION & USERS                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌─────────────┐
│   User   │◄──────┬─│  Account    │
│  (core)  │       │ │  (OAuth)    │
└────┬─────┘       │ └─────────────┘
     │             │
     │             │ ┌─────────────────────────┐
     │             ├─│  Session                │
     │             │ └─────────────────────────┘
     │             │
     │             │ ┌─────────────────────────┐
     │             └─│  VerificationToken      │
     │               └─────────────────────────┘
     │
     │               ┌─────────────────────────┐
     └───────────────│  PasswordResetToken     │
                     └─────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRIP ECOSYSTEM                            │
└─────────────────────────────────────────────────────────────────┘

        ┌──────────┐
    ┌───│   User   │
    │   └──────────┘
    │        │ creates
    │        ▼
    │   ┌──────────┐
    │   │   Trip   │◄────────┐
    │   └────┬─────┘         │
    │        │               │
    │        │ has many      │
    │        ├───────────────┴─────────────┬──────────────┬────────────┐
    │        │                             │              │            │
    │        ▼                             ▼              ▼            ▼
    │   ┌─────────┐                   ┌────────┐    ┌─────────┐  ┌─────────┐
    │   │  Event  │                   │ Budget │    │ Message │  │  Idea   │
    │   └────┬────┘                   └────────┘    └─────────┘  └─────────┘
    │        │                                                         │
    │        │                                                         │
    │        │                                                         ▼
    │        ▼                                                    ┌──────────┐
    │   ┌──────────┐                                             │ IdeaVote │
    │   │ Document │                                             └──────────┘
    │   └──────────┘
    │
    │        ┌──────────┐
    └────────│   Trip   │
             └────┬─────┘
                  │
                  │ has many
                  ├────────────────┬──────────────┬──────────────┐
                  ▼                ▼              ▼              ▼
          ┌──────────────┐   ┌─────────┐   ┌─────────┐    ┌─────────┐
          │TripCollabor- │   │  Poll   │   │Expense  │    │Activity │
          │   ator       │   └────┬────┘   └────┬────┘    └─────────┘
          │(many-to-many)│        │             │
          └──────────────┘        │             │
                  │               ▼             ▼
                  │         ┌──────────┐  ┌──────────────┐
                  │         │PollOption│  │ ExpenseSplit │
                  │         └────┬─────┘  └──────────────┘
                  │              │
                  │              ▼
                  │         ┌──────────┐
                  │         │PollVote  │
                  │         └──────────┘
                  ▼
            ┌──────────┐
            │   User   │
            └──────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROFESSIONAL/CRM SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐
│   User   │ (Travel Agent)
└────┬─────┘
     │ manages
     ├──────────────────────┬────────────────────┬─────────────────┐
     │                      │                    │                 │
     ▼                      ▼                    ▼                 ▼
┌───────────┐         ┌──────────┐        ┌──────────┐      ┌──────────┐
│ CrmClient │         │ Proposal │        │ Invoice  │      │ Landing  │
└─────┬─────┘         └────┬─────┘        └────┬─────┘      │   Page   │
      │                    │                   │             └────┬─────┘
      │                    │                   │                  │
      │ receives           │ contains          │ contains         │ captures
      │                    │                   │                  │
      ▼                    ▼                   ▼                  ▼
┌──────────┐         ┌──────────┐        ┌──────────┐      ┌──────────┐
│ Proposal │         │Proposal  │        │ Invoice  │      │   Lead   │
│          │         │LineItem  │        │LineItem  │      └─────┬────┘
└──────────┘         └──────────┘        └────┬─────┘            │
                                               │                  │
                                               │ paid via         │ converts to
                                               ▼                  ▼
                                          ┌──────────┐      ┌───────────┐
                                          │ Payment  │      │ CrmClient │
                                          │ (Stripe) │      └───────────┘
                                          └──────────┘
```

---

## Detailed Relationships

### User ↔ Trip

**Type**: One-to-Many (creator) + Many-to-Many (collaborator)

```
User (1) ──creates──> (N) Trip
User (N) ──collaborates──> (N) Trip via TripCollaborator
```

**Fields**:
- Trip.createdBy → User.id
- TripCollaborator.userId → User.id
- TripCollaborator.tripId → Trip.id

---

### Trip ↔ Event

**Type**: One-to-Many

```
Trip (1) ──has──> (N) Event
```

**Fields**:
- Event.tripId → Trip.id
- Event.order (for sorting)

**Cascade**: Deleting trip deletes all events

---

### Event ↔ Document

**Type**: One-to-Many (optional)

```
Event (1) ──has──> (N) Document
Trip (1) ──has──> (N) Document (not linked to event)
```

**Fields**:
- Document.eventId → Event.id (nullable)
- Document.tripId → Trip.id (required)

**Cascade**: Deleting event sets eventId to null

---

### Trip ↔ Budget

**Type**: One-to-One

```
Trip (1) ──has──> (1) Budget
```

**Fields**:
- Budget.tripId → Trip.id (unique)

**Cascade**: Deleting trip deletes budget

---

### Trip ↔ Expense

**Type**: One-to-Many

```
Trip (1) ──has──> (N) Expense
Event (1) ──has──> (N) Expense (optional)
```

**Fields**:
- Expense.tripId → Trip.id
- Expense.eventId → Event.id (nullable)
- Expense.paidBy → User.id

---

### Expense ↔ ExpenseSplit

**Type**: One-to-Many

```
Expense (1) ──splits to──> (N) ExpenseSplit
```

**Fields**:
- ExpenseSplit.expenseId → Expense.id
- ExpenseSplit.userId → User.id

**Logic**:
- Sum of splits = expense amount
- Each split represents amount owed by user

---

### Trip ↔ Message

**Type**: One-to-Many

```
Trip (1) ──has──> (N) Message
Message (1) ──replies to──> (1) Message (optional)
```

**Fields**:
- Message.tripId → Trip.id
- Message.userId → User.id
- Message.replyTo → Message.id (nullable, for threading)

---

### Trip ↔ Idea

**Type**: One-to-Many

```
Trip (1) ──has──> (N) Idea
Idea (1) ──has──> (N) IdeaVote
```

**Fields**:
- Idea.tripId → Trip.id
- Idea.createdBy → User.id
- IdeaVote.ideaId → Idea.id
- IdeaVote.userId → User.id
- IdeaVote.vote (1 or -1)

---

### Trip ↔ Poll

**Type**: One-to-Many

```
Trip (1) ──has──> (N) Poll
Poll (1) ──has──> (N) PollOption
PollOption (1) ──has──> (N) PollVote
```

**Fields**:
- Poll.tripId → Trip.id
- PollOption.pollId → Poll.id
- PollVote.optionId → PollOption.id
- PollVote.userId → User.id

**Unique**: User can only vote once per option

---

### User ↔ CrmClient

**Type**: One-to-Many

```
User (agent) (1) ──manages──> (N) CrmClient
```

**Fields**:
- CrmClient.userId → User.id (agent)

---

### CrmClient ↔ Proposal

**Type**: One-to-Many

```
CrmClient (1) ──receives──> (N) Proposal
Proposal (1) ──links to──> (1) Trip (optional)
Proposal (1) ──has──> (N) ProposalLineItem
```

**Fields**:
- Proposal.clientId → CrmClient.id
- Proposal.tripId → Trip.id (nullable)
- ProposalLineItem.proposalId → Proposal.id

---

### CrmClient ↔ Invoice

**Type**: One-to-Many

```
CrmClient (1) ──receives──> (N) Invoice
Invoice (1) ──links to──> (1) Trip (optional)
Invoice (1) ──has──> (N) InvoiceLineItem
Invoice (1) ──has──> (N) Payment
```

**Fields**:
- Invoice.clientId → CrmClient.id
- Invoice.tripId → Trip.id (nullable)
- InvoiceLineItem.invoiceId → Invoice.id
- Payment.invoiceId → Invoice.id

---

### User ↔ LandingPage ↔ Lead

**Type**: One-to-Many chains

```
User (agent) (1) ──creates──> (N) LandingPage
LandingPage (1) ──captures──> (N) Lead
Lead (1) ──converts to──> (1) CrmClient (optional)
```

**Fields**:
- LandingPage.userId → User.id
- Lead.landingPageId → LandingPage.id (nullable)
- Lead.convertedToClientId → CrmClient.id (nullable, unique)
- Lead.assignedToId → User.id (nullable)

---

## Cascade Delete Rules

### User deleted
- ✅ Deletes: Account, Session
- ✅ Deletes: Trips created by user
- ⚠️  Warning: Consider reassigning or preventing delete if user has clients

### Trip deleted
- ✅ Deletes: Event, TripCollaborator, Message, Idea, Poll, Expense, Document, Activity, Budget, Tag
- ✅ Cascades: Event deletion → Document.eventId set to null

### Event deleted
- ⚠️  Sets null: Document.eventId, Expense.eventId

### Expense deleted
- ✅ Deletes: ExpenseSplit

### Idea deleted
- ✅ Deletes: IdeaVote

### Poll deleted
- ✅ Deletes: PollOption
- ✅ Cascades: PollOption deletion → PollVote deletion

### CrmClient deleted
- ⚠️  Warning: Prevent if has invoices/proposals, or cascade carefully

### Invoice deleted
- ✅ Deletes: InvoiceLineItem, Payment

---

## Index Strategy

### High-Priority Indexes (Most Queried)

1. **User.email** (unique) - Login queries
2. **Trip.createdBy + isArchived** (composite) - User's active trips
3. **Event.tripId + order** (composite) - Sorted itineraries
4. **Message.tripId + createdAt** (composite) - Message timelines
5. **Expense.tripId** - Trip expenses
6. **Invoice.invoiceNumber** (unique) - Invoice lookups
7. **TripCollaborator.tripId** - Collaborator queries
8. **TripCollaborator.userId** - User's trips

### Foreign Key Indexes

All foreign keys are indexed for efficient joins:
- Event.tripId
- Event.createdBy
- Message.userId
- Expense.paidBy
- Document.uploadedBy
- etc.

---

## Data Integrity Rules

### Unique Constraints

1. **User.email** - One account per email
2. **Invoice.invoiceNumber** - Unique invoice numbers
3. **TripCollaborator(tripId, userId)** - Can't add user twice
4. **IdeaVote(ideaId, userId)** - One vote per user per idea
5. **PollVote(pollId, optionId, userId)** - One vote per option per user
6. **ExpenseSplit(expenseId, userId)** - One split per user per expense
7. **Tag(tripId, name)** - No duplicate tag names per trip
8. **LandingPage.slug** - Unique URL slugs
9. **Lead.convertedToClientId** - Can only convert to one client

### Check Constraints (Application Level)

1. **Trip dates**: startDate ≤ endDate
2. **Expense splits**: Sum of splits.amount = expense.amount
3. **Budget**: totalBudget = sum of category budgets
4. **IdeaVote.vote**: Must be 1 or -1
5. **Currency codes**: Must be valid ISO 4217 (3 chars)
6. **Event.order**: Must be unique within trip

---

## Query Patterns

### Common Queries

#### Get user's active trips with collaborators
```prisma
const trips = await prisma.trip.findMany({
  where: {
    createdBy: userId,
    isArchived: false
  },
  include: {
    collaborators: {
      include: { user: true }
    }
  },
  orderBy: { startDate: 'desc' }
})
```

#### Get trip itinerary sorted by order
```prisma
const events = await prisma.event.findMany({
  where: { tripId },
  orderBy: { order: 'asc' },
  include: {
    documents: true,
    expenses: true
  }
})
```

#### Get trip messages with threading
```prisma
const messages = await prisma.message.findMany({
  where: { tripId },
  orderBy: { createdAt: 'asc' },
  include: {
    user: {
      select: { id: true, firstName: true, lastName: true, avatarUrl: true }
    }
  }
})
```

#### Calculate budget vs. spent
```prisma
const budget = await prisma.budget.findUnique({
  where: { tripId }
})

const expenses = await prisma.expense.findMany({
  where: { tripId },
  select: { amount: true, category: true }
})

// Calculate spent per category
const spent = expenses.reduce((acc, exp) => {
  acc[exp.category] = (acc[exp.category] || 0) + exp.amount
  return acc
}, {})
```

#### Get expense split balances
```prisma
const expensesWithSplits = await prisma.expense.findMany({
  where: { tripId },
  include: {
    payer: { select: { id: true, firstName: true, lastName: true } },
    splits: {
      include: {
        user: { select: { id: true, firstName: true, lastName: true } }
      }
    }
  }
})

// Calculate who owes whom
```

---

This ERD provides a complete visual reference for understanding the WanderPlan database structure and relationships.
