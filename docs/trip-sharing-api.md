# Trip Sharing API Documentation

## Overview

The Trip Sharing API allows trip owners and admin collaborators to generate shareable links that provide read-only access to trips without requiring authentication. This enables users to share their travel plans with friends, family, or clients.

## Features

- Generate unique share tokens with customizable expiration
- Control access permissions (view-only, comment)
- List all active share tokens for a trip
- Revoke all share tokens at once
- Public access via share tokens (no authentication required)
- Automatic token expiration
- Read-only access to trip data (no sensitive information exposed)

## API Endpoints

### 1. Generate Share Token

**Endpoint:** `POST /api/trips/[tripId]/share`

**Authentication:** Required (trip owner or admin collaborator)

**Request Body:**
```json
{
  "expiresIn": 30,  // Optional: days until expiration (default: 30, max: 365)
  "permissions": "view_only"  // Optional: "view_only" or "comment" (default: "view_only")
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "shareUrl": "https://wanderplan.com/trips/share/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "expiresAt": "2024-07-01T12:00:00.000Z",
    "permissions": "view_only",
    "createdAt": "2024-06-01T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Share token created successfully
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not owner or admin)
- `404` - Trip not found
- `400` - Validation error

**Example Usage:**
```typescript
// Generate a share token that expires in 7 days
const response = await fetch('/api/trips/123/share', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    expiresIn: 7,
    permissions: 'view_only'
  })
});

const { data } = await response.json();
console.log('Share URL:', data.shareUrl);
```

---

### 2. List Active Share Tokens

**Endpoint:** `GET /api/trips/[tripId]/share`

**Authentication:** Required (trip owner or admin collaborator)

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "id": "token-id-123",
        "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "shareUrl": "https://wanderplan.com/trips/share/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "expiresAt": "2024-07-01T12:00:00.000Z",
        "permissions": "view_only",
        "createdBy": {
          "id": "user-123",
          "name": "John Doe",
          "email": "john@example.com",
          "avatarUrl": "https://..."
        },
        "createdAt": "2024-06-01T12:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Trip not found

**Example Usage:**
```typescript
// List all active share tokens
const response = await fetch('/api/trips/123/share', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const { data } = await response.json();
console.log('Active tokens:', data.count);
```

---

### 3. Revoke All Share Tokens

**Endpoint:** `DELETE /api/trips/[tripId]/share`

**Authentication:** Required (trip owner or admin collaborator)

**Response:**
```json
{
  "success": true,
  "message": "All share tokens revoked successfully",
  "data": {
    "revokedCount": 3
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Trip not found

**Example Usage:**
```typescript
// Revoke all share tokens
const response = await fetch('/api/trips/123/share', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const { data } = await response.json();
console.log('Revoked tokens:', data.revokedCount);
```

---

### 4. Public Trip Access

**Endpoint:** `GET /api/trips/share/[token]`

**Authentication:** Not required (public access)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trip-123",
    "name": "Summer Europe Trip",
    "description": "14-day adventure across Europe",
    "startDate": "2024-06-01",
    "endDate": "2024-06-15",
    "destinations": ["Paris", "Amsterdam", "Berlin"],
    "coverImageUrl": "https://...",
    "creator": {
      "id": "user-123",
      "name": "John Doe",
      "avatarUrl": "https://..."
    },
    "events": [
      {
        "id": "event-1",
        "type": "FLIGHT",
        "title": "Flight to Paris",
        "description": "Air France AF123",
        "startDateTime": "2024-06-01T10:00:00.000Z",
        "endDateTime": "2024-06-01T12:30:00.000Z",
        "location": {
          "name": "Charles de Gaulle Airport",
          "address": "Paris, France",
          "lat": 49.0097,
          "lon": 2.5479
        },
        "cost": {
          "amount": "350.00",
          "currency": "USD"
        },
        "notes": "Gate opens 1 hour before departure",
        "confirmationNumber": "ABC123",
        "creator": {
          "id": "user-123",
          "name": "John Doe",
          "avatarUrl": "https://..."
        }
      }
    ],
    "budget": {
      "totalBudget": "5000.00",
      "currency": "USD",
      "categoryBudgets": {
        "accommodation": {
          "budgeted": 1500,
          "spent": 1200,
          "remaining": 300
        }
      }
    },
    "tags": [
      {
        "id": "tag-1",
        "name": "Backpacking",
        "color": "#3B82F6"
      }
    ],
    "stats": {
      "eventCount": 15,
      "tagCount": 3,
      "duration": 14
    },
    "shareInfo": {
      "permissions": "view_only",
      "expiresAt": "2024-07-01T12:00:00.000Z",
      "isReadOnly": true
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Invalid token or trip not found
- `410` - Token expired or revoked

**Example Usage:**
```typescript
// Access trip via share token (no authentication)
const response = await fetch('/api/trips/share/a1b2c3d4-e5f6-7890-abcd-ef1234567890');
const { data } = await response.json();
console.log('Trip name:', data.name);
console.log('Events:', data.events.length);
```

---

## Database Schema

```prisma
model TripShareToken {
  id          String    @id @default(uuid())
  tripId      String    @map("trip_id")
  token       String    @unique @default(uuid())
  expiresAt   DateTime  @map("expires_at")
  permissions String    @default("view_only") // view_only, comment
  isActive    Boolean   @default(true) @map("is_active")
  createdBy   String    @map("created_by")
  createdAt   DateTime  @default(now()) @map("created_at")
  revokedAt   DateTime? @map("revoked_at")

  // Relations
  trip        Trip      @relation(fields: [tripId], references: [id], onDelete: Cascade)
  creator     User      @relation(fields: [createdBy], references: [id])

  @@index([tripId])
  @@index([token])
  @@index([expiresAt])
  @@map("trip_share_tokens")
}
```

---

## Security Considerations

### What is NOT exposed in public share links:

1. **User Emails** - Creator and collaborator emails are hidden
2. **Collaborators** - List of trip collaborators is not shown
3. **Documents** - Uploaded documents are not accessible
4. **Detailed Expenses** - Individual expense transactions are hidden
5. **Messages** - Trip chat/messages are not accessible
6. **Edit Permissions** - All shared links are read-only

### What IS exposed:

1. **Trip Metadata** - Name, description, dates, destinations
2. **Events** - Complete itinerary with locations and times
3. **Budget Summary** - Total budget and category breakdowns (no individual expenses)
4. **Tags** - Trip tags for categorization
5. **Creator Name** - Trip creator's name and avatar (no email)

### Token Security:

- Tokens are UUIDs (128-bit random values)
- Tokens automatically expire based on configured duration
- Tokens can be revoked at any time by trip owner/admin
- Expired/revoked tokens return 410 Gone status
- Tokens are indexed for fast lookup
- Cascade delete when trip is deleted

---

## Common Use Cases

### 1. Share Trip with Friends

```typescript
// Generate a 30-day share link
const { data } = await fetch('/api/trips/123/share', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({ expiresIn: 30 })
}).then(r => r.json());

// Share the URL via email, messaging, etc.
sendEmail(friendEmail, `Check out my trip: ${data.shareUrl}`);
```

### 2. Share with Client (Travel Agent)

```typescript
// Generate a 90-day share link for client review
const { data } = await fetch('/api/trips/456/share', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({
    expiresIn: 90,
    permissions: 'view_only'
  })
}).then(r => r.json());

console.log('Client share link:', data.shareUrl);
```

### 3. Revoke All Links After Trip

```typescript
// After trip ends, revoke all share links
await fetch('/api/trips/123/share', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer TOKEN' }
});
```

### 4. Monitor Active Share Links

```typescript
// Check which share links are active
const { data } = await fetch('/api/trips/123/share', {
  headers: { 'Authorization': 'Bearer TOKEN' }
}).then(r => r.json());

console.log(`${data.count} active share links`);
data.tokens.forEach(token => {
  console.log(`Created by ${token.createdBy.name} on ${token.createdAt}`);
  console.log(`Expires: ${token.expiresAt}`);
});
```

---

## Testing

Run the test suite:

```bash
npm test -- src/__tests__/api/trips/share
```

Test coverage includes:
- Token creation with default and custom settings
- Token expiration validation
- Permission checks (owner/admin only)
- Public access with valid tokens
- Handling expired tokens
- Handling revoked tokens
- Listing active tokens
- Revoking all tokens
- Security checks (sensitive data not exposed)

---

## Migration

To apply the database migration:

```bash
npx prisma migrate deploy
```

Or for development:

```bash
npx prisma migrate dev
```

The migration adds the `trip_share_tokens` table with proper indexes and foreign key constraints.

---

## Future Enhancements

Potential features for future iterations:

1. **Individual Token Revocation** - Revoke specific tokens instead of all
2. **Usage Analytics** - Track how many times a share link is accessed
3. **Password Protection** - Optional password for share links
4. **Custom Permissions** - More granular permission controls
5. **Expiration Notifications** - Alert when tokens are about to expire
6. **QR Codes** - Generate QR codes for share links
7. **Embed Support** - Allow embedding trips in other websites

---

## Support

For issues or questions:
- Check the test files for usage examples
- Review the API endpoint implementations
- Consult the Prisma schema for data structure

---

**Last Updated:** 2024-11-12
**Version:** 1.0.0
