# WanderPlan API Documentation

> Complete API reference for WanderPlan v1.0

**Base URL**: `/api`

**Authentication**: Most endpoints require a valid session cookie from NextAuth.js

**Rate Limiting**:
- Anonymous: 60 requests/minute
- Authenticated: 300 requests/minute

---

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Trips](#trips)
- [Events](#events)
- [Collaborators](#collaborators)
- [Messages](#messages)
- [Ideas & Polls](#ideas--polls)
- [Budget & Expenses](#budget--expenses)
- [CRM & Clients](#crm--clients)
- [Proposals & Invoices](#proposals--invoices)
- [Landing Pages](#landing-pages)
- [Destinations & POIs](#destinations--pois)
- [Integrations](#integrations)
- [Error Handling](#error-handling)

---

## Authentication

### Register

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "emailVerified": null
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Errors**:
- `400` - Email already exists
- `400` - Invalid email or password format
- `500` - Server error

---

### Login

Authenticate with credentials.

**Endpoint**: `POST /api/auth/signin` (NextAuth.js)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "callbackUrl": "/trips"
}
```

**Response** (200):
```json
{
  "url": "/trips",
  "ok": true
}
```

Sets session cookie: `next-auth.session-token`

**Errors**:
- `401` - Invalid credentials
- `403` - Email not verified

---

### Password Reset Request

Request a password reset email.

**Endpoint**: `POST /api/auth/password-reset/request`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

---

### Password Reset Confirm

Reset password with token.

**Endpoint**: `POST /api/auth/password-reset/confirm`

**Request Body**:
```json
{
  "token": "reset_token_here",
  "password": "NewP@ssw0rd"
}
```

**Response** (200):
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

**Errors**:
- `400` - Invalid or expired token
- `400` - Weak password

---

### Email Verification

Verify email address.

**Endpoint**: `GET /api/auth/verify-email?token={token}`

**Response** (200):
```json
{
  "message": "Email verified successfully!"
}
```

**Errors**:
- `400` - Invalid or expired token

---

## Users

### Get Current User

Get authenticated user profile.

**Endpoint**: `GET /api/user/me`

**Authentication**: Required

**Response** (200):
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "avatarUrl": "https://...",
  "emailVerified": "2024-11-01T10:00:00Z",
  "createdAt": "2024-11-01T09:00:00Z",
  "notificationSettings": {
    "emailNotifications": true,
    "tripUpdates": true,
    "collaboratorInvites": true
  }
}
```

---

### Update User Profile

Update authenticated user's profile.

**Endpoint**: `PATCH /api/user/me`

**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatarUrl": "https://..."
}
```

**Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "firstName": "Jane",
    "lastName": "Smith",
    "avatarUrl": "https://..."
  }
}
```

---

### Update Notification Settings

Update email notification preferences.

**Endpoint**: `PATCH /api/user/notification-settings`

**Authentication**: Required

**Request Body**:
```json
{
  "emailNotifications": true,
  "tripUpdates": false,
  "collaboratorInvites": true,
  "messageNotifications": true
}
```

**Response** (200):
```json
{
  "settings": {
    "emailNotifications": true,
    "tripUpdates": false,
    "collaboratorInvites": true,
    "messageNotifications": true
  }
}
```

---

## Trips

### List Trips

Get all trips for authenticated user.

**Endpoint**: `GET /api/trips`

**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status (`active`, `archived`)
- `tags` - Filter by tags (comma-separated)
- `search` - Search trip names
- `sortBy` - Sort field (`createdAt`, `updatedAt`, `startDate`)
- `sortOrder` - Sort order (`asc`, `desc`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response** (200):
```json
{
  "trips": [
    {
      "id": "trip_123",
      "title": "Paris Vacation",
      "destination": "Paris, France",
      "startDate": "2024-12-01",
      "endDate": "2024-12-07",
      "coverImage": "https://...",
      "visibility": "PRIVATE",
      "isArchived": false,
      "tags": ["europe", "family"],
      "createdBy": "user_123",
      "createdAt": "2024-11-01T10:00:00Z",
      "updatedAt": "2024-11-02T15:30:00Z",
      "_count": {
        "events": 12,
        "collaborators": 3,
        "expenses": 8
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### Get Trip Details

Get detailed trip information.

**Endpoint**: `GET /api/trips/{tripId}`

**Authentication**: Required

**Response** (200):
```json
{
  "id": "trip_123",
  "title": "Paris Vacation",
  "destination": "Paris, France",
  "description": "A week exploring Paris...",
  "startDate": "2024-12-01",
  "endDate": "2024-12-07",
  "coverImage": "https://...",
  "visibility": "PRIVATE",
  "isArchived": false,
  "tags": ["europe", "family"],
  "createdBy": "user_123",
  "createdAt": "2024-11-01T10:00:00Z",
  "updatedAt": "2024-11-02T15:30:00Z",
  "budget": {
    "total": 3000,
    "currency": "USD",
    "breakdown": {
      "ACCOMMODATION": 1000,
      "TRANSPORTATION": 800,
      "FOOD": 600,
      "ACTIVITIES": 600
    }
  },
  "events": [
    {
      "id": "event_123",
      "type": "FLIGHT",
      "title": "Flight to Paris",
      "startDate": "2024-12-01T10:00:00Z",
      "endDate": "2024-12-01T14:00:00Z",
      "location": "JFK → CDG",
      "notes": "AA 123",
      "order": 0
    }
  ],
  "collaborators": [
    {
      "userId": "user_456",
      "role": "EDITOR",
      "status": "ACCEPTED",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

**Errors**:
- `404` - Trip not found
- `403` - No access to trip

---

### Create Trip

Create a new trip.

**Endpoint**: `POST /api/trips`

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Paris Vacation",
  "destination": "Paris, France",
  "description": "A week exploring Paris with family",
  "startDate": "2024-12-01",
  "endDate": "2024-12-07",
  "coverImage": "https://...",
  "visibility": "PRIVATE",
  "tags": ["europe", "family"],
  "budget": {
    "total": 3000,
    "currency": "USD",
    "breakdown": {
      "ACCOMMODATION": 1000,
      "TRANSPORTATION": 800,
      "FOOD": 600,
      "ACTIVITIES": 600
    }
  }
}
```

**Response** (201):
```json
{
  "trip": {
    "id": "trip_123",
    "title": "Paris Vacation",
    "destination": "Paris, France",
    "startDate": "2024-12-01",
    "endDate": "2024-12-07",
    "createdBy": "user_123",
    "createdAt": "2024-11-01T10:00:00Z"
  }
}
```

**Errors**:
- `400` - Invalid trip data
- `400` - End date before start date

---

### Update Trip

Update trip details.

**Endpoint**: `PATCH /api/trips/{tripId}`

**Authentication**: Required (EDITOR or ADMIN role)

**Request Body**: (partial update)
```json
{
  "title": "Amazing Paris Vacation",
  "description": "Updated description",
  "tags": ["europe", "family", "romantic"]
}
```

**Response** (200):
```json
{
  "trip": {
    "id": "trip_123",
    "title": "Amazing Paris Vacation",
    "updatedAt": "2024-11-03T10:00:00Z"
  }
}
```

**Errors**:
- `403` - Insufficient permissions
- `404` - Trip not found

---

### Delete Trip

Delete a trip permanently.

**Endpoint**: `DELETE /api/trips/{tripId}`

**Authentication**: Required (ADMIN role or owner only)

**Response** (200):
```json
{
  "message": "Trip deleted successfully"
}
```

**Errors**:
- `403` - Only trip owner can delete
- `404` - Trip not found

---

### Duplicate Trip

Create a copy of an existing trip.

**Endpoint**: `POST /api/trips/{tripId}/duplicate`

**Authentication**: Required

**Request Body** (optional):
```json
{
  "title": "Paris Vacation - Copy",
  "startDate": "2025-01-01",
  "adjustDates": true
}
```

**Response** (201):
```json
{
  "trip": {
    "id": "trip_456",
    "title": "Paris Vacation - Copy",
    "startDate": "2025-01-01",
    "endDate": "2025-01-07"
  }
}
```

---

### Archive/Unarchive Trip

Archive or restore a trip.

**Endpoint**: `PATCH /api/trips/{tripId}/archive`

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "isArchived": true
}
```

**Response** (200):
```json
{
  "trip": {
    "id": "trip_123",
    "isArchived": true
  }
}
```

---

## Events

### List Events

Get events for a trip.

**Endpoint**: `GET /api/trips/{tripId}/events`

**Authentication**: Required

**Query Parameters**:
- `type` - Filter by event type
- `startDate` - Events on or after date
- `endDate` - Events on or before date
- `sortBy` - Sort field (`startDate`, `order`)

**Response** (200):
```json
{
  "events": [
    {
      "id": "event_123",
      "tripId": "trip_123",
      "type": "FLIGHT",
      "title": "Flight to Paris",
      "startDate": "2024-12-01T10:00:00Z",
      "endDate": "2024-12-01T14:00:00Z",
      "location": "JFK → CDG",
      "notes": "AA 123, Gate B12",
      "order": 0,
      "metadata": {
        "airline": "American Airlines",
        "flightNumber": "AA 123",
        "confirmationCode": "ABC123"
      }
    }
  ]
}
```

---

### Create Event

Add an event to trip itinerary.

**Endpoint**: `POST /api/trips/{tripId}/events`

**Authentication**: Required (EDITOR or ADMIN role)

**Request Body**:
```json
{
  "type": "HOTEL",
  "title": "Hotel Eiffel Seine",
  "startDate": "2024-12-01T15:00:00Z",
  "endDate": "2024-12-07T11:00:00Z",
  "location": "17 Boulevard de Grenelle, Paris",
  "notes": "Confirmation #12345",
  "order": 1,
  "metadata": {
    "checkIn": "15:00",
    "checkOut": "11:00",
    "roomType": "Deluxe Double",
    "confirmationCode": "12345"
  }
}
```

**Response** (201):
```json
{
  "event": {
    "id": "event_456",
    "tripId": "trip_123",
    "type": "HOTEL",
    "title": "Hotel Eiffel Seine",
    "startDate": "2024-12-01T15:00:00Z",
    "order": 1,
    "createdAt": "2024-11-02T10:00:00Z"
  }
}
```

---

### Update Event

Update event details.

**Endpoint**: `PATCH /api/trips/{tripId}/events/{eventId}`

**Authentication**: Required (EDITOR or ADMIN role)

**Request Body**:
```json
{
  "title": "Updated Hotel Name",
  "startDate": "2024-12-01T14:00:00Z",
  "notes": "Check-in time changed to 2pm"
}
```

**Response** (200):
```json
{
  "event": {
    "id": "event_456",
    "title": "Updated Hotel Name",
    "updatedAt": "2024-11-03T11:00:00Z"
  }
}
```

---

### Delete Event

Remove an event from itinerary.

**Endpoint**: `DELETE /api/trips/{tripId}/events/{eventId}`

**Authentication**: Required (EDITOR or ADMIN role)

**Response** (200):
```json
{
  "message": "Event deleted successfully"
}
```

---

### Reorder Events

Update the order of events.

**Endpoint**: `PATCH /api/trips/{tripId}/events/reorder`

**Authentication**: Required (EDITOR or ADMIN role)

**Request Body**:
```json
{
  "eventOrders": [
    { "id": "event_123", "order": 0 },
    { "id": "event_456", "order": 1 },
    { "id": "event_789", "order": 2 }
  ]
}
```

**Response** (200):
```json
{
  "message": "Events reordered successfully",
  "updated": 3
}
```

---

## Collaborators

### List Collaborators

Get all collaborators for a trip.

**Endpoint**: `GET /api/trips/{tripId}/collaborators`

**Authentication**: Required

**Response** (200):
```json
{
  "collaborators": [
    {
      "id": "collab_123",
      "userId": "user_456",
      "role": "EDITOR",
      "status": "ACCEPTED",
      "invitedAt": "2024-11-01T10:00:00Z",
      "acceptedAt": "2024-11-01T11:00:00Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

---

### Invite Collaborator

Invite a user to collaborate on a trip.

**Endpoint**: `POST /api/trips/{tripId}/collaborators`

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "email": "john@example.com",
  "role": "EDITOR"
}
```

**Response** (201):
```json
{
  "collaborator": {
    "id": "collab_123",
    "email": "john@example.com",
    "role": "EDITOR",
    "status": "PENDING",
    "inviteToken": "invite_token_here"
  },
  "message": "Invitation sent to john@example.com"
}
```

**Errors**:
- `400` - User already a collaborator
- `403` - Only admins can invite

---

### Update Collaborator Role

Change a collaborator's permission level.

**Endpoint**: `PATCH /api/trips/{tripId}/collaborators/{collaboratorId}`

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "role": "ADMIN"
}
```

**Response** (200):
```json
{
  "collaborator": {
    "id": "collab_123",
    "role": "ADMIN",
    "updatedAt": "2024-11-03T10:00:00Z"
  }
}
```

---

### Remove Collaborator

Remove a user from trip collaboration.

**Endpoint**: `DELETE /api/trips/{tripId}/collaborators/{collaboratorId}`

**Authentication**: Required (ADMIN role or self)

**Response** (200):
```json
{
  "message": "Collaborator removed successfully"
}
```

---

### Accept Invitation

Accept a collaboration invitation.

**Endpoint**: `POST /api/invitations/{token}/accept`

**Authentication**: Required

**Response** (200):
```json
{
  "trip": {
    "id": "trip_123",
    "title": "Paris Vacation"
  },
  "message": "Invitation accepted"
}
```

**Errors**:
- `404` - Invalid or expired token
- `400` - Invitation already accepted

---

## Messages

### List Messages

Get messages for a trip.

**Endpoint**: `GET /api/trips/{tripId}/messages`

**Authentication**: Required

**Query Parameters**:
- `limit` - Number of messages (default: 50)
- `before` - Get messages before this timestamp

**Response** (200):
```json
{
  "messages": [
    {
      "id": "msg_123",
      "content": "What time should we meet for dinner?",
      "userId": "user_456",
      "createdAt": "2024-11-03T15:00:00Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

---

### Send Message

Post a message to trip discussion.

**Endpoint**: `POST /api/trips/{tripId}/messages`

**Authentication**: Required (VIEWER, EDITOR, or ADMIN role)

**Request Body**:
```json
{
  "content": "Let's meet at 7pm at the hotel lobby!"
}
```

**Response** (201):
```json
{
  "message": {
    "id": "msg_124",
    "content": "Let's meet at 7pm at the hotel lobby!",
    "userId": "user_123",
    "createdAt": "2024-11-03T15:05:00Z"
  }
}
```

---

### Delete Message

Delete a message (own messages only).

**Endpoint**: `DELETE /api/trips/{tripId}/messages/{messageId}`

**Authentication**: Required (message author or ADMIN)

**Response** (200):
```json
{
  "message": "Message deleted successfully"
}
```

---

## Ideas & Polls

### List Ideas

Get trip ideas and suggestions.

**Endpoint**: `GET /api/trips/{tripId}/ideas`

**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status (`OPEN`, `ACCEPTED`, `REJECTED`)
- `page` - Page number
- `limit` - Items per page (max: 100)

**Response** (200):
```json
{
  "ideas": [
    {
      "id": "idea_123",
      "title": "Visit the Louvre Museum",
      "description": "Should we add a visit to the Louvre?",
      "status": "OPEN",
      "votesCount": 3,
      "createdBy": "user_456",
      "createdAt": "2024-11-02T10:00:00Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "avatarUrl": "https://..."
      },
      "votes": [
        { "userId": "user_123", "createdAt": "2024-11-02T11:00:00Z" },
        { "userId": "user_456", "createdAt": "2024-11-02T10:00:00Z" }
      ]
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

---

### Create Idea

Suggest a new idea for the trip.

**Endpoint**: `POST /api/trips/{tripId}/ideas`

**Authentication**: Required (VIEWER, EDITOR, or ADMIN role)

**Request Body**:
```json
{
  "title": "Visit the Eiffel Tower at sunset",
  "description": "The sunset view from the top is supposed to be amazing!"
}
```

**Response** (201):
```json
{
  "idea": {
    "id": "idea_124",
    "title": "Visit the Eiffel Tower at sunset",
    "status": "OPEN",
    "votesCount": 0,
    "createdAt": "2024-11-03T10:00:00Z"
  }
}
```

---

### Vote on Idea

Upvote an idea.

**Endpoint**: `POST /api/trips/{tripId}/ideas/{ideaId}/vote`

**Authentication**: Required

**Response** (200):
```json
{
  "idea": {
    "id": "idea_124",
    "votesCount": 1
  },
  "message": "Vote recorded"
}
```

To remove vote:

**Endpoint**: `DELETE /api/trips/{tripId}/ideas/{ideaId}/vote`

---

### Create Poll

Create a poll for group decision.

**Endpoint**: `POST /api/trips/{tripId}/polls`

**Authentication**: Required (EDITOR or ADMIN role)

**Request Body**:
```json
{
  "question": "Where should we have dinner on Day 2?",
  "options": [
    "Le Jules Verne",
    "L'Ambroisie",
    "Septime"
  ]
}
```

**Response** (201):
```json
{
  "poll": {
    "id": "poll_123",
    "question": "Where should we have dinner on Day 2?",
    "status": "OPEN",
    "createdAt": "2024-11-03T10:00:00Z",
    "options": [
      {
        "id": "opt_1",
        "text": "Le Jules Verne",
        "votesCount": 0
      },
      {
        "id": "opt_2",
        "text": "L'Ambroisie",
        "votesCount": 0
      },
      {
        "id": "opt_3",
        "text": "Septime",
        "votesCount": 0
      }
    ]
  }
}
```

---

### Vote on Poll

Cast a vote in a poll.

**Endpoint**: `POST /api/trips/{tripId}/polls/{pollId}/vote`

**Authentication**: Required

**Request Body**:
```json
{
  "optionId": "opt_1"
}
```

**Response** (200):
```json
{
  "message": "Vote recorded",
  "poll": {
    "id": "poll_123",
    "options": [
      {
        "id": "opt_1",
        "text": "Le Jules Verne",
        "votesCount": 1
      }
    ]
  }
}
```

---

## Budget & Expenses

### Get Budget

Get budget details for a trip.

**Endpoint**: `GET /api/trips/{tripId}/budget`

**Authentication**: Required

**Response** (200):
```json
{
  "budget": {
    "total": 3000,
    "currency": "USD",
    "breakdown": {
      "ACCOMMODATION": 1000,
      "TRANSPORTATION": 800,
      "FOOD": 600,
      "ACTIVITIES": 600
    }
  },
  "spent": {
    "total": 2450,
    "breakdown": {
      "ACCOMMODATION": 950,
      "TRANSPORTATION": 700,
      "FOOD": 500,
      "ACTIVITIES": 300
    }
  },
  "remaining": 550,
  "percentSpent": 81.67
}
```

---

### Update Budget

Update trip budget.

**Endpoint**: `PATCH /api/trips/{tripId}/budget`

**Authentication**: Required (EDITOR or ADMIN role)

**Request Body**:
```json
{
  "total": 3500,
  "currency": "USD",
  "breakdown": {
    "ACCOMMODATION": 1200,
    "TRANSPORTATION": 900,
    "FOOD": 700,
    "ACTIVITIES": 700
  }
}
```

**Response** (200):
```json
{
  "budget": {
    "total": 3500,
    "currency": "USD",
    "breakdown": {
      "ACCOMMODATION": 1200,
      "TRANSPORTATION": 900,
      "FOOD": 700,
      "ACTIVITIES": 700
    }
  }
}
```

---

### List Expenses

Get expenses for a trip.

**Endpoint**: `GET /api/trips/{tripId}/expenses`

**Authentication**: Required

**Query Parameters**:
- `category` - Filter by category
- `paidBy` - Filter by user who paid
- `sortBy` - Sort field (`date`, `amount`)

**Response** (200):
```json
{
  "expenses": [
    {
      "id": "exp_123",
      "description": "Hotel Eiffel Seine - 6 nights",
      "amount": 950,
      "currency": "USD",
      "category": "ACCOMMODATION",
      "date": "2024-12-01",
      "paidBy": "user_123",
      "createdAt": "2024-11-03T10:00:00Z",
      "splits": [
        {
          "userId": "user_123",
          "amount": 475,
          "user": { "firstName": "Jane", "lastName": "Doe" }
        },
        {
          "userId": "user_456",
          "amount": 475,
          "user": { "firstName": "John", "lastName": "Doe" }
        }
      ]
    }
  ],
  "totals": {
    "total": 2450,
    "byUser": {
      "user_123": { "paid": 1500, "owes": -50 },
      "user_456": { "paid": 950, "owes": 50 }
    }
  }
}
```

---

### Add Expense

Record a new expense.

**Endpoint**: `POST /api/trips/{tripId}/expenses`

**Authentication**: Required (EDITOR or ADMIN role)

**Request Body**:
```json
{
  "description": "Dinner at Le Jules Verne",
  "amount": 180,
  "currency": "USD",
  "category": "FOOD",
  "date": "2024-12-03",
  "paidBy": "user_123",
  "splits": [
    { "userId": "user_123", "amount": 90 },
    { "userId": "user_456", "amount": 90 }
  ]
}
```

**Response** (201):
```json
{
  "expense": {
    "id": "exp_124",
    "description": "Dinner at Le Jules Verne",
    "amount": 180,
    "category": "FOOD",
    "createdAt": "2024-11-03T20:00:00Z"
  }
}
```

---

### Delete Expense

Remove an expense.

**Endpoint**: `DELETE /api/trips/{tripId}/expenses/{expenseId}`

**Authentication**: Required (expense creator or ADMIN)

**Response** (200):
```json
{
  "message": "Expense deleted successfully"
}
```

---

## CRM & Clients

### List Clients

Get all clients (travel agents only).

**Endpoint**: `GET /api/crm/clients`

**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status (`LEAD`, `ACTIVE`, `PAST`)
- `search` - Search by name or email
- `page` - Page number
- `limit` - Items per page

**Response** (200):
```json
{
  "clients": [
    {
      "id": "client_123",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah@example.com",
      "phone": "+1 555-1234",
      "status": "ACTIVE",
      "tags": ["honeymoon", "luxury"],
      "notes": "Looking for romantic destinations",
      "createdAt": "2024-10-01T10:00:00Z",
      "_count": {
        "trips": 2,
        "proposals": 1,
        "invoices": 1
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

---

### Create Client

Add a new client to CRM.

**Endpoint**: `POST /api/crm/clients`

**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah@example.com",
  "phone": "+1 555-1234",
  "status": "LEAD",
  "tags": ["honeymoon"],
  "notes": "Interested in European honeymoon packages"
}
```

**Response** (201):
```json
{
  "client": {
    "id": "client_123",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@example.com",
    "status": "LEAD",
    "createdAt": "2024-11-03T10:00:00Z"
  }
}
```

---

### Update Client

Update client information.

**Endpoint**: `PATCH /api/crm/clients/{clientId}`

**Authentication**: Required

**Request Body**:
```json
{
  "status": "ACTIVE",
  "notes": "Booked Paris honeymoon package"
}
```

**Response** (200):
```json
{
  "client": {
    "id": "client_123",
    "status": "ACTIVE",
    "updatedAt": "2024-11-03T11:00:00Z"
  }
}
```

---

## Proposals & Invoices

### List Proposals

Get all proposals.

**Endpoint**: `GET /api/proposals`

**Authentication**: Required

**Query Parameters**:
- `clientId` - Filter by client
- `status` - Filter by status (`DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`)
- `page` - Page number
- `limit` - Items per page

**Response** (200):
```json
{
  "proposals": [
    {
      "id": "prop_123",
      "proposalNumber": "PROP-2024-001",
      "clientId": "client_123",
      "title": "Paris Honeymoon Package",
      "status": "SENT",
      "subtotal": 5000,
      "tax": 500,
      "discount": 0,
      "total": 5500,
      "currency": "USD",
      "validUntil": "2024-12-31",
      "createdAt": "2024-11-01T10:00:00Z",
      "client": {
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah@example.com"
      }
    }
  ]
}
```

---

### Create Proposal

Create a new proposal.

**Endpoint**: `POST /api/proposals`

**Authentication**: Required

**Request Body**:
```json
{
  "clientId": "client_123",
  "title": "Paris Honeymoon Package",
  "description": "7 days in Paris with luxury hotels...",
  "validUntil": "2024-12-31",
  "items": [
    {
      "description": "Round-trip flights (2 passengers)",
      "quantity": 2,
      "unitPrice": 800,
      "total": 1600
    },
    {
      "description": "Hotel Eiffel Seine (6 nights)",
      "quantity": 6,
      "unitPrice": 250,
      "total": 1500
    }
  ],
  "subtotal": 5000,
  "tax": 500,
  "discount": 0,
  "total": 5500,
  "currency": "USD"
}
```

**Response** (201):
```json
{
  "proposal": {
    "id": "prop_123",
    "proposalNumber": "PROP-2024-001",
    "status": "DRAFT",
    "total": 5500,
    "createdAt": "2024-11-03T10:00:00Z"
  }
}
```

---

### Send Proposal

Send proposal to client via email.

**Endpoint**: `POST /api/proposals/{proposalId}/send`

**Authentication**: Required

**Response** (200):
```json
{
  "message": "Proposal sent to sarah@example.com",
  "proposal": {
    "id": "prop_123",
    "status": "SENT",
    "sentAt": "2024-11-03T10:00:00Z"
  }
}
```

---

### List Invoices

Get all invoices.

**Endpoint**: `GET /api/invoices`

**Authentication**: Required

**Query Parameters**:
- `clientId` - Filter by client
- `status` - Filter by status (`DRAFT`, `SENT`, `PAID`, `OVERDUE`)
- `page` - Page number
- `limit` - Items per page

**Response** (200):
```json
{
  "invoices": [
    {
      "id": "inv_123",
      "invoiceNumber": "INV-2024-001",
      "clientId": "client_123",
      "status": "PAID",
      "subtotal": 5000,
      "tax": 500,
      "discount": 0,
      "total": 5500,
      "currency": "USD",
      "dueDate": "2024-12-15",
      "paidAt": "2024-12-01T10:00:00Z",
      "paymentMethod": "stripe",
      "stripePaymentIntentId": "pi_xxx",
      "createdAt": "2024-11-15T10:00:00Z",
      "client": {
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah@example.com"
      }
    }
  ]
}
```

---

### Create Invoice

Create a new invoice.

**Endpoint**: `POST /api/invoices`

**Authentication**: Required

**Request Body**:
```json
{
  "clientId": "client_123",
  "proposalId": "prop_123",
  "dueDate": "2024-12-15",
  "paymentTerms": "Due within 30 days",
  "items": [
    {
      "description": "Paris Honeymoon Package",
      "quantity": 1,
      "unitPrice": 5000,
      "total": 5000
    }
  ],
  "subtotal": 5000,
  "tax": 500,
  "discount": 0,
  "total": 5500,
  "currency": "USD"
}
```

**Response** (201):
```json
{
  "invoice": {
    "id": "inv_123",
    "invoiceNumber": "INV-2024-001",
    "status": "DRAFT",
    "total": 5500,
    "dueDate": "2024-12-15",
    "createdAt": "2024-11-15T10:00:00Z"
  }
}
```

---

### Pay Invoice (Stripe)

Create Stripe payment session for invoice.

**Endpoint**: `POST /api/invoices/{invoiceId}/pay`

**Authentication**: Not required (client can pay via link)

**Response** (200):
```json
{
  "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_xxx",
  "sessionId": "cs_test_xxx"
}
```

Redirects user to Stripe Checkout. On success, invoice is marked as PAID.

---

## Landing Pages

### Create Landing Page

Create a custom landing page for a trip/package.

**Endpoint**: `POST /api/landing-pages`

**Authentication**: Required

**Request Body**:
```json
{
  "slug": "paris-honeymoon-2024",
  "title": "Paris Honeymoon Package",
  "description": "7 magical days in the City of Love",
  "heroImage": "https://...",
  "content": {
    "sections": [
      {
        "type": "hero",
        "title": "Your Dream Honeymoon Awaits",
        "subtitle": "Experience the romance of Paris"
      },
      {
        "type": "features",
        "items": ["Luxury Hotels", "Fine Dining", "Private Tours"]
      }
    ]
  },
  "pricing": {
    "amount": 5500,
    "currency": "USD",
    "includes": ["Flights", "Hotels", "Tours"]
  },
  "isPublished": true
}
```

**Response** (201):
```json
{
  "landingPage": {
    "id": "lp_123",
    "slug": "paris-honeymoon-2024",
    "title": "Paris Honeymoon Package",
    "url": "https://wanderplan.com/p/paris-honeymoon-2024",
    "isPublished": true,
    "createdAt": "2024-11-03T10:00:00Z"
  }
}
```

---

### Submit Lead

Submit a lead from landing page form.

**Endpoint**: `POST /api/landing-pages/{slug}/leads`

**Authentication**: Not required (public endpoint)

**Request Body**:
```json
{
  "firstName": "Emma",
  "lastName": "Wilson",
  "email": "emma@example.com",
  "phone": "+1 555-9876",
  "message": "Interested in booking for May 2025"
}
```

**Response** (201):
```json
{
  "message": "Thank you! We'll contact you soon.",
  "lead": {
    "id": "lead_123",
    "email": "emma@example.com"
  }
}
```

**Rate Limiting**: 10 submissions per IP per hour

---

## Integrations

### Export to PDF

Generate PDF of trip itinerary.

**Endpoint**: `GET /api/trips/{tripId}/export/pdf`

**Authentication**: Required

**Query Parameters**:
- `format` - PDF layout (`detailed`, `compact`)
- `includeMap` - Include map images (boolean)
- `includeBudget` - Include budget summary (boolean)

**Response**: PDF file download

**Headers**:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="paris-vacation.pdf"`

---

### Google Calendar Sync

Authorize Google Calendar integration.

**Endpoint**: `GET /api/integrations/google-calendar/auth`

**Authentication**: Required

**Response**: Redirects to Google OAuth consent screen

---

### Sync Trip to Calendar

Export trip events to Google Calendar.

**Endpoint**: `POST /api/trips/{tripId}/calendar-sync`

**Authentication**: Required

**Request Body**:
```json
{
  "calendarId": "primary"
}
```

**Response** (200):
```json
{
  "message": "Trip synced to Google Calendar",
  "eventsCreated": 12,
  "calendarUrl": "https://calendar.google.com/..."
}
```

---

## Error Handling

### Error Response Format

All API errors follow this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting

**Headers** (returned on all requests):
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1699999999
```

**When rate limited** (429 response):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Webhooks

### Stripe Webhook

Receives Stripe payment events.

**Endpoint**: `POST /api/webhooks/stripe`

**Authentication**: Stripe webhook signature verification

**Events Handled**:
- `payment_intent.succeeded` - Mark invoice as paid
- `payment_intent.failed` - Notify user of failure

---

## Best Practices

### Authentication
- Always include session cookie on protected endpoints
- Refresh session before expiry
- Logout when done: `POST /api/auth/signout`

### Error Handling
```javascript
try {
  const response = await fetch('/api/trips', {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error.message);
    // Handle error appropriately
  }

  const data = await response.json();
  // Use data
} catch (err) {
  console.error('Network error:', err);
}
```

### Optimistic Updates
```javascript
// Update UI immediately, rollback on error
const optimisticTrip = { ...trip, title: newTitle };
setTrip(optimisticTrip);

try {
  await fetch(`/api/trips/${trip.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: newTitle })
  });
} catch (err) {
  setTrip(trip); // Rollback
  toast.error('Failed to update trip');
}
```

### Batching Requests
```javascript
// Instead of multiple sequential requests:
const trips = await Promise.all([
  fetch('/api/trips/1'),
  fetch('/api/trips/2'),
  fetch('/api/trips/3')
]);
```

---

## Support

For API support, contact:
- **Email**: api@wanderplan.com
- **GitHub Issues**: github.com/wanderplan/wanderplan/issues
- **Documentation**: docs.wanderplan.com

---

**Last Updated**: 2024-11-23
**API Version**: 1.0.0
