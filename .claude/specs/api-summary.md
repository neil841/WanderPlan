# API Design Summary - WanderPlan

> Created by API Contract Designer on 2025-11-08

## Overview

This document summarizes the API design for WanderPlan, a comprehensive travel planning web application.

**Total Endpoints**: 85
- **Public Endpoints**: 8 (registration, login, password reset, email verification, search, destination guides)
- **Protected Endpoints**: 77 (require JWT authentication)

---

## Endpoint Categories

### 🔐 Authentication & User Management (13 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user account | No |
| POST | `/api/v1/auth/login` | User login with credentials | No |
| POST | `/api/v1/auth/logout` | Logout current session | Yes |
| POST | `/api/v1/auth/refresh` | Refresh access token | Yes |
| POST | `/api/v1/auth/password-reset/request` | Request password reset | No |
| POST | `/api/v1/auth/password-reset/verify` | Verify reset token | No |
| POST | `/api/v1/auth/password-reset/confirm` | Set new password | No |
| POST | `/api/v1/auth/email-verification/send` | Send verification email | Yes |
| GET | `/api/v1/auth/email-verification/verify` | Verify email with token | No |
| GET | `/api/v1/users/me` | Get current user profile | Yes |
| PATCH | `/api/v1/users/me` | Update user profile | Yes |
| GET | `/api/v1/users/me/settings` | Get user settings | Yes |
| PATCH | `/api/v1/users/me/settings` | Update settings & preferences | Yes |
| POST | `/api/v1/users/me/avatar` | Upload profile picture | Yes |
| DELETE | `/api/v1/users/me/avatar` | Remove profile picture | Yes |
| PATCH | `/api/v1/users/me/password` | Change password | Yes |
| PATCH | `/api/v1/users/me/email` | Change email address | Yes |
| DELETE | `/api/v1/users/me` | Delete user account | Yes |

### 🗺️ Trip Management (12 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/trips` | List trips with filters/pagination | Yes |
| POST | `/api/v1/trips` | Create new trip | Yes |
| GET | `/api/v1/trips/{tripId}` | Get trip details | Yes |
| PATCH | `/api/v1/trips/{tripId}` | Update trip | Yes |
| DELETE | `/api/v1/trips/{tripId}` | Delete trip | Yes |
| POST | `/api/v1/trips/{tripId}/duplicate` | Duplicate existing trip | Yes |
| PATCH | `/api/v1/trips/{tripId}/archive` | Archive trip | Yes |
| PATCH | `/api/v1/trips/{tripId}/unarchive` | Unarchive trip | Yes |
| POST | `/api/v1/trips/{tripId}/cover-image` | Upload cover image | Yes |
| DELETE | `/api/v1/trips/{tripId}/cover-image` | Remove cover image | Yes |
| POST | `/api/v1/trips/bulk/delete` | Bulk delete trips | Yes |
| POST | `/api/v1/trips/bulk/archive` | Bulk archive trips | Yes |

### 📅 Itinerary/Event Management (8 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/trips/{tripId}/events` | List all events in trip | Yes |
| POST | `/api/v1/trips/{tripId}/events` | Create new event | Yes |
| GET | `/api/v1/trips/{tripId}/events/{eventId}` | Get event details | Yes |
| PATCH | `/api/v1/trips/{tripId}/events/{eventId}` | Update event | Yes |
| DELETE | `/api/v1/trips/{tripId}/events/{eventId}` | Delete event | Yes |
| POST | `/api/v1/trips/{tripId}/events/reorder` | Reorder events (drag-drop) | Yes |
| POST | `/api/v1/trips/{tripId}/events/bulk/delete` | Bulk delete events | Yes |
| POST | `/api/v1/trips/{tripId}/events/bulk/move` | Bulk move events to day | Yes |

**Supported Event Types**: `flight`, `hotel`, `activity`, `restaurant`, `transportation`, `destination`

### 👥 Collaboration (8 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/trips/{tripId}/collaborators` | List all collaborators | Yes |
| POST | `/api/v1/trips/{tripId}/collaborators` | Invite collaborator | Yes |
| PATCH | `/api/v1/trips/{tripId}/collaborators/{userId}` | Update permissions | Yes |
| DELETE | `/api/v1/trips/{tripId}/collaborators/{userId}` | Remove collaborator | Yes |
| POST | `/api/v1/trips/{tripId}/guest-access` | Generate guest token | Yes |
| DELETE | `/api/v1/trips/{tripId}/guest-access` | Revoke guest access | Yes |
| GET | `/api/v1/trips/{tripId}/activity-feed` | Get activity timeline | Yes |
| POST | `/api/v1/trips/{tripId}/share` | Share trip via email | Yes |

**Permission Levels**: `viewer` (read-only), `editor` (can edit), `admin` (can delete, manage users)

### 💬 Messaging & Ideas (10 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/trips/{tripId}/messages` | List messages | Yes |
| POST | `/api/v1/trips/{tripId}/messages` | Send message | Yes |
| PATCH | `/api/v1/trips/{tripId}/messages/{messageId}` | Edit message | Yes |
| DELETE | `/api/v1/trips/{tripId}/messages/{messageId}` | Delete message | Yes |
| GET | `/api/v1/trips/{tripId}/ideas` | List ideas/suggestions | Yes |
| POST | `/api/v1/trips/{tripId}/ideas` | Create idea | Yes |
| PATCH | `/api/v1/trips/{tripId}/ideas/{ideaId}` | Update idea | Yes |
| DELETE | `/api/v1/trips/{tripId}/ideas/{ideaId}` | Delete idea | Yes |
| POST | `/api/v1/trips/{tripId}/ideas/{ideaId}/vote` | Vote on idea | Yes |
| GET | `/api/v1/trips/{tripId}/polls` | List polls | Yes |
| POST | `/api/v1/trips/{tripId}/polls` | Create poll | Yes |
| PATCH | `/api/v1/trips/{tripId}/polls/{pollId}` | Update poll | Yes |
| DELETE | `/api/v1/trips/{tripId}/polls/{pollId}` | Delete poll | Yes |
| POST | `/api/v1/trips/{tripId}/polls/{pollId}/vote` | Vote in poll | Yes |

### 💰 Financial Management (8 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/trips/{tripId}/budget` | Get budget overview | Yes |
| PATCH | `/api/v1/trips/{tripId}/budget` | Update budget | Yes |
| GET | `/api/v1/trips/{tripId}/expenses` | List all expenses | Yes |
| POST | `/api/v1/trips/{tripId}/expenses` | Create expense | Yes |
| GET | `/api/v1/trips/{tripId}/expenses/{expenseId}` | Get expense details | Yes |
| PATCH | `/api/v1/trips/{tripId}/expenses/{expenseId}` | Update expense | Yes |
| DELETE | `/api/v1/trips/{tripId}/expenses/{expenseId}` | Delete expense | Yes |
| GET | `/api/v1/trips/{tripId}/expenses/settlements` | Calculate settlements | Yes |
| GET | `/api/v1/trips/{tripId}/expenses/per-person` | Per-person breakdown | Yes |

**Budget Categories**: `accommodation`, `transportation`, `food`, `activities`, `shopping`, `other`

### 📄 Documents (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/trips/{tripId}/documents` | List documents | Yes |
| POST | `/api/v1/trips/{tripId}/documents` | Upload document | Yes |
| GET | `/api/v1/trips/{tripId}/documents/{documentId}` | Download document | Yes |
| DELETE | `/api/v1/trips/{tripId}/documents/{documentId}` | Delete document | Yes |

### 📤 Export & Integration (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/trips/{tripId}/export/pdf` | Generate PDF export | Yes |
| GET | `/api/v1/trips/{tripId}/export/calendar` | Export to calendar format | Yes |
| POST | `/api/v1/trips/{tripId}/calendar-sync` | Sync with Google/Outlook | Yes |

### 🔍 Discovery & Search (4 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/search/destinations` | Search destinations | No |
| GET | `/api/v1/search/pois` | Search POIs | No |
| GET | `/api/v1/destinations/{destinationId}/guide` | Get destination guide | No |
| GET | `/api/v1/weather` | Get weather forecast | No |

### 🗺️ Maps (1 endpoint)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/trips/{tripId}/route` | Get route visualization | Yes |

### 💼 Professional/CRM Features (14 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/crm/clients` | List clients | Yes |
| POST | `/api/v1/crm/clients` | Create client | Yes |
| GET | `/api/v1/crm/clients/{clientId}` | Get client details | Yes |
| PATCH | `/api/v1/crm/clients/{clientId}` | Update client | Yes |
| DELETE | `/api/v1/crm/clients/{clientId}` | Delete client | Yes |
| GET | `/api/v1/proposals` | List proposals | Yes |
| POST | `/api/v1/proposals` | Create proposal | Yes |
| GET | `/api/v1/proposals/{proposalId}` | Get proposal details | Yes |
| PATCH | `/api/v1/proposals/{proposalId}` | Update proposal | Yes |
| DELETE | `/api/v1/proposals/{proposalId}` | Delete proposal | Yes |
| POST | `/api/v1/proposals/{proposalId}/send` | Send to client | Yes |
| GET | `/api/v1/invoices` | List invoices | Yes |
| POST | `/api/v1/invoices` | Create invoice | Yes |
| GET | `/api/v1/invoices/{invoiceId}` | Get invoice details | Yes |
| PATCH | `/api/v1/invoices/{invoiceId}` | Update invoice | Yes |
| DELETE | `/api/v1/invoices/{invoiceId}` | Delete invoice | Yes |
| POST | `/api/v1/invoices/{invoiceId}/send` | Send to client | Yes |
| POST | `/api/v1/payments/create-intent` | Create payment (Stripe) | Yes |
| GET | `/api/v1/landing-pages` | List landing pages | Yes |
| POST | `/api/v1/landing-pages` | Create landing page | Yes |
| PATCH | `/api/v1/landing-pages/{pageId}` | Update landing page | Yes |
| DELETE | `/api/v1/landing-pages/{pageId}` | Delete landing page | Yes |
| GET | `/api/v1/leads` | List leads | Yes |
| POST | `/api/v1/leads` | Capture lead | No |

---

## Authentication Flow

### 1. Registration & Email Verification
```
User → POST /auth/register
     ← 201 Created (user + unverified status)
     ← Verification email sent

User → GET /auth/email-verification/verify?token=xxx
     ← 200 OK (email verified)
```

### 2. Login & Token Refresh
```
User → POST /auth/login { email, password }
     ← 200 OK { accessToken, refreshToken, user }

// Token expires after 24 hours

User → POST /auth/refresh { refreshToken }
     ← 200 OK { accessToken }
```

### 3. Password Reset Flow
```
User → POST /auth/password-reset/request { email }
     ← 200 OK (reset email sent)

User → POST /auth/password-reset/verify { token }
     ← 200 OK (token valid)

User → POST /auth/password-reset/confirm { token, newPassword }
     ← 200 OK (password updated)
```

### 4. Protected Endpoint Access
```
User → GET /trips
     ← 401 Unauthorized (no token)

User → GET /trips
       Headers: { Authorization: "Bearer <accessToken>" }
     ← 200 OK { trips: [...], pagination: {...} }
```

---

## Data Models

### User
```typescript
{
  id: string (UUID)
  email: string (unique)
  name: string
  emailVerified: boolean
  profilePicture?: string (URL)
  timezone: string (e.g., "America/New_York")
  locale: string (e.g., "en-US")
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
}
```

### Trip
```typescript
{
  id: string (UUID)
  title: string
  description?: string
  startDate?: string (YYYY-MM-DD)
  endDate?: string (YYYY-MM-DD)
  destination: string
  coverImage?: string (URL)
  isArchived: boolean
  tags: string[]
  budget?: {
    total: number
    currency: string (ISO 4217)
    categories: { category: string, amount: number }[]
  }
  collaborators: { userId: string, role: 'viewer' | 'editor' | 'admin' }[]
  createdBy: string (userId)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
}
```

### Event
```typescript
{
  id: string (UUID)
  tripId: string
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transportation' | 'destination'
  title: string
  description?: string
  startDate?: string (ISO 8601 datetime)
  endDate?: string (ISO 8601 datetime)
  location?: {
    name: string
    address?: string
    coordinates?: { lat: number, lon: number }
  }
  cost?: { amount: number, currency: string }
  notes?: string
  order: number (for sorting)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
}
```

### Expense
```typescript
{
  id: string (UUID)
  tripId: string
  category: 'accommodation' | 'transportation' | 'food' | 'activities' | 'shopping' | 'other'
  description: string
  amount: number
  currency: string (ISO 4217)
  paidBy: string (userId)
  splitWith: string[] (userIds)
  date: string (YYYY-MM-DD)
  createdAt: string (ISO 8601)
}
```

### Message
```typescript
{
  id: string (UUID)
  tripId: string
  userId: string
  content: string
  createdAt: string (ISO 8601)
  updatedAt?: string (ISO 8601)
}
```

### Idea
```typescript
{
  id: string (UUID)
  tripId: string
  userId: string
  title: string
  description: string
  votes: { userId: string, vote: 'up' | 'down' }[]
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string (ISO 8601)
}
```

### Poll
```typescript
{
  id: string (UUID)
  tripId: string
  userId: string
  question: string
  options: {
    id: string
    text: string
    votes: string[] (userIds)
  }[]
  expiresAt?: string (ISO 8601)
  createdAt: string (ISO 8601)
}
```

### CRM Client
```typescript
{
  id: string (UUID)
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  tags: string[]
  associatedTrips: string[] (tripIds)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
}
```

### Invoice
```typescript
{
  id: string (UUID)
  clientId: string
  tripId?: string
  invoiceNumber: string (e.g., "INV-2025-001")
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issueDate: string (YYYY-MM-DD)
  dueDate: string (YYYY-MM-DD)
  lineItems: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax?: number
  total: number
  currency: string (ISO 4217)
  notes?: string
  createdAt: string (ISO 8601)
}
```

---

## Standard Error Format

All errors follow this consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Not authenticated (missing/invalid token) |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists (e.g., email taken) |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination

All list endpoints support pagination using query parameters:

**Request**:
```
GET /trips?page=1&limit=20
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Defaults**:
- `page`: 1
- `limit`: 20
- `maxLimit`: 100

---

## Filtering & Sorting

### Trip Filtering
```
GET /trips?status=active&tags=europe,beach&search=italy&sortBy=startDate&order=desc
```

**Supported Filters**:
- `status`: `all` | `active` | `archived`
- `tags`: comma-separated tag list
- `search`: search trip title/description/destination
- `startDate`: filter by date range
- `sortBy`: `createdAt` | `updatedAt` | `startDate` | `title`
- `order`: `asc` | `desc`

---

## Rate Limiting

Rate limits vary by authentication status and plan:

| User Type | Requests/Hour | Burst Limit |
|-----------|---------------|-------------|
| Anonymous | 100 | 10/minute |
| Authenticated (Free) | 1000 | 50/minute |
| Authenticated (Pro) | 5000 | 100/minute |

Rate limit headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1699564800 (Unix timestamp)
```

---

## File Uploads

File uploads use `multipart/form-data`:

**Profile Picture**:
```
POST /users/me/avatar
Content-Type: multipart/form-data

file: <image file>
```

**Constraints**:
- Max size: 5MB
- Formats: JPG, PNG, WebP
- Dimensions: Min 200x200, Max 2000x2000

**Cover Images**:
```
POST /trips/{tripId}/cover-image
Content-Type: multipart/form-data

file: <image file>
```

**Constraints**:
- Max size: 10MB
- Formats: JPG, PNG, WebP
- Recommended: 1200x630 (Open Graph)

**Documents**:
```
POST /trips/{tripId}/documents
Content-Type: multipart/form-data

file: <document file>
```

**Constraints**:
- Max size: 25MB
- Formats: PDF, DOCX, JPG, PNG

---

## API Versioning

API is versioned via URL path: `/api/v1/*`

**Breaking changes** will increment the major version (v2, v3, etc.).

**Non-breaking changes** (new fields, new endpoints) will be added to existing version.

**Deprecation policy**: Old versions supported for 12 months after new version release.

---

## Security

### Authentication
- **JWT Bearer Tokens** for all protected endpoints
- **Token Expiry**: Access tokens expire after 24 hours
- **Refresh Tokens**: Long-lived (30 days) for token refresh

### Authorization
- **Permission Levels**: `viewer`, `editor`, `admin` for trip collaboration
- **Resource Ownership**: Users can only access their own resources or shared resources
- **Guest Access**: Time-limited guest tokens for public sharing

### Data Protection
- **HTTPS Only**: All API calls must use HTTPS in production
- **Password Hashing**: bcrypt with salt rounds (never store plain text)
- **Input Validation**: All inputs validated on server-side
- **SQL Injection Protection**: Prisma ORM provides safe query building
- **XSS Protection**: All user content sanitized

---

## Next Steps

1. ✅ **API Contract Complete** - All endpoints defined
2. → **Database Designer** will create matching Prisma schema
3. → **System Architect** will create phased implementation tasks
4. → **Staff Engineer** will implement endpoints
5. → **Generate TypeScript Types** from OpenAPI spec using:
   - `openapi-typescript` package
   - Auto-generate types for frontend

---

## TypeScript Type Generation

Run this command to generate TypeScript types from the OpenAPI spec:

```bash
npx openapi-typescript .claude/specs/api-specs.yaml --output src/types/api.ts
```

This creates type-safe API client code for the frontend:

```typescript
import type { paths } from '@/types/api';

type TripsResponse = paths['/api/v1/trips']['get']['responses']['200']['content']['application/json'];
type CreateTripRequest = paths['/api/v1/trips']['post']['requestBody']['content']['application/json'];
```

---

## Documentation

Full interactive API documentation can be generated using:
- **Swagger UI**: [https://swagger.io/tools/swagger-ui/](https://swagger.io/tools/swagger-ui/)
- **Redoc**: [https://redocly.com/redoc](https://redocly.com/redoc)

Simply point these tools to `.claude/specs/api-specs.yaml` for full documentation.

---

**Full Specification**: `.claude/specs/api-specs.yaml` (OpenAPI 3.0)

This API design provides a complete, production-ready contract for implementing all 38 approved WanderPlan features.
