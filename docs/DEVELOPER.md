# WanderPlan Developer Guide

> Complete guide for developers contributing to WanderPlan

**Version**: 1.0.0
**Last Updated**: November 2024

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Style Guide](#code-style-guide)
6. [Testing](#testing)
7. [Database](#database)
8. [API Development](#api-development)
9. [Contributing](#contributing)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/wanderplan/wanderplan.git
   cd wanderplan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/wanderplan"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32
   RESEND_API_KEY="your-resend-key"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

4. **Set Up Database**
   ```bash
   # Create database
   createdb wanderplan

   # Push Prisma schema
   npx prisma db push

   # Generate Prisma Client
   npx prisma generate

   # Seed database (optional)
   npx prisma db seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Recommended VS Code Extensions

Install these extensions for the best experience:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma** - Schema syntax highlighting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript** - Enhanced TypeScript support
- **GitLens** - Git visualization

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Architecture Overview

### Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Framer Motion

**Backend**:
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Resend (email)
- Stripe (payments)

**Testing**:
- Jest (unit tests)
- React Testing Library (component tests)
- Playwright (E2E tests)

### Architecture Pattern

WanderPlan follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (Next.js Pages, React Components)      │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│        Application Layer                │
│     (API Routes, Business Logic)        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│          Domain Layer                   │
│     (Entities, Business Rules)          │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│      Infrastructure Layer               │
│  (Prisma, External Services, APIs)      │
└─────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Inversion**: Depend on abstractions, not implementations
3. **DRY** (Don't Repeat Yourself): Reuse code through composition
4. **SOLID Principles**: Follow object-oriented best practices
5. **Type Safety**: Strict TypeScript mode enabled

---

## Project Structure

```
wanderplan/
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml           # Continuous integration
│       └── deploy.yml       # Deployment
├── .vscode/                 # VS Code settings
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── USER-GUIDE.md       # User guide
│   └── DEVELOPER.md        # This file
├── e2e/                     # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── trips.spec.ts
│   └── playwright.config.ts
├── prisma/                  # Prisma ORM
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts             # Seed data
├── public/                  # Static assets
│   ├── images/
│   └── icons/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/        # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/   # Dashboard route group
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/           # API routes
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── trips/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/route.ts
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Homepage
│   │   └── error.tsx      # Error boundary
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── trips/
│   │   │   ├── TripCard.tsx
│   │   │   ├── TripList.tsx
│   │   │   └── TripForm.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── lib/               # Business logic
│   │   ├── auth/
│   │   │   ├── session.ts
│   │   │   ├── password.ts
│   │   │   └── middleware.ts
│   │   ├── db/
│   │   │   └── index.ts   # Prisma client singleton
│   │   ├── validations/   # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── trip.ts
│   │   │   └── event.ts
│   │   ├── email/
│   │   │   ├── templates/
│   │   │   └── send.ts
│   │   └── utils/
│   │       ├── api.ts
│   │       ├── date.ts
│   │       └── format.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTrips.ts
│   │   └── useDebounce.ts
│   ├── types/             # TypeScript types
│   │   ├── api.ts
│   │   ├── db.ts
│   │   └── global.d.ts
│   ├── middleware.ts      # Next.js middleware
│   └── styles/
│       └── globals.css    # Global styles
├── tests/                 # Jest tests
│   ├── unit/
│   │   ├── lib/
│   │   └── components/
│   └── integration/
│       └── api/
├── .env.example          # Environment variables template
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── jest.config.js        # Jest configuration
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project overview
```

---

## Development Workflow

### Branching Strategy

We use **Git Flow**:

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

**Example**:
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/trip-duplication

# Work on feature
git add .
git commit -m "feat: add trip duplication API endpoint"

# Push and create PR
git push origin feature/trip-duplication
```

### Commit Message Convention

We follow **Conventional Commits**:

**Format**: `type(scope): description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance (dependencies, configs)

**Examples**:
```bash
git commit -m "feat(trips): add trip duplication endpoint"
git commit -m "fix(auth): resolve password reset email not sending"
git commit -m "docs(api): update API documentation for events"
git commit -m "test(trips): add integration tests for trip CRUD"
git commit -m "refactor(db): optimize trip queries with includes"
```

### Pull Request Process

1. **Create PR**
   - From `feature/*` to `develop`
   - Fill out PR template
   - Link related issues

2. **Code Review**
   - At least 1 approval required
   - Address reviewer comments
   - Ensure CI passes

3. **Merge**
   - Use "Squash and merge"
   - Delete feature branch after merge

**PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Code Style Guide

### TypeScript

**Use strict mode**:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Avoid `any`**:
```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
interface Data {
  value: string;
}

function processData(data: Data): string {
  return data.value;
}
```

**Use type inference**:
```typescript
// ❌ Bad
const trips: Trip[] = await prisma.trip.findMany();

// ✅ Good (Prisma already types the return)
const trips = await prisma.trip.findMany();
```

**Prefer interfaces over types**:
```typescript
// ✅ For objects
interface User {
  id: string;
  email: string;
  name: string;
}

// ✅ For unions
type Status = 'PENDING' | 'ACCEPTED' | 'REJECTED';
```

### React Components

**Functional components**:
```typescript
// ✅ Good - TypeScript + Arrow function
interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
}

export function TripCard({ trip, onDelete }: TripCardProps) {
  return (
    <div className="trip-card">
      <h3>{trip.title}</h3>
      {onDelete && (
        <button onClick={() => onDelete(trip.id)}>Delete</button>
      )}
    </div>
  );
}
```

**Use composition**:
```typescript
// ✅ Good - Compose components
export function TripList() {
  const { data: trips } = useTrips();

  return (
    <div>
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
```

**Custom hooks for logic**:
```typescript
// ✅ Good - Extract logic to hook
function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await fetch('/api/trips');
      if (!res.ok) throw new Error('Failed to fetch trips');
      return res.json();
    },
  });
}
```

### API Routes

**Consistent structure**:
```typescript
// src/app/api/trips/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// Validation schema
const createTripSchema = z.object({
  title: z.string().min(1).max(100),
  destination: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// GET /api/trips
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // 3. Database query
    const trips = await prisma.trip.findMany({
      where: {
        createdBy: session.user.id,
        isArchived: status === 'archived',
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Return response
    return NextResponse.json({ trips });
  } catch (error) {
    console.error('GET /api/trips error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/trips
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate body
    const body = await req.json();
    const data = createTripSchema.parse(body);

    // 3. Business logic
    const trip = await prisma.trip.create({
      data: {
        ...data,
        createdBy: session.user.id,
      },
    });

    // 4. Return response
    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/trips error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Handling

**Use try-catch consistently**:
```typescript
// ✅ Good
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
    throw new UserFriendlyError('Something went wrong');
  }
  // Re-throw unknown errors
  throw error;
}
```

**Custom error classes**:
```typescript
// lib/errors.ts
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// Usage
if (!trip) {
  throw new NotFoundError('Trip');
}
```

### Naming Conventions

**Variables and functions**: camelCase
```typescript
const userTrips = await fetchUserTrips();
function calculateTotalExpenses(expenses: Expense[]) { }
```

**Classes and interfaces**: PascalCase
```typescript
interface TripData { }
class TripService { }
```

**Constants**: UPPER_SNAKE_CASE
```typescript
const MAX_TRIP_DURATION_DAYS = 365;
const DEFAULT_PAGE_SIZE = 20;
```

**Files**: kebab-case
```
trip-card.tsx
use-trips.ts
calculate-expenses.ts
```

---

## Testing

### Test Pyramid

```
       /\
      /E2E\      (5%)  - Critical user flows
     /______\
    /        \
   /Integration\ (15%) - API + DB integration
  /____________\
 /              \
/   Unit Tests   \ (80%) - Business logic
/________________\
```

### Unit Tests (Jest)

**Testing utilities**:
```typescript
// tests/unit/lib/calculate-expenses.test.ts
import { calculateTotalExpenses } from '@/lib/expenses';

describe('calculateTotalExpenses', () => {
  it('should sum all expense amounts', () => {
    const expenses = [
      { amount: 100, currency: 'USD' },
      { amount: 200, currency: 'USD' },
      { amount: 300, currency: 'USD' },
    ];

    const total = calculateTotalExpenses(expenses);
    expect(total).toBe(600);
  });

  it('should return 0 for empty array', () => {
    const total = calculateTotalExpenses([]);
    expect(total).toBe(0);
  });

  it('should handle decimal amounts', () => {
    const expenses = [
      { amount: 10.50, currency: 'USD' },
      { amount: 20.75, currency: 'USD' },
    ];

    const total = calculateTotalExpenses(expenses);
    expect(total).toBe(31.25);
  });
});
```

**Testing components**:
```typescript
// tests/unit/components/TripCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripCard } from '@/components/trips/TripCard';

const mockTrip = {
  id: 'trip_123',
  title: 'Paris Vacation',
  destination: 'Paris, France',
  startDate: '2024-12-01',
  endDate: '2024-12-07',
};

describe('TripCard', () => {
  it('should render trip details', () => {
    render(<TripCard trip={mockTrip} />);

    expect(screen.getByText('Paris Vacation')).toBeInTheDocument();
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', async () => {
    const onDelete = jest.fn();
    render(<TripCard trip={mockTrip} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('trip_123');
  });
});
```

### Integration Tests

**Testing API endpoints**:
```typescript
// tests/integration/api/trips.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/trips/route';
import { prisma } from '@/lib/db';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: 'user_123', email: 'test@example.com' },
  })),
}));

describe('/api/trips', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.trip.deleteMany();
  });

  describe('GET', () => {
    it('should return user trips', async () => {
      // Seed data
      await prisma.trip.create({
        data: {
          title: 'Test Trip',
          destination: 'Test Destination',
          startDate: new Date(),
          endDate: new Date(),
          createdBy: 'user_123',
        },
      });

      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trips).toHaveLength(1);
      expect(data.trips[0].title).toBe('Test Trip');
    });
  });

  describe('POST', () => {
    it('should create a new trip', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          title: 'New Trip',
          destination: 'Paris, France',
          startDate: '2024-12-01T00:00:00Z',
          endDate: '2024-12-07T00:00:00Z',
        },
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.trip.title).toBe('New Trip');

      // Verify in database
      const trip = await prisma.trip.findUnique({
        where: { id: data.trip.id },
      });
      expect(trip).toBeTruthy();
    });

    it('should return 400 for invalid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          title: '', // Invalid: empty title
        },
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });
  });
});
```

### E2E Tests (Playwright)

**Testing user flows**:
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register and login', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecureP@ssw0rd');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.click('button[type="submit"]');

    // Should redirect to trips
    await expect(page).toHaveURL('/trips');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout"]');

    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecureP@ssw0rd');
    await page.click('button[type="submit"]');

    // Should redirect to trips
    await expect(page).toHaveURL('/trips');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests (watch mode)
npm run test:watch

# Integration tests
npm run test

# E2E tests
npm run test:e2e

# E2E tests (headed mode)
npm run test:e2e:headed

# E2E tests (debug mode)
npm run test:e2e:debug

# All tests with coverage
npm run test:coverage
```

### Coverage Goals

- **Overall**: >80%
- **Critical paths**: >90% (auth, payments)
- **Business logic**: >85%
- **UI components**: >70%

---

## Database

### Prisma Workflow

**Schema changes**:
```bash
# 1. Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_tags_to_trip

# 3. Generate Prisma Client
npx prisma generate

# 4. Apply in production
npx prisma migrate deploy
```

**Prisma Studio** (database GUI):
```bash
npx prisma studio
# Opens http://localhost:5555
```

### Schema Best Practices

**Use relations properly**:
```prisma
model User {
  id        String   @id @default(cuid())
  trips     Trip[]   // One-to-many
  createdAt DateTime @default(now())
}

model Trip {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  events    Event[]  // One-to-many
  createdAt DateTime @default(now())

  @@index([userId])  // Index foreign keys
}
```

**Use enums for constants**:
```prisma
enum EventType {
  FLIGHT
  HOTEL
  ACTIVITY
  RESTAURANT
  TRANSPORTATION
  DESTINATION
}

model Event {
  id   String    @id @default(cuid())
  type EventType  // Use enum
}
```

**Add indexes strategically**:
```prisma
model Trip {
  id          String   @id @default(cuid())
  userId      String
  startDate   DateTime
  destination String

  @@index([userId])           // For WHERE userId =
  @@index([userId, startDate])  // For WHERE userId = AND ORDER BY startDate
  @@index([destination])      // For WHERE destination LIKE
}
```

### Query Optimization

**Avoid N+1 queries**:
```typescript
// ❌ Bad - N+1 query
const trips = await prisma.trip.findMany();
for (const trip of trips) {
  trip.events = await prisma.event.findMany({
    where: { tripId: trip.id },
  });
}

// ✅ Good - Single query with include
const trips = await prisma.trip.findMany({
  include: {
    events: true,
  },
});
```

**Select only needed fields**:
```typescript
// ❌ Bad - Fetches all fields
const trips = await prisma.trip.findMany({
  include: { events: true },
});

// ✅ Good - Select specific fields
const trips = await prisma.trip.findMany({
  select: {
    id: true,
    title: true,
    destination: true,
    events: {
      select: {
        id: true,
        title: true,
        startDate: true,
      },
    },
  },
});
```

**Use pagination**:
```typescript
// ✅ Good - Paginate large datasets
const trips = await prisma.trip.findMany({
  take: 20,  // Limit
  skip: (page - 1) * 20,  // Offset
  orderBy: { createdAt: 'desc' },
});
```

---

## API Development

### RESTful Conventions

**HTTP Methods**:
- `GET` - Retrieve resource(s)
- `POST` - Create resource
- `PATCH` - Update resource (partial)
- `PUT` - Replace resource (full)
- `DELETE` - Delete resource

**Status Codes**:
- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Response Format**:
```typescript
// Success
{
  "trip": { ... },
  "message": "Trip created successfully"
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

### Authentication

**Protecting routes**:
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/trips/:path*', '/api/trips/:path*'],
};
```

**Getting session in API**:
```typescript
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  // Use userId in queries
}
```

### Validation

**Use Zod schemas**:
```typescript
import { z } from 'zod';

const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  tags: z.array(z.string()).optional(),
});

// Validate
try {
  const data = createTripSchema.parse(body);
  // data is typed and validated
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 400 }
    );
  }
}
```

---

## Contributing

### How to Contribute

1. **Find an issue** or create one
2. **Fork the repository**
3. **Create a feature branch**
4. **Make your changes**
5. **Write tests**
6. **Submit a pull request**

### Contribution Guidelines

**Code Quality**:
- Follow code style guide
- Write tests for new features
- Update documentation
- Add JSDoc comments

**Commits**:
- Use conventional commits
- Keep commits atomic
- Write clear commit messages

**Pull Requests**:
- Fill out PR template
- Link related issues
- Ensure CI passes
- Address review comments

### Good First Issues

Look for issues tagged:
- `good first issue`
- `help wanted`
- `documentation`

---

## Troubleshooting

### Common Issues

**Prisma Client Not Found**:
```bash
# Generate Prisma Client
npx prisma generate
```

**Database Connection Error**:
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Test connection:
npx prisma db pull
```

**Type Errors**:
```bash
# Regenerate Prisma types
npx prisma generate

# Check TypeScript
npm run type-check
```

**Build Failing**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## Resources

**Documentation**:
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

**Community**:
- GitHub Discussions
- Discord Server (coming soon)
- Stack Overflow (tag: `wanderplan`)

---

**Ready to contribute?** Pick an issue and let's build something amazing together!

For questions, contact: dev@wanderplan.com
