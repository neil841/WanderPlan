# Technical Architecture - WanderPlan

> System Architect | 2025-11-08
>
> **Status**: ✅ APPROVED - Ready for Implementation

---

## Executive Summary

**Architecture Pattern**: Modular Monolith with Clean Architecture
**Primary Stack**: Next.js 14 + TypeScript + PostgreSQL + Prisma
**Deployment**: Vercel (Application) + Railway (Database)
**Target Scale**: 100K users (MVP), 1M+ users (future)

WanderPlan is a comprehensive travel planning application built as a modular monolith. This architecture provides the right balance of simplicity for rapid development while maintaining clear boundaries for future scaling.

---

## Technology Stack

### Frontend Layer

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Framework** | Next.js | 14.x | Server-side rendering, React Server Components, built-in API routes, excellent DX |
| **Language** | TypeScript | 5.x | Type safety, better IDE support, catches errors at compile time |
| **UI Library** | React | 18.x | Component-based architecture, massive ecosystem, team expertise |
| **Styling** | Tailwind CSS | 3.x | Utility-first, rapid prototyping, small bundle size, easy customization |
| **Component Library** | shadcn/ui | latest | Accessible, customizable, copy-paste components, not a dependency |
| **Forms** | react-hook-form | 7.x | Excellent performance, minimal re-renders, easy validation integration |
| **Validation** | Zod | 3.x | Type-safe schemas, shared between client/server, composable |
| **State Management** | React Context + Hooks | built-in | Sufficient for app complexity, no external dependency needed |
| **Data Fetching** | TanStack Query | 5.x | Automatic caching, background refetching, optimistic updates |
| **Drag & Drop** | dnd-kit | 6.x | Accessible, performant, works with React Server Components |
| **Calendar** | FullCalendar | 6.x | Feature-rich, customizable, supports multiple views |
| **Maps** | Leaflet | 1.9.x | Open-source, works with OpenStreetMap, no API costs |
| **Animation** | Framer Motion | 11.x | Declarative animations, gesture support, spring physics |
| **PDF Generation** | @react-pdf/renderer | 3.x | React-based PDF creation, customizable templates |

### Backend Layer

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Runtime** | Node.js | 20 LTS | Latest LTS, excellent performance, huge ecosystem |
| **Framework** | Next.js API Routes | 14.x | Co-located with frontend, serverless-ready, TypeScript support |
| **Language** | TypeScript | 5.x | Shared types with frontend, type-safe API contracts |
| **ORM** | Prisma | 5.x | Type-safe queries, excellent migrations, auto-generated types |
| **Validation** | Zod | 3.x | Runtime validation, type inference, error messages |
| **Authentication** | NextAuth.js | 4.x | OAuth + credentials, session management, Prisma adapter |
| **Password Hashing** | bcrypt | 5.x | Industry standard, configurable rounds, secure |
| **Email** | Resend | 2.x | Modern API, excellent deliverability, generous free tier |
| **File Upload** | uploadthing | 6.x | Built for Next.js, automatic optimization, S3-compatible |

### Database & Storage

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Primary Database** | PostgreSQL 15 | ACID compliance, excellent performance, JSON support, full-text search |
| **ORM** | Prisma | Type-safe queries, migrations, excellent DX |
| **Cache** | Redis (future) | Fast in-memory cache for sessions, rate limiting |
| **File Storage** | Vercel Blob / S3 | CDN-backed, automatic optimization, pay-per-use |
| **Search** | PostgreSQL FTS | Built-in full-text search, no external dependency for MVP |

### Testing & Quality

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Unit Testing** | Jest | Fast, widely adopted, great mocking support |
| **Component Testing** | React Testing Library | User-centric testing, encourages accessibility |
| **Integration Testing** | Jest + Supertest | Test API endpoints without browser |
| **E2E Testing** | Playwright | Fast, reliable, cross-browser, great debugging |
| **Type Checking** | TypeScript | Compile-time safety |
| **Linting** | ESLint | Code quality, consistency |
| **Formatting** | Prettier | Automatic formatting, no style debates |
| **Coverage** | Jest Coverage | Track test coverage, enforce minimums |

### DevOps & Infrastructure

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Hosting (App)** | Vercel | Zero-config Next.js deployment, edge network, preview deployments |
| **Hosting (DB)** | Railway | Managed PostgreSQL, automatic backups, easy scaling |
| **CI/CD** | GitHub Actions | Automated testing, linting, deployment |
| **Monitoring** | Vercel Analytics | Web vitals, performance metrics |
| **Error Tracking** | Sentry | Error monitoring, performance tracking, release tracking |
| **Logging** | Vercel Logs | Centralized logs, search, filters |
| **Domains** | Vercel Domains | SSL certificates, DNS management |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│   React Components, TanStack Query, Client State        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel Edge Network (CDN)                   │
│        Static Assets, Edge Functions, Caching           │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌──────────────────┐  ┌──────────────────────────────┐
│  Static Assets   │  │   Next.js App (Serverless)   │
│  (HTML, CSS, JS) │  │   - App Router Pages (RSC)   │
│                  │  │   - API Routes               │
│                  │  │   - Server Actions           │
└──────────────────┘  └────────────┬─────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
          ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
          │  PostgreSQL  │ │Vercel Blob  │ │ External APIs│
          │   (Railway)  │ │(File Store) │ │(Stripe, etc.)│
          └──────────────┘ └─────────────┘ └──────────────┘
```

### Application Layers (Clean Architecture)

```
┌────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Next.js Pages & Layouts (app/)                  │  │
│  │  - Server Components (data fetching)             │  │
│  │  - Client Components (interactivity)             │  │
│  │  - Forms, Tables, Cards, Modals                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────┐
│                APPLICATION LAYER                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes (app/api/)                           │  │
│  │  - Request validation (Zod)                      │  │
│  │  - Business logic orchestration                  │  │
│  │  - Response formatting                           │  │
│  │  - Error handling                                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────┐
│                   DOMAIN LAYER                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Business Logic (lib/)                           │  │
│  │  - Domain models                                 │  │
│  │  - Business rules                                │  │
│  │  - Value objects                                 │  │
│  │  - Domain events                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────┐
│              INFRASTRUCTURE LAYER                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  External Services (lib/infrastructure/)         │  │
│  │  - Prisma Client (database)                      │  │
│  │  - Email service (Resend)                        │  │
│  │  - File storage (Vercel Blob)                    │  │
│  │  - Payment processing (Stripe)                   │  │
│  │  - External APIs (OpenStreetMap, Weather)        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Directory Structure

```
wanderplan/
├── .claude/                      # Agentic development system
├── .github/
│   └── workflows/
│       ├── ci.yml               # Run tests on PR
│       └── deploy.yml           # Deploy to production
├── prisma/
│   ├── schema.prisma            # Database schema (28 models)
│   ├── migrations/              # Migration history
│   └── seed.ts                  # Seed data for development
├── public/
│   ├── images/                  # Static images
│   ├── icons/                   # App icons
│   └── favicon.ico
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── (auth)/             # Auth route group (no nav)
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx    # Register page
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx    # Password reset request
│   │   │   └── reset-password/
│   │   │       └── page.tsx    # Password reset form
│   │   ├── (dashboard)/        # Dashboard route group (with nav)
│   │   │   ├── layout.tsx      # Dashboard layout
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx    # Trip list
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx           # Trip detail
│   │   │   │   │   ├── edit/page.tsx      # Edit trip
│   │   │   │   │   ├── events/page.tsx    # Events list
│   │   │   │   │   ├── budget/page.tsx    # Budget page
│   │   │   │   │   ├── collaborators/page.tsx
│   │   │   │   │   └── messages/page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx # Create trip
│   │   │   ├── profile/
│   │   │   │   └── page.tsx    # User profile
│   │   │   ├── settings/
│   │   │   │   └── page.tsx    # User settings
│   │   │   └── clients/        # CRM (travel agents)
│   │   │       └── page.tsx
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   ├── refresh/route.ts
│   │   │   │   ├── verify-email/route.ts
│   │   │   │   └── password-reset/
│   │   │   │       ├── request/route.ts
│   │   │   │       └── confirm/route.ts
│   │   │   ├── users/
│   │   │   │   ├── me/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── trips/
│   │   │   │   ├── route.ts    # List/create trips
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts           # Get/update/delete trip
│   │   │   │       ├── duplicate/route.ts
│   │   │   │       ├── archive/route.ts
│   │   │   │       ├── events/route.ts
│   │   │   │       ├── collaborators/route.ts
│   │   │   │       ├── messages/route.ts
│   │   │   │       ├── budget/route.ts
│   │   │   │       └── expenses/route.ts
│   │   │   ├── search/
│   │   │   │   ├── destinations/route.ts
│   │   │   │   └── pois/route.ts
│   │   │   ├── crm/
│   │   │   │   └── clients/route.ts
│   │   │   ├── invoices/route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/route.ts
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── not-found.tsx       # 404 page
│   │   └── error.tsx           # Error boundary
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (30+ components)
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   ├── trips/
│   │   │   ├── TripCard.tsx
│   │   │   ├── TripList.tsx
│   │   │   ├── TripForm.tsx
│   │   │   └── TripFilters.tsx
│   │   ├── events/
│   │   │   ├── EventList.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── DragDropCalendar.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── providers/
│   │       ├── QueryProvider.tsx
│   │       └── ThemeProvider.tsx
│   ├── lib/                   # Business logic & utilities
│   │   ├── auth/
│   │   │   ├── session.ts     # Session management
│   │   │   ├── jwt.ts         # JWT utilities
│   │   │   ├── password.ts    # Password hashing
│   │   │   └── middleware.ts  # Auth middleware
│   │   ├── db/
│   │   │   ├── index.ts       # Prisma client singleton
│   │   │   └── seed.ts        # Database seeding
│   │   ├── validations/
│   │   │   ├── auth.ts        # Auth schemas
│   │   │   ├── trip.ts        # Trip schemas
│   │   │   ├── event.ts       # Event schemas
│   │   │   └── user.ts        # User schemas
│   │   ├── email/
│   │   │   ├── templates/     # Email templates
│   │   │   └── send.ts        # Email sending
│   │   ├── storage/
│   │   │   └── upload.ts      # File upload utilities
│   │   └── utils/
│   │       ├── api.ts         # API helpers
│   │       ├── date.ts        # Date utilities
│   │       └── format.ts      # Formatting helpers
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTrips.ts
│   │   ├── useEvents.ts
│   │   └── useDebounce.ts
│   ├── types/                 # TypeScript types
│   │   ├── api.ts             # API types
│   │   ├── db.ts              # Database types (Prisma)
│   │   └── global.d.ts        # Global type declarations
│   ├── middleware.ts          # Next.js middleware
│   └── styles/
│       └── globals.css        # Global styles + Tailwind
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   └── components/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── trips.spec.ts
│       └── collaboration.spec.ts
├── .env.local.example         # Environment variables template
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## Design Decisions

### Decision 1: Modular Monolith vs Microservices

**Choice**: Modular Monolith

**Rationale**:
- **Simpler Operations**: Single deployment, one codebase, easier debugging
- **Faster Development**: No network latency between services, shared types
- **Sufficient Scale**: Can handle 100K-1M users with proper optimization
- **Lower Costs**: One database, one server, simpler infrastructure
- **Future Flexibility**: Clear module boundaries allow extraction to microservices later if needed

**Trade-offs**:
- ❌ Cannot scale individual features independently
- ❌ Tighter coupling than microservices
- ❌ Single point of failure
- ✅ Much simpler for team of <5 developers
- ✅ Faster time to market

### Decision 2: Next.js App Router vs Pages Router

**Choice**: App Router (Next.js 14)

**Rationale**:
- **React Server Components**: Better performance, less JavaScript shipped to client
- **Streaming & Suspense**: Improved loading states and UX
- **Layouts**: Better code reuse and organization
- **Server Actions**: Simpler mutations without API routes
- **Future-Proof**: This is the future of Next.js

**Trade-offs**:
- ❌ Newer API (fewer Stack Overflow answers)
- ❌ Some libraries not fully compatible yet
- ✅ Better performance out of the box
- ✅ Simpler data fetching patterns

### Decision 3: NextAuth.js vs Custom JWT

**Choice**: NextAuth.js

**Rationale**:
- **OAuth Support**: Easy to add Google, GitHub login later
- **Session Management**: Built-in session handling
- **Prisma Adapter**: Perfect integration with our database
- **Security**: Battle-tested authentication library
- **Flexibility**: Supports both credentials and OAuth

**Trade-offs**:
- ❌ Additional dependency
- ❌ Learning curve
- ✅ Saves weeks of development time
- ✅ Production-ready security

### Decision 4: PostgreSQL vs MongoDB

**Choice**: PostgreSQL (from database-designer)

**Rationale**:
- **Relationships**: Strong relationships between trips, events, users
- **ACID Transactions**: Needed for financial operations (expenses, invoices)
- **Data Integrity**: Foreign keys, constraints enforce correctness
- **Full-Text Search**: Built-in search capabilities
- **Prisma Support**: Excellent ORM integration

**Trade-offs**:
- ❌ Less flexible schema changes
- ❌ Vertical scaling limits
- ✅ Data integrity guaranteed
- ✅ Better for relational data

### Decision 5: Vercel vs Self-Hosted

**Choice**: Vercel

**Rationale**:
- **Zero Config**: Deploy Next.js with git push
- **Edge Network**: Global CDN automatically
- **Preview Deployments**: Every PR gets a URL
- **Analytics**: Built-in web vitals tracking
- **Free Tier**: Generous for MVP stage

**Trade-offs**:
- ❌ Vendor lock-in risk
- ❌ Costs scale with usage
- ✅ Extremely fast deployment
- ✅ No DevOps overhead

### Decision 6: TanStack Query vs SWR

**Choice**: TanStack Query (React Query)

**Rationale**:
- **Feature-Rich**: Pagination, infinite queries, prefetching
- **DevTools**: Excellent debugging experience
- **Type Safety**: Better TypeScript support
- **Mutation Support**: Optimistic updates, rollback
- **Community**: Larger ecosystem

**Trade-offs**:
- ❌ Larger bundle size than SWR
- ✅ More features out of the box
- ✅ Better for complex data fetching

---

## Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                  REGISTRATION FLOW                        │
└──────────────────────────────────────────────────────────┘

1. User fills registration form
   ↓
2. POST /api/auth/register
   - Validate input (Zod)
   - Check if email exists
   - Hash password (bcrypt, 10 rounds)
   - Create user in database
   - Create verification token
   - Send verification email
   - Return session token
   ↓
3. User clicks email verification link
   ↓
4. GET /api/auth/verify-email?token=xxx
   - Verify token
   - Mark email as verified
   - Redirect to dashboard

┌──────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                             │
└──────────────────────────────────────────────────────────┘

1. User submits login form
   ↓
2. POST /api/auth/login
   - Validate input
   - Find user by email
   - Compare password (bcrypt.compare)
   - Generate session token (NextAuth)
   - Set HTTP-only cookie
   - Return user + token
   ↓
3. Client stores session
   - Cookie: __Secure-next-auth.session-token
   - HTTP-only, Secure, SameSite=Lax

┌──────────────────────────────────────────────────────────┐
│                PROTECTED REQUEST FLOW                     │
└──────────────────────────────────────────────────────────┘

1. Client makes request with cookie
   ↓
2. Next.js middleware (middleware.ts)
   - Extract session token
   - Verify session with NextAuth
   - Check token expiration
   - Attach user to request
   ↓
3. API route handler
   - Access user from request
   - Check permissions (if needed)
   - Process request
   - Return response

┌──────────────────────────────────────────────────────────┐
│              PASSWORD RESET FLOW                          │
└──────────────────────────────────────────────────────────┘

1. POST /api/auth/password-reset/request { email }
   - Find user
   - Generate reset token (UUID)
   - Store token with expiry (1 hour)
   - Send reset email
   ↓
2. User clicks reset link
   ↓
3. POST /api/auth/password-reset/confirm { token, newPassword }
   - Verify token exists and not expired
   - Hash new password
   - Update user password
   - Invalidate reset token
   - Invalidate all sessions (force re-login)
```

### Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Passwords** | Hashing | bcrypt with 10 rounds |
| **Sessions** | Secure Storage | HTTP-only, Secure, SameSite cookies |
| **CSRF** | Token Validation | NextAuth built-in CSRF protection |
| **XSS** | Output Escaping | React automatic escaping |
| **SQL Injection** | Parameterized Queries | Prisma ORM |
| **Rate Limiting** | Request Throttling | Middleware-based (5 req/min for auth) |
| **Input Validation** | Schema Validation | Zod on client AND server |
| **File Upload** | Type & Size Limits | Max 10MB, whitelist image types |
| **Headers** | Security Headers | Helmet.js middleware |
| **HTTPS** | Encrypted Transport | Vercel automatic HTTPS |
| **Secrets** | Environment Variables | .env.local, never committed |

### Authorization Model

```typescript
// Permission levels for trip collaboration
enum CollaboratorRole {
  VIEWER = 'VIEWER',   // Read-only
  EDITOR = 'EDITOR',   // Read + Write
  ADMIN = 'ADMIN'      // Read + Write + Delete + Manage users
}

// Check permissions middleware
async function requireTripAccess(
  userId: string,
  tripId: string,
  minRole: CollaboratorRole = CollaboratorRole.VIEWER
) {
  // Check if user is trip owner
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { collaborators: true }
  });

  if (trip.createdBy === userId) return true; // Owner has all permissions

  // Check collaborator role
  const collaborator = trip.collaborators.find(c => c.userId === userId);
  if (!collaborator) throw new UnauthorizedError();

  const roleHierarchy = {
    [CollaboratorRole.VIEWER]: 1,
    [CollaboratorRole.EDITOR]: 2,
    [CollaboratorRole.ADMIN]: 3
  };

  if (roleHierarchy[collaborator.role] < roleHierarchy[minRole]) {
    throw new ForbiddenError();
  }

  return true;
}
```

---

## Performance Strategy

### Frontend Performance

**Code Splitting**:
- Automatic route-based splitting (Next.js App Router)
- Dynamic imports for heavy components (calendar, maps)
- Lazy load images below fold

**Image Optimization**:
```tsx
// Use Next.js Image component
<Image
  src="/trip-photo.jpg"
  alt="Trip photo"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

**Font Optimization**:
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

**React Server Components**:
- Fetch data on server
- Reduce client-side JavaScript
- Stream data to client

**Client-Side Caching**:
```tsx
// TanStack Query caching
const { data: trips } = useQuery({
  queryKey: ['trips', filters],
  queryFn: () => fetchTrips(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
});
```

### Backend Performance

**Database Query Optimization**:
```typescript
// ❌ Bad: N+1 query problem
const trips = await prisma.trip.findMany();
for (const trip of trips) {
  trip.events = await prisma.event.findMany({ where: { tripId: trip.id } });
}

// ✅ Good: Use include
const trips = await prisma.trip.findMany({
  include: { events: true }
});

// ✅ Better: Select only needed fields
const trips = await prisma.trip.findMany({
  select: {
    id: true,
    title: true,
    destination: true,
    events: {
      select: { id: true, title: true, startDate: true }
    }
  }
});
```

**Connection Pooling**:
```typescript
// lib/db/index.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**API Response Caching**:
```typescript
// Cache static data
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const destinations = await prisma.destination.findMany();
  return NextResponse.json(destinations);
}
```

### Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Lighthouse Performance** | >90 | TBD | 🔵 Pending |
| **First Contentful Paint** | <1.8s | TBD | 🔵 Pending |
| **Largest Contentful Paint** | <2.5s | TBD | 🔵 Pending |
| **Time to Interactive** | <3.8s | TBD | 🔵 Pending |
| **Cumulative Layout Shift** | <0.1 | TBD | 🔵 Pending |
| **Total Blocking Time** | <200ms | TBD | 🔵 Pending |
| **API Response Time (p95)** | <500ms | TBD | 🔵 Pending |
| **Database Query Time (p95)** | <100ms | TBD | 🔵 Pending |

---

## Scalability Plan

### Current Capacity (Phase 1-2)

- **Concurrent Users**: 1,000
- **Daily Active Users**: 10,000
- **Requests/Day**: 500K
- **Database Size**: 10GB
- **File Storage**: 100GB

### Scaling Triggers & Actions

**Trigger 1: Database Slow Queries**
- **Indicator**: p95 query time >200ms
- **Actions**:
  1. Add missing indexes
  2. Optimize N+1 queries
  3. Add database read replicas
  4. Enable query result caching (Redis)

**Trigger 2: High API Latency**
- **Indicator**: p95 API response time >1s
- **Actions**:
  1. Profile slow endpoints
  2. Add response caching
  3. Optimize database queries
  4. Consider CDN caching for GET requests

**Trigger 3: High Traffic**
- **Indicator**: >50K concurrent users
- **Actions**:
  1. Scale Vercel serverless functions automatically (handled)
  2. Upgrade Railway database tier
  3. Add Redis for session storage
  4. Implement CDN caching strategy

**Trigger 4: Database Storage Limit**
- **Indicator**: >80% of storage used
- **Actions**:
  1. Implement data archiving
  2. Compress old attachments
  3. Upgrade database plan
  4. Consider database sharding

### Future Architecture (1M+ users)

```
┌─────────────┐
│   CDN       │
│  (CloudFlare)│
└──────┬──────┘
       │
       ▼
┌──────────────┐
│  Load Balancer│
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌────────┐ ┌────────┐
│ App 1  │ │ App 2  │  (Horizontal scaling)
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌─────────┐ ┌──────────┐
│PostgreSQL│ │  Redis   │
│ Primary  │ │  Cache   │
└────┬────┘ └──────────┘
     │
     ▼
┌─────────┐
│PostgreSQL│
│ Read     │
│ Replicas │
└─────────┘
```

---

## Deployment Strategy

### Environments

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| **Development** | localhost:3000 | Local PostgreSQL | Local development |
| **Staging** | staging.wanderplan.com | Railway (staging) | QA testing |
| **Production** | wanderplan.com | Railway (production) | Live users |

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run build
```

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing
- [ ] Code review approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Performance benchmarks met

**Deployment**:
- [ ] Run database migrations
- [ ] Deploy application
- [ ] Verify deployment health
- [ ] Run smoke tests
- [ ] Check error rates
- [ ] Monitor performance metrics

**Post-Deployment**:
- [ ] Announce deployment in team channel
- [ ] Monitor error tracking (Sentry)
- [ ] Check logs for issues
- [ ] Verify key features working
- [ ] Have rollback plan ready

### Rollback Strategy

**Immediate Rollback** (< 5 minutes):
```bash
# Vercel keeps last 10 deployments
vercel rollback [deployment-url]
```

**Database Rollback**:
```bash
# Run reverse migration
npx prisma migrate down
```

**Feature Flags**:
```typescript
// Disable feature without redeployment
const features = {
  newEventTypes: process.env.FEATURE_NEW_EVENT_TYPES === 'true',
  realTimeChat: process.env.FEATURE_REAL_TIME_CHAT === 'true'
};
```

---

## Monitoring & Observability

### Metrics to Track

**Application Health**:
- Request rate (requests/minute)
- Error rate (%)
- Response time (p50, p95, p99)
- Active sessions

**Business Metrics**:
- User registrations/day
- Trips created/day
- Events created/day
- Collaboration invites sent

**Infrastructure**:
- Database connections
- Database query time
- API function execution time
- Memory usage
- CPU usage

### Monitoring Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| **Vercel Analytics** | Web vitals, performance | Built-in |
| **Sentry** | Error tracking, performance | SDK integration |
| **Vercel Logs** | Application logs | Built-in |
| **Railway Metrics** | Database metrics | Dashboard |
| **Uptime Robot** | Uptime monitoring | External |

### Alerting Rules

**Critical** (Page immediately):
- 🔴 Error rate >5% for 5 minutes
- 🔴 API response time p95 >3s for 5 minutes
- 🔴 Database down
- 🔴 Application down

**Warning** (Notify in Slack):
- 🟡 Error rate >1% for 10 minutes
- 🟡 API response time p95 >1s for 10 minutes
- 🟡 Database connections >80%
- 🟡 Failed login attempts spike

**Info** (Log only):
- 🟢 Deployment completed
- 🟢 High traffic (good problem)
- 🟢 New user registration

---

## Testing Strategy

### Test Pyramid

```
           /\
          /  \    E2E Tests (5%)
         /────\   - Critical user flows
        /      \  - Cross-browser
       /────────\ - Playwright
      /          \
     / Integration\ (15%)
    /──────────────\ - API endpoints
   /                \ - Database operations
  /    Unit Tests    \ (80%)
 /──────────────────────\ - Business logic
/                        \ - Utilities
```

### Testing Standards

**Unit Tests** (lib/, components/):
```typescript
// tests/unit/lib/auth/password.test.ts
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Utilities', () => {
  it('should hash password', async () => {
    const password = 'SecureP@ssw0rd';
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(hashed).toHaveLength(60); // bcrypt hash length
  });

  it('should verify correct password', async () => {
    const password = 'SecureP@ssw0rd';
    const hashed = await hashPassword(password);

    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });
});
```

**Integration Tests** (API routes):
```typescript
// tests/integration/api/trips.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/trips/route';

describe('/api/trips', () => {
  it('should return user trips', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer valid-token' }
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('trips');
    expect(Array.isArray(data.trips)).toBe(true);
  });
});
```

**E2E Tests** (User flows):
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  // Register
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecureP@ssw0rd');
  await page.fill('[name="name"]', 'Test User');
  await page.click('button[type="submit"]');

  // Should redirect to dashboard
  await expect(page).toHaveURL('/trips');

  // Logout
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout"]');

  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecureP@ssw0rd');
  await page.click('button[type="submit"]');

  // Should redirect to dashboard
  await expect(page).toHaveURL('/trips');
});
```

### Coverage Requirements

- **Overall**: >75%
- **Critical paths**: >90% (auth, payments, data mutations)
- **Business logic**: >85%
- **UI components**: >70%
- **Utilities**: >90%

### Continuous Testing

```json
// package.json scripts
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

---

## Code Quality Standards

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint Rules

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "max-lines": ["warn", { "max": 300 }],
    "max-lines-per-function": ["warn", { "max": 50 }],
    "complexity": ["warn", 10]
  }
}
```

### Code Review Checklist

- [ ] TypeScript strict mode (no `any`)
- [ ] All functions have JSDoc comments
- [ ] Tests written and passing
- [ ] No console.log (use proper logging)
- [ ] Error handling implemented
- [ ] Input validation on API routes
- [ ] Accessibility attributes on UI
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Security considerations addressed

---

## Phase 0 Validation Results

### ✅ API ↔ Database Alignment

| Check | Status | Notes |
|-------|--------|-------|
| All API models have DB tables | ✅ Pass | 28 models matched |
| Field names consistent | ✅ Pass | camelCase in both |
| Data types compatible | ✅ Pass | String→VARCHAR, Number→INT, etc. |
| Relationships defined | ✅ Pass | Foreign keys match API structure |
| Enums aligned | ✅ Pass | 13 enums in both specs |

### ✅ Features ↔ API Alignment

| Check | Status | Notes |
|-------|--------|-------|
| All features have endpoints | ✅ Pass | 38 features → 85 endpoints |
| Auth endpoints exist | ✅ Pass | Register, login, reset, verify |
| CRUD complete for entities | ✅ Pass | Trips, events, expenses, etc. |
| File upload endpoints | ✅ Pass | Cover images, documents |
| Search endpoints | ✅ Pass | Destinations, POIs |

### ✅ Features ↔ Database Alignment

| Check | Status | Notes |
|-------|--------|-------|
| All data needs have storage | ✅ Pass | 28 tables cover all features |
| Relationships support features | ✅ Pass | Collaborators, expenses, etc. |
| Indexes for feature queries | ✅ Pass | 50+ indexes defined |
| Soft delete support | ✅ Pass | isArchived for trips |

**Conclusion**: ✅ No critical mismatches found. Phase 0 is consistent and ready for implementation.

---

## Success Metrics

### Phase 0 Success Criteria ✅

- ✅ Product specification complete (38 features approved)
- ✅ API specification complete (85 endpoints)
- ✅ Database schema complete (28 models)
- ✅ Architecture design complete
- ✅ Implementation plan created
- ✅ All outputs validated for consistency
- ✅ Technology stack defined with rationale
- ✅ Quality standards defined

### Project Success Criteria (Target)

**Technical**:
- [ ] All 38 features implemented
- [ ] Test coverage >80%
- [ ] Lighthouse performance >90
- [ ] WCAG 2.1 AA compliant
- [ ] Zero critical security issues
- [ ] API response time p95 <500ms
- [ ] Uptime >99.9%

**Business**:
- [ ] 1,000+ registered users
- [ ] 5,000+ trips created
- [ ] <1% error rate
- [ ] Positive user feedback
- [ ] Revenue goals met (if applicable)

---

## Next Steps

### ✅ Phase 0 Complete - Ready for Implementation!

**Completed Deliverables**:
1. Product specification (38 features)
2. API contracts (85 endpoints)
3. Database schema (28 models)
4. System architecture (this document)
5. Implementation plan (see implementation-tasks.md)

**Next Phase**: Foundation & Authentication

**First Task**: task-1-project-setup (Next.js initialization)

**To Begin Implementation**:
```bash
# Option 1: Manual orchestration
/orchestrate

# Option 2: Auto-complete phase
/auto-phase

# Option 3: Review tasks first
cat .claude/specs/implementation-tasks.md
```

---

**Architecture Review**: ✅ APPROVED
**Reviewed By**: System Architect
**Date**: 2025-11-08
**Status**: Ready for Phase 1 Implementation

**Total Planning Duration**: ~1 hour
**Estimated Implementation**: 12-16 weeks
**Team Size**: 1-3 developers

🚀 **Let's build WanderPlan!**
