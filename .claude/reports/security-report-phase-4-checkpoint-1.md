# Phase 4 Security Audit Report - Checkpoint 1

**Auditor**: Security Agent
**Date**: 2025-11-14T18:30:00Z
**Phase**: Phase 4 - Collaboration & Communication
**Tasks Audited**: 4.1 through 4.8 (Collaborators, Real-time, Messages, Ideas, Polls)
**Severity Levels**: CRITICAL ❌ | HIGH ⚠️ | MEDIUM ⚠️ | LOW ℹ️ | INFO ℹ️

---

## Executive Summary

**Total Issues Found**: 12
- **CRITICAL**: 3 ❌ (MUST FIX before production)
- **HIGH**: 4 ⚠️ (Fix in current phase)
- **MEDIUM**: 3 ⚠️ (Address soon)
- **LOW**: 2 ℹ️ (Best practices)

## Overall Verdict

⚠️ **FAIL - CRITICAL ISSUES PRESENT**

Phase 4 introduces real-time collaboration features with generally secure implementation patterns. However, **3 CRITICAL security issues exist**:

1. **2 CRITICAL issues from Phase 3 remain unresolved** (blocker-003)
2. **1 NEW CRITICAL issue**: WebSocket authentication bypass vulnerability

Additionally, **rate limiting is completely absent** on all new endpoints, and several high-priority authorization and injection vulnerabilities need immediate attention.

---

## Security Rating

**Overall Score**: 58/100

| Category | Score | Status |
|----------|-------|--------|
| Authentication & Authorization | 40/100 | ❌ CRITICAL - Multiple bypasses |
| Input Validation | 85/100 | ✅ GOOD |
| Data Protection | 75/100 | ⚠️ ACCEPTABLE |
| Real-time Security | 45/100 | ❌ CRITICAL - WebSocket issues |
| Dependency Security | 100/100 | ✅ PERFECT |
| XSS Prevention | 100/100 | ✅ PERFECT |
| SQL Injection Prevention | 100/100 | ✅ PERFECT |
| CSRF Protection | 80/100 | ✅ GOOD |
| Rate Limiting | 0/100 | ❌ NONE - Critical gap |
| Error Handling | 70/100 | ✅ ACCEPTABLE |

---

## CRITICAL Issues (Must Fix Immediately)

### CRITICAL-1: Middleware Authentication Still Disabled (UNRESOLVED)

**Severity**: CRITICAL ❌
**CWE**: CWE-306 - Missing Authentication for Critical Function
**OWASP**: A01:2021 - Broken Access Control
**File**: `/home/user/WanderPlan/src/middleware.ts:23-26`
**Status**: **UNRESOLVED FROM PHASE 3** (blocker-003)

**Description**:
The Next.js middleware that should protect authenticated routes is STILL completely disabled. All protected routes (`/dashboard/*`, `/trips/*`, `/profile/*`, `/settings/*`) remain accessible without authentication.

**Impact**:
- Any unauthenticated user can access all trip data, messages, ideas, polls
- Complete bypass of authentication system
- Unauthorized access to sensitive collaboration data
- Potential data theft, modification, or deletion
- GDPR/privacy violations

**Remediation**: See Phase 3 Security Audit Report (CRITICAL-1)

**Estimated Fix Time**: 2 hours

---

### CRITICAL-2: Missing Security Headers (UNRESOLVED)

**Severity**: CRITICAL ❌
**CWE**: CWE-1032 - Security Headers Not Set
**OWASP**: A05:2021 - Security Misconfiguration
**File**: `/home/user/WanderPlan/next.config.js`
**Status**: **UNRESOLVED FROM PHASE 3** (blocker-003)

**Description**:
The Next.js configuration is STILL missing critical security headers that protect against XSS, clickjacking, MIME-sniffing, and other attacks.

**Missing Headers**:
- `Content-Security-Policy` (CSP)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)

**Impact**:
- Vulnerable to XSS attacks via inline scripts
- Vulnerable to clickjacking attacks
- Vulnerable to MIME-sniffing attacks
- WebSocket connections not secured properly

**Remediation**: See Phase 3 Security Audit Report (CRITICAL-2)

**Estimated Fix Time**: 1 hour

---

### CRITICAL-3: WebSocket Authentication Bypass Vulnerability (NEW)

**Severity**: CRITICAL ❌
**CWE**: CWE-287 - Improper Authentication
**OWASP**: A07:2021 - Identification and Authentication Failures
**File**: `/home/user/WanderPlan/src/lib/realtime/server.ts:86-106`

**Description**:
The Socket.io server attempts to authenticate connections using NextAuth JWT tokens, but the authentication middleware has a critical flaw that allows bypassing authentication.

**Vulnerable Code**:
```typescript
// Socket.io authentication middleware
io.use(async (socket: AuthenticatedSocket, next) => {
  try {
    const token = await getToken({
      req: socket.request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return next(new Error('Unauthorized'));
    }

    // Attach user info to socket
    socket.userId = token.sub;
    socket.userEmail = token.email || undefined;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
});
```

**Vulnerabilities**:

1. **No NEXTAUTH_SECRET validation**: If `process.env.NEXTAUTH_SECRET` is undefined, `getToken()` might use a default secret or fail silently
2. **Weak error handling**: Caught errors still call `next()` with an error, but the error message doesn't distinguish between authentication failures
3. **No rate limiting**: Attackers can brute-force WebSocket authentication
4. **No session validation**: Token existence is checked, but not whether the session is active or expired

**Attack Scenarios**:

**Scenario 1: Missing NEXTAUTH_SECRET**
```javascript
// If NEXTAUTH_SECRET is undefined in production
const token = await getToken({ req, secret: undefined });
// This might accept invalid tokens
```

**Scenario 2: Forged JWT**
```javascript
// Attacker creates a JWT with a guessed/leaked secret
// If secret is weak or default, authentication can be bypassed
```

**Scenario 3: Replay attack**
```javascript
// Attacker captures a valid token
// Uses it to connect multiple WebSocket clients
// No token revocation or session validation
```

**Impact**:
- **CRITICAL**: Unauthorized access to real-time messaging
- Ability to join any trip room and read messages
- Ability to impersonate other users in real-time events
- Potential to broadcast malicious events to trip participants
- No way to revoke compromised WebSocket sessions

**Proof of Concept**:
```javascript
// Connect with no authentication
const socket = io('http://localhost:3000', {
  path: '/api/socketio',
  // If auth fails silently, connection might succeed
});

// Try to join a trip room
socket.emit('trip:join', 'any-trip-id');
// May succeed if trip access verification also fails
```

**Remediation**:

```typescript
// lib/realtime/server.ts

io.use(async (socket: AuthenticatedSocket, next) => {
  try {
    // CRITICAL: Validate NEXTAUTH_SECRET exists
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('CRITICAL: NEXTAUTH_SECRET is not configured');
      return next(new Error('Server configuration error'));
    }

    // Get and validate token
    const token = await getToken({
      req: socket.request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Reject if no token or invalid structure
    if (!token || !token.sub || !token.email) {
      console.warn('WebSocket auth failed: Invalid or missing token');
      return next(new Error('Unauthorized: Invalid authentication token'));
    }

    // Optional: Validate session is still active in database
    const session = await prisma.session.findFirst({
      where: {
        userId: token.sub,
        expires: { gt: new Date() },
      },
    });

    if (!session) {
      console.warn(`WebSocket auth failed: No active session for user ${token.sub}`);
      return next(new Error('Unauthorized: Session expired'));
    }

    // Attach verified user info to socket
    socket.userId = token.sub;
    socket.userEmail = token.email;

    // Log successful authentication
    console.log(`WebSocket authenticated: ${token.sub} (${token.email})`);

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    return next(new Error('Authentication failed: ' + (error as Error).message));
  }
});
```

**Additional Hardening**:

1. **Implement rate limiting for WebSocket connections**:
```typescript
// Track connection attempts per IP
const connectionAttempts = new Map<string, number>();

io.use((socket, next) => {
  const ip = socket.handshake.address;
  const attempts = connectionAttempts.get(ip) || 0;

  if (attempts > 5) {
    return next(new Error('Too many connection attempts'));
  }

  connectionAttempts.set(ip, attempts + 1);
  setTimeout(() => connectionAttempts.delete(ip), 60000); // Reset after 1 min

  next();
});
```

2. **Add connection logging**:
```typescript
io.on('connection', (socket: AuthenticatedSocket) => {
  logSecurityEvent({
    type: 'websocket_connection',
    userId: socket.userId,
    ip: socket.handshake.address,
    timestamp: new Date().toISOString(),
  });
});
```

3. **Implement heartbeat/ping-pong for session validation**:
```typescript
// Validate session every 5 minutes
setInterval(async () => {
  const sockets = await io.fetchSockets();
  for (const socket of sockets) {
    const userId = (socket as any).userId;
    const session = await prisma.session.findFirst({
      where: { userId, expires: { gt: new Date() } },
    });

    if (!session) {
      socket.disconnect(true);
    }
  }
}, 5 * 60 * 1000);
```

**Estimated Fix Time**: 4 hours

---

## HIGH Priority Issues

### HIGH-1: Missing Rate Limiting on ALL Phase 4 API Endpoints

**Severity**: HIGH ⚠️
**CWE**: CWE-770 - Allocation of Resources Without Limits
**OWASP**: A04:2021 - Insecure Design
**File**: Multiple API routes

**Description**:
NONE of the Phase 4 collaboration and messaging endpoints implement rate limiting, making them vulnerable to abuse and DoS attacks.

**Affected Endpoints**:

**Collaborator Management**:
- `POST /api/trips/[tripId]/collaborators` - Invite collaborators (spam risk)
- `GET /api/trips/[tripId]/collaborators` - List collaborators
- `PATCH /api/trips/[tripId]/collaborators/[id]` - Update role
- `DELETE /api/trips/[tripId]/collaborators/[id]` - Remove collaborator

**Messaging**:
- `POST /api/trips/[tripId]/messages` - Send message (spam/DoS risk)
- `GET /api/trips/[tripId]/messages` - List messages
- `PATCH /api/trips/[tripId]/messages/[id]` - Edit message
- `DELETE /api/trips/[tripId]/messages/[id]` - Delete message

**Ideas**:
- `POST /api/trips/[tripId]/ideas` - Create idea (spam risk)
- `GET /api/trips/[tripId]/ideas` - List ideas
- `PATCH /api/trips/[tripId]/ideas/[id]` - Update idea
- `DELETE /api/trips/[tripId]/ideas/[id]` - Delete idea
- `POST /api/trips/[tripId]/ideas/[id]/vote` - Vote on idea (vote manipulation)

**Polls**:
- `POST /api/trips/[tripId]/polls` - Create poll (spam risk)
- `GET /api/trips/[tripId]/polls` - List polls
- `GET /api/trips/[tripId]/polls/[id]` - Get poll details
- `PATCH /api/trips/[tripId]/polls/[id]` - Update poll status
- `DELETE /api/trips/[tripId]/polls/[id]` - Delete poll
- `POST /api/trips/[tripId]/polls/[id]/vote` - Vote on poll (vote manipulation)

**Attack Scenarios**:

**Scenario 1: Message Spam**
```bash
# Attacker floods a trip with messages
for i in {1..10000}; do
  curl -X POST /api/trips/[tripId]/messages \
    -d '{"content":"SPAM MESSAGE '$i'"}'
done
# Result: Database fills with spam, legitimate messages buried
```

**Scenario 2: Vote Manipulation**
```bash
# Attacker votes rapidly to manipulate poll results
for i in {1..1000}; do
  curl -X POST /api/trips/[tripId]/polls/[pollId]/vote \
    -d '{"optionIds":["option-1"]}'
done
# Result: Poll results skewed, democratic decision-making compromised
```

**Scenario 3: Collaborator Invitation Spam**
```bash
# Attacker spams invitation emails
for email in spam_list.txt; do
  curl -X POST /api/trips/[tripId]/collaborators \
    -d '{"email":"'$email'","role":"VIEWER"}'
done
# Result: Hundreds of invitation emails sent, reputation damage
```

**Impact**:
- **Database overload**: Message spam fills database
- **Email spam**: Collaborator invitations sent to arbitrary emails
- **Vote manipulation**: Polls and idea voting can be rigged
- **DoS attacks**: Server resources exhausted
- **User experience degradation**: Legitimate users can't use features
- **Reputation damage**: Spam emails damage sender reputation

**Recommendations**:

**1. Implement per-user rate limiting**:

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Message rate limits
export const messageRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 messages per hour per user
  analytics: true,
});

// Voting rate limits
export const voteRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, '1 h'), // 50 votes per hour per user
  analytics: true,
});

// Invitation rate limits
export const inviteRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 d'), // 10 invites per day per user
  analytics: true,
});

// Idea/poll creation rate limits
export const createRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 creations per hour per user
  analytics: true,
});
```

**2. Apply in API routes**:

```typescript
// Example: Message creation
import { messageRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest, { params }: { params: { tripId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check
  const { success, limit, remaining, reset } = await messageRateLimit.limit(
    `message:${session.user.id}`
  );

  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'You can send 20 messages per hour',
        retryAfter: new Date(reset),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Continue with normal flow...
}
```

**3. Add WebSocket rate limiting**:

```typescript
// Track message sending via WebSocket
const messageRateLimits = new Map<string, { count: number; resetAt: number }>();

socket.on(SocketEvent.MESSAGE_SENT, async (data) => {
  const userId = socket.userId!;
  const now = Date.now();
  const limit = messageRateLimits.get(userId);

  if (limit && limit.resetAt > now) {
    if (limit.count >= 20) {
      socket.emit(SocketEvent.ERROR, {
        error: 'Rate limit exceeded',
        message: 'Too many messages',
      });
      return;
    }
    limit.count++;
  } else {
    messageRateLimits.set(userId, {
      count: 1,
      resetAt: now + 3600000, // 1 hour
    });
  }

  // Process message...
});
```

**Estimated Fix Time**: 10 hours

---

### HIGH-2: Insufficient Authorization Checks for Message Deletion

**Severity**: HIGH ⚠️
**CWE**: CWE-284 - Improper Access Control
**OWASP**: A01:2021 - Broken Access Control
**File**: `/home/user/WanderPlan/src/app/api/trips/[tripId]/messages/[id]/route.ts:142-243`

**Description**:
The message deletion endpoint allows trip owners and admins to delete ANY message, including messages from OTHER admins. This violates the principle of least privilege and could enable abuse.

**Vulnerable Code**:
```typescript
// Check permissions:
// - Message author can delete their own messages
// - Trip owner can delete any message
// - Admin collaborators can delete any message
const isMessageAuthor = message.userId === session.user.id;
const canDelete = isMessageAuthor || isOwner || isAdmin;

if (!canDelete) {
  return NextResponse.json(
    { error: 'You do not have permission to delete this message' },
    { status: 403 }
  );
}

// Delete the message
await prisma.message.delete({
  where: { id: messageId },
});
```

**Issue**:
- Admin can delete messages from other admins
- Admin can delete messages from the trip owner
- No audit trail of who deleted the message
- Deleted messages are permanently removed (no soft delete)

**Attack Scenario**:
```
1. User A is trip owner
2. User B is admin collaborator
3. User A posts: "Let's book Hotel XYZ for $500"
4. User B deletes User A's message
5. User B posts: "Let's book Hotel ABC for $200"
6. No record that User A's message ever existed
7. Trip decisions can be manipulated
```

**Impact**:
- Abuse of power by admin collaborators
- Manipulation of trip decision history
- No accountability for message deletion
- Potential disputes with no evidence

**Remediation**:

```typescript
// OPTION 1: Soft delete with metadata
const isMessageAuthor = message.userId === session.user.id;
const canDelete = isMessageAuthor || isOwner || isAdmin;

if (!canDelete) {
  return NextResponse.json(
    { error: 'You do not have permission to delete this message' },
    { status: 403 }
  );
}

// Soft delete with audit trail
await prisma.message.update({
  where: { id: messageId },
  data: {
    deletedAt: new Date(),
    deletedBy: session.user.id,
    content: '[Message deleted]', // Optionally preserve original in metadata
  },
});

// Log deletion activity
await prisma.activity.create({
  data: {
    tripId,
    userId: session.user.id,
    actionType: 'MESSAGE_DELETED',
    actionData: {
      messageId,
      messageAuthor: message.userId,
      deletedBy: session.user.id,
      isOwnMessage: isMessageAuthor,
    },
  },
});

// OPTION 2: Stricter permissions
// Only allow users to delete their own messages
// Admins/owners can "hide" messages instead
const isMessageAuthor = message.userId === session.user.id;

if (!isMessageAuthor) {
  // Instead of deleting, mark as hidden by admin
  if (isOwner || isAdmin) {
    await prisma.message.update({
      where: { id: messageId },
      data: {
        hiddenAt: new Date(),
        hiddenBy: session.user.id,
      },
    });
    return NextResponse.json({
      success: true,
      message: 'Message hidden',
    });
  }

  return NextResponse.json(
    { error: 'You can only delete your own messages' },
    { status: 403 }
  );
}

// Author can delete their own message
await prisma.message.update({
  where: { id: messageId },
  data: {
    deletedAt: new Date(),
    deletedBy: session.user.id,
  },
});
```

**Estimated Fix Time**: 3 hours

---

### HIGH-3: Poll Vote Manipulation Vulnerability

**Severity**: HIGH ⚠️
**CWE**: CWE-862 - Missing Authorization
**OWASP**: A01:2021 - Broken Access Control
**File**: `/home/user/WanderPlan/src/app/api/trips/[tripId]/polls/[id]/vote/route.ts:19-172`

**Description**:
The poll voting endpoint properly validates that a user has access to the trip, but has NO rate limiting and replaces votes atomically without any abuse detection. A malicious user could rapidly change their votes to manipulate poll results in real-time.

**Vulnerable Code**:
```typescript
// Remove existing votes from this user for this poll
await prisma.pollVote.deleteMany({
  where: {
    pollId,
    userId: session.user.id,
  },
});

// Create new votes
await prisma.pollVote.createMany({
  data: optionIds.map((optionId) => ({
    pollId,
    optionId,
    userId: session.user.id,
  })),
});
```

**Issues**:
1. **No rate limiting**: User can change vote unlimited times per second
2. **No vote change tracking**: No audit trail of vote changes
3. **Real-time broadcast manipulation**: Each vote change broadcasts to all users
4. **No detection of suspicious patterns**: Rapid vote flipping not flagged

**Attack Scenarios**:

**Scenario 1: Vote Flooding**
```javascript
// Attacker rapidly changes votes to confuse other participants
setInterval(() => {
  const randomOption = Math.random() > 0.5 ? 'option-a' : 'option-b';
  fetch(`/api/trips/${tripId}/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionIds: [randomOption] }),
  });
}, 100); // Change vote 10 times per second

// Result: Other users see vote counts jumping wildly
// Makes it hard to see legitimate voting patterns
```

**Scenario 2: Last-Second Vote Manipulation**
```javascript
// Attacker waits until poll is about to close
// Rapidly flips votes to desired outcome
// Other users don't have time to react

setTimeout(() => {
  for (let i = 0; i < 50; i++) {
    fetch(`/api/trips/${tripId}/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIds: ['preferred-option'] }),
    });
  }
}, pollCloseTime - 1000); // 1 second before closing
```

**Impact**:
- Poll results can be manipulated
- Real-time UI becomes unreliable
- Democratic decision-making undermined
- Server resources wasted on vote processing
- Database write amplification

**Remediation**:

```typescript
// 1. Add rate limiting
import { voteRateLimit } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string; id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: Max 5 vote changes per 5 minutes per user per poll
  const { success } = await voteRateLimit.limit(
    `poll:${params.id}:user:${session.user.id}`
  );

  if (!success) {
    return NextResponse.json(
      { error: 'Too many vote changes. Please wait before voting again.' },
      { status: 429 }
    );
  }

  // ... rest of validation ...

  // 2. Track vote changes for audit
  const existingVotes = await prisma.pollVote.findMany({
    where: { pollId, userId: session.user.id },
  });

  // Log vote change if different
  if (existingVotes.length > 0) {
    await prisma.pollVoteHistory.create({
      data: {
        pollId,
        userId: session.user.id,
        previousVotes: existingVotes.map(v => v.optionId),
        newVotes: optionIds,
        changedAt: new Date(),
      },
    });
  }

  // Remove existing votes
  await prisma.pollVote.deleteMany({
    where: { pollId, userId: session.user.id },
  });

  // Create new votes
  await prisma.pollVote.createMany({
    data: optionIds.map((optionId) => ({
      pollId,
      optionId,
      userId: session.user.id,
    })),
  });

  // ... rest of function ...
}
```

**Estimated Fix Time**: 4 hours

---

### HIGH-4: Collaborator Invitation Email Injection Risk

**Severity**: HIGH ⚠️
**CWE**: CWE-74 - Improper Neutralization of Special Elements
**OWASP**: A03:2021 - Injection
**File**: `/home/user/WanderPlan/src/app/api/trips/[tripId]/collaborators/route.ts:186-193`

**Description**:
The collaborator invitation endpoint passes user-controlled data (inviter name, trip title, optional message) to an email sending function without proper sanitization. This could allow email header injection or phishing attacks.

**Vulnerable Code**:
```typescript
// Send invitation email
await sendCollaboratorInvitation({
  to: inviteeUser.email,
  inviterName: `${session.user.firstName} ${session.user.lastName}`,
  tripTitle: trip.title,
  role,
  message, // User-controlled optional message
  invitationId: collaborator.id,
});
```

**Issues**:
1. **User firstName/lastName**: Could contain newlines or special characters if not validated during registration
2. **Trip title**: User-controlled, could contain injection payloads
3. **Optional message**: User-controlled, limited to 500 chars but not sanitized

**Attack Scenarios**:

**Scenario 1: Email Header Injection**
```javascript
// If firstName contains CRLF characters
POST /api/trips/[tripId]/collaborators
{
  "email": "victim@example.com",
  "role": "VIEWER"
}

// If user's firstName is: "John\r\nBcc: spam@list.com"
// Email headers could be injected:
From: John
Bcc: spam@list.com <john@example.com>
To: victim@example.com
```

**Scenario 2: Phishing via Message Field**
```javascript
POST /api/trips/[tripId]/collaborators
{
  "email": "victim@example.com",
  "role": "VIEWER",
  "message": "URGENT: Click here to verify your account: https://evil.com/phishing"
}
```

**Impact**:
- Email header injection (if email library doesn't sanitize)
- Phishing messages sent to invitees
- Reputation damage to email sender
- Spam complaints
- Email deliverability issues

**Remediation**:

```typescript
// 1. Add message validation
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']),
  message: z
    .string()
    .max(500)
    .regex(/^[a-zA-Z0-9\s.,!?'-]+$/, 'Message contains invalid characters')
    .optional()
    .transform(val => val?.trim()),
});

// 2. Sanitize all inputs before sending
import DOMPurify from 'isomorphic-dompurify'; // Or similar

await sendCollaboratorInvitation({
  to: inviteeUser.email,
  inviterName: sanitizeForEmail(`${session.user.firstName} ${session.user.lastName}`),
  tripTitle: sanitizeForEmail(trip.title),
  role,
  message: message ? DOMPurify.sanitize(message, { ALLOWED_TAGS: [] }) : undefined,
  invitationId: collaborator.id,
});

function sanitizeForEmail(input: string): string {
  return input
    .replace(/[\r\n]/g, '') // Remove newlines
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 200); // Limit length
}

// 3. Validate user names during registration
// In registration validation:
firstName: z.string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
```

**Estimated Fix Time**: 3 hours

---

## MEDIUM Priority Issues

### MEDIUM-1: Idea Voting Allows Vote Manipulation via Rapid Toggle

**Severity**: MEDIUM ⚠️
**CWE**: CWE-799 - Improper Control of Interaction Frequency
**OWASP**: A04:2021 - Insecure Design
**File**: `/home/user/WanderPlan/src/app/api/trips/[tripId]/ideas/[id]/vote/route.ts`

**Description**:
Similar to poll voting, idea voting has no rate limiting and allows users to rapidly toggle votes (upvote → downvote → remove → upvote) unlimited times.

**Vulnerable Code**:
```typescript
if (vote === 0) {
  // Remove vote
  await prisma.ideaVote.deleteMany({
    where: { ideaId, userId: session.user.id },
  });
} else {
  // Upsert vote (update if exists, create if doesn't)
  await prisma.ideaVote.upsert({
    where: { ideaId_userId: { ideaId, userId: session.user.id } },
    update: { vote },
    create: { ideaId, userId: session.user.id, vote },
  });
}
```

**Impact**:
- Vote count manipulation via rapid toggling
- Real-time broadcast spam
- Database write amplification
- Unfair idea ranking

**Recommendation**:
```typescript
// Add rate limiting
const { success } = await voteRateLimit.limit(
  `idea:${ideaId}:user:${session.user.id}`
);

if (!success) {
  return NextResponse.json(
    { error: 'Too many vote changes. Please wait.' },
    { status: 429 }
  );
}
```

**Estimated Fix Time**: 2 hours

---

### MEDIUM-2: Message Content Length Could Enable Database DoS

**Severity**: MEDIUM ⚠️
**CWE**: CWE-770 - Allocation of Resources Without Limits
**OWASP**: A04:2021 - Insecure Design
**File**: `/home/user/WanderPlan/src/lib/validations/message.ts:16`

**Description**:
Messages are limited to 10,000 characters, which is very large. Combined with no rate limiting, this could enable database DoS via large message spam.

**Vulnerable Code**:
```typescript
content: z
  .string()
  .min(1, 'Message content is required')
  .max(10000, 'Message content must be less than 10,000 characters')
  .trim(),
```

**Impact**:
- Database storage exhaustion
- Slow query performance
- UI rendering issues with very long messages
- Increased bandwidth costs

**Calculation**:
```
10,000 characters × 1,000 messages = 10 MB of text
Without rate limiting, one user could spam 10 MB per minute
```

**Recommendation**:
```typescript
// Reduce max length
content: z
  .string()
  .min(1, 'Message content is required')
  .max(2000, 'Message content must be less than 2,000 characters') // More reasonable
  .trim(),

// Add character count warning in UI at 1,500 characters
```

**Estimated Fix Time**: 1 hour

---

### MEDIUM-3: Real-time Event Authorization Not Enforced

**Severity**: MEDIUM ⚠️
**CWE**: CWE-862 - Missing Authorization
**OWASP**: A01:2021 - Broken Access Control
**File**: `/home/user/WanderPlan/src/lib/realtime/server.ts:113-143`

**Description**:
The Socket.io server verifies trip access when joining a room, but doesn't re-verify permissions before broadcasting events. A user who was a collaborator but gets removed could still receive real-time events if their socket connection is still active.

**Vulnerable Code**:
```typescript
socket.on(SocketEvent.JOIN_TRIP, async (tripId: string) => {
  try {
    // Verify user has access to trip
    const hasAccess = await verifyTripAccess(socket.userId!, tripId);

    if (!hasAccess) {
      socket.emit(SocketEvent.ERROR, { error: 'Access denied' });
      return;
    }

    // Join room
    socket.join(`trip:${tripId}`);

    // No periodic re-verification of access
  }
});
```

**Attack Scenario**:
```
1. User A is added as collaborator to Trip X
2. User A connects to WebSocket and joins trip room
3. User A is removed as collaborator by trip owner
4. User A's WebSocket connection stays active
5. User A continues to receive real-time messages, ideas, polls
```

**Impact**:
- Removed collaborators still see real-time updates
- Sensitive information leaked after access revoked
- Privacy violations

**Remediation**:
```typescript
// Option 1: Re-verify access periodically
setInterval(async () => {
  const rooms = io.sockets.adapter.rooms;

  for (const [roomName, sockets] of rooms) {
    if (!roomName.startsWith('trip:')) continue;

    const tripId = roomName.replace('trip:', '');

    for (const socketId of sockets) {
      const socket = io.sockets.sockets.get(socketId) as AuthenticatedSocket;
      if (!socket?.userId) continue;

      const hasAccess = await verifyTripAccess(socket.userId, tripId);

      if (!hasAccess) {
        socket.leave(roomName);
        socket.emit(SocketEvent.ERROR, {
          error: 'Access to this trip has been revoked',
        });
      }
    }
  }
}, 60000); // Check every minute

// Option 2: Force disconnect on collaborator removal
// In collaborator removal API:
import { getSocketServer } from '@/lib/realtime/server';

await prisma.tripCollaborator.delete({
  where: { id: collaboratorId },
});

// Disconnect removed collaborator's sockets
const io = getSocketServer();
if (io) {
  const sockets = await io.in(`trip:${tripId}`).fetchSockets();
  for (const socket of sockets) {
    if ((socket as any).userId === collaborator.userId) {
      socket.leave(`trip:${tripId}`);
      socket.emit(SocketEvent.ERROR, {
        error: 'You have been removed from this trip',
      });
    }
  }
}
```

**Estimated Fix Time**: 3 hours

---

## LOW Priority Issues

### LOW-1: Missing Input Sanitization for Display Names

**Severity**: LOW ℹ️
**CWE**: CWE-79 - Cross-site Scripting (XSS)
**OWASP**: A03:2021 - Injection
**File**: Various message/idea/poll responses

**Description**:
User names and content are returned in API responses without sanitization. While React auto-escapes, explicit sanitization is a defense-in-depth measure.

**Recommendation**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize before storing
const message = await prisma.message.create({
  data: {
    content: DOMPurify.sanitize(content, { ALLOWED_TAGS: [] }),
    // ...
  },
});
```

**Estimated Fix Time**: 2 hours

---

### LOW-2: Collaborator Role Change Lacks Validation for Edge Cases

**Severity**: LOW ℹ️
**CWE**: CWE-20 - Improper Input Validation
**OWASP**: A04:2021 - Insecure Design
**File**: `/home/user/WanderPlan/src/app/api/trips/[tripId]/collaborators/[id]/route.ts:27-188`

**Description**:
The role change endpoint validates permissions but doesn't prevent edge cases like:
- Changing a VIEWER to ADMIN in one step (should require owner approval)
- Role changes while other admins are making changes

**Recommendation**:
```typescript
// Require approval workflow for VIEWER → ADMIN
if (collaborator.role === 'VIEWER' && newRole === 'ADMIN') {
  // Create approval request instead of immediate change
  await prisma.roleChangeRequest.create({
    data: {
      collaboratorId,
      requestedRole: 'ADMIN',
      requestedBy: session.user.id,
      status: 'PENDING',
    },
  });

  return NextResponse.json({
    message: 'Role change request sent to trip owner for approval',
  });
}
```

**Estimated Fix Time**: 2 hours

---

## OWASP Top 10 (2021) Assessment

### A01:2021 - Broken Access Control
**Status**: ❌ **FAIL - CRITICAL**

**Findings**:
- ❌ **CRITICAL-1**: Middleware authentication still disabled
- ❌ **CRITICAL-3**: WebSocket authentication bypass
- ⚠️ **HIGH-2**: Message deletion over-permissive
- ⚠️ **MEDIUM-3**: Real-time event authorization not enforced
- ✅ API routes implement authentication checks
- ✅ Role-based authorization (OWNER/ADMIN/EDITOR/VIEWER) implemented correctly

**Risk Score**: CRITICAL

---

### A02:2021 - Cryptographic Failures
**Status**: ✅ **PASS**

**Findings**:
- ✅ Passwords hashed with bcrypt
- ✅ NextAuth.js JWT tokens signed securely
- ✅ Sessions stored securely
- ✅ No sensitive data in API responses
- ✅ API keys in environment variables

**Risk Score**: LOW

---

### A03:2021 - Injection
**Status**: ✅ **PASS with HIGH Priority Issue**

**Findings**:
- ✅ SQL injection prevented via Prisma ORM
- ✅ Comprehensive Zod validation on all inputs
- ⚠️ **HIGH-4**: Email injection risk in collaborator invitations
- ✅ Message content validated (max 10,000 chars)
- ✅ No NoSQL injection (using PostgreSQL + Prisma)
- ✅ No command injection risks

**Validation Coverage**:
| Input Type | Validated | Method |
|------------|-----------|--------|
| Messages | ✅ | Zod (1-10,000 chars) |
| Ideas | ✅ | Zod (1-200 title, 1-5,000 desc) |
| Polls | ✅ | Zod (1-500 question, 2-10 options) |
| Votes | ✅ | Enum validation |
| Emails | ✅ | Email format validation |

**Risk Score**: MEDIUM (after fixing HIGH-4: LOW)

---

### A04:2021 - Insecure Design
**Status**: ❌ **FAIL - HIGH**

**Findings**:
- ❌ **HIGH-1**: NO rate limiting on any endpoint
- ⚠️ **HIGH-3**: Poll vote manipulation possible
- ⚠️ **MEDIUM-1**: Idea vote manipulation possible
- ⚠️ **MEDIUM-2**: Large message content limit
- ✅ Proper error handling
- ✅ Authorization model clear

**Risk Score**: HIGH

---

### A05:2021 - Security Misconfiguration
**Status**: ❌ **FAIL - CRITICAL**

**Findings**:
- ❌ **CRITICAL-2**: Missing security headers (UNRESOLVED)
- ❌ **CRITICAL-3**: Weak WebSocket authentication
- ✅ Environment variables used for secrets
- ✅ .env.example provided

**Risk Score**: CRITICAL

---

### A06:2021 - Vulnerable and Outdated Components
**Status**: ✅ **PASS - EXCELLENT**

**npm audit Results**:
```json
{
  "vulnerabilities": {
    "total": 0
  },
  "dependencies": {
    "prod": 246,
    "dev": 887,
    "total": 1141
  }
}
```

**New Dependencies**:
- `socket.io@4.8.1` - Latest, no vulnerabilities ✅
- `socket.io-client@4.8.1` - Latest, no vulnerabilities ✅

**Risk Score**: NONE

---

### A07:2021 - Identification and Authentication Failures
**Status**: ❌ **FAIL - CRITICAL**

**Findings**:
- ❌ **CRITICAL-1**: Middleware disabled (UNRESOLVED)
- ❌ **CRITICAL-3**: WebSocket authentication bypass
- ✅ NextAuth.js v5 configured properly
- ✅ Login rate limiting exists (from Phase 1)
- ✅ Session management secure

**Risk Score**: CRITICAL

---

### A08:2021 - Software and Data Integrity Failures
**Status**: ✅ **PASS**

**Findings**:
- ✅ No unsigned or unverified updates
- ✅ Dependencies verified via npm
- ✅ No use of untrusted CDNs
- ✅ Prisma migrations version controlled
- ✅ Foreign key constraints enforced
- ✅ Atomic operations for voting

**Risk Score**: LOW

---

### A09:2021 - Security Logging and Monitoring Failures
**Status**: ⚠️ **PASS with ISSUES**

**Findings**:
- ⚠️ Insufficient security event logging
- ✅ Errors logged to console
- ❌ Authorization failures not logged
- ❌ Vote manipulation not detected
- ❌ No centralized logging service
- ✅ Activity log for collaborator changes

**Current Logging**:
```typescript
// What's logged:
await prisma.activity.create({
  data: {
    tripId,
    userId: session.user.id,
    type: 'COLLABORATOR_INVITED',
    // ...
  },
});

// What's NOT logged:
// - Message deletions by admins
// - Rapid vote changes
// - WebSocket authentication failures
// - Rate limit violations (no rate limiting)
```

**Risk Score**: MEDIUM

---

### A10:2021 - Server-Side Request Forgery (SSRF)
**Status**: ✅ **PASS**

**Findings**:
- ✅ No user-controlled URLs
- ✅ All external APIs hardcoded
- ✅ No arbitrary URL fetching
- ✅ Email service controlled (Resend)

**Risk Score**: NONE

---

## Real-time Security Analysis

### WebSocket Authentication
**Status**: ❌ **CRITICAL**

**Issues**:
- ❌ **CRITICAL-3**: Authentication bypass possible
- ❌ No rate limiting on connections
- ❌ No session validation after initial connect
- ⚠️ **MEDIUM-3**: No periodic access re-verification

### Room Isolation
**Status**: ✅ **GOOD**

**Findings**:
- ✅ Trip access verified before joining room
- ✅ Users can only join rooms they have access to
- ✅ Room naming convention secure (`trip:${tripId}`)
- ⚠️ But no re-verification after collaborator removal

### Event Authorization
**Status**: ⚠️ **ACCEPTABLE**

**Findings**:
- ✅ Events only broadcast to trip room members
- ✅ User ID attached to socket prevents impersonation
- ⚠️ But removed collaborators still get events

### Message Injection
**Status**: ✅ **GOOD**

**Findings**:
- ✅ All WebSocket events use structured data
- ✅ No eval() or code execution
- ✅ Event handlers validate event types
- ✅ Data passed through Zod validation

---

## Authorization Matrix

### Collaborator Management
| Action | Owner | Admin | Editor | Viewer | Non-Member |
|--------|-------|-------|--------|--------|------------|
| View Collaborators | ✅ | ✅ | ✅ | ✅ | ❌ |
| Invite VIEWER | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite EDITOR | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite ADMIN | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change Role | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change to ADMIN | ✅ | ❌ | ❌ | ❌ | ❌ |
| Remove Collaborator | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remove ADMIN | ✅ | ❌ | ❌ | ❌ | ❌ |

### Messaging
| Action | Owner | Admin | Editor | Viewer | Non-Member |
|--------|-------|-------|--------|--------|------------|
| View Messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Send Message | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Own Message | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Own Message | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Any Message | ✅ | ✅ | ❌ | ❌ | ❌ |

⚠️ **Issue**: Admins can delete owner messages (HIGH-2)

### Ideas & Voting
| Action | Owner | Admin | Editor | Viewer | Non-Member |
|--------|-------|-------|--------|--------|------------|
| View Ideas | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Idea | ✅ | ✅ | ✅ | ✅ | ❌ |
| Vote on Idea | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Own Idea | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Own Idea | ✅ | ✅ | ✅ | ✅ | ❌ |
| Change Idea Status | ✅ | ✅ | ❌ | ❌ | ❌ |

### Polls
| Action | Owner | Admin | Editor | Viewer | Non-Member |
|--------|-------|-------|--------|--------|------------|
| View Polls | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Poll | ✅ | ✅ | ✅ | ✅ | ❌ |
| Vote on Poll | ✅ | ✅ | ✅ | ✅ | ❌ |
| Close Own Poll | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Own Poll | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## Dependency Security Analysis

### New Dependencies Added in Phase 4

**Socket.io Ecosystem**:
```json
{
  "socket.io": "^4.8.1",
  "socket.io-client": "^4.8.1"
}
```

**Security Assessment**:
- ✅ Latest stable versions
- ✅ No known vulnerabilities
- ✅ Active maintenance
- ✅ Regular security updates
- ✅ Large community (good security oversight)

**Socket.io Security Features Used**:
- ✅ CORS configuration
- ✅ Custom authentication middleware
- ⚠️ But implementation has vulnerabilities (CRITICAL-3)

---

## Recommendations Summary

### Immediate (CRITICAL) - Must Fix Before Production

1. **CRITICAL-1**: Re-enable middleware authentication (UNRESOLVED - 2 hours)
2. **CRITICAL-2**: Add security headers (UNRESOLVED - 1 hour)
3. **CRITICAL-3**: Fix WebSocket authentication (NEW - 4 hours)

**Total Time**: 7 hours

### Short-term (HIGH) - Fix in Current Phase

1. **HIGH-1**: Implement rate limiting on ALL endpoints (10 hours)
2. **HIGH-2**: Fix message deletion authorization (3 hours)
3. **HIGH-3**: Add poll vote manipulation protection (4 hours)
4. **HIGH-4**: Sanitize collaborator invitation inputs (3 hours)

**Total Time**: 20 hours

### Medium-term (MEDIUM) - Address Soon

1. **MEDIUM-1**: Add idea voting rate limits (2 hours)
2. **MEDIUM-2**: Reduce message content max length (1 hour)
3. **MEDIUM-3**: Implement real-time authorization re-verification (3 hours)

**Total Time**: 6 hours

### Long-term (LOW) - Nice to Have

1. **LOW-1**: Add input sanitization (2 hours)
2. **LOW-2**: Role change validation improvements (2 hours)

**Total Time**: 4 hours

### Total Estimated Fix Time
**37 hours** (CRITICAL + HIGH + MEDIUM + LOW)

---

## Production Readiness Checklist

### Security (Phase 4 Scope)
- [ ] ❌ **BLOCKER**: Fix CRITICAL-1 (middleware authentication)
- [ ] ❌ **BLOCKER**: Fix CRITICAL-2 (security headers)
- [ ] ❌ **BLOCKER**: Fix CRITICAL-3 (WebSocket authentication)
- [ ] ⚠️ Fix HIGH-1 (rate limiting on all endpoints)
- [ ] ⚠️ Fix HIGH-2 (message deletion authorization)
- [ ] ⚠️ Fix HIGH-3 (poll vote manipulation)
- [ ] ⚠️ Fix HIGH-4 (email injection)

### Infrastructure
- [ ] Environment variables configured
- [ ] Database connection secured (SSL)
- [ ] Logging service configured
- [ ] WebSocket monitoring set up
- [ ] Rate limiting infrastructure (Redis/Upstash)

### Real-time Features
- [ ] WebSocket authentication hardened
- [ ] Room isolation verified
- [ ] Connection rate limiting implemented
- [ ] Session re-validation configured
- [ ] Event authorization enforced

---

## Conclusion

Phase 4 introduces **critical collaboration and real-time features** with generally sound implementation patterns. However, the phase is **NOT PRODUCTION READY** due to:

1. **3 CRITICAL security issues** (2 unresolved from Phase 3, 1 new)
2. **Complete absence of rate limiting** on all collaboration endpoints
3. **WebSocket security vulnerabilities** that could enable unauthorized access

**Positive Aspects**:
- ✅ Comprehensive Zod validation on all inputs
- ✅ SQL injection prevention via Prisma ORM
- ✅ Role-based authorization implemented correctly
- ✅ Activity logging for collaborator changes
- ✅ No dependency vulnerabilities

**Critical Gaps**:
- ❌ Middleware authentication disabled (affects all phases)
- ❌ Missing security headers (affects all phases)
- ❌ WebSocket authentication bypassable (new in Phase 4)
- ❌ Zero rate limiting (enables spam, DoS, vote manipulation)
- ⚠️ Authorization issues (message deletion, real-time events)

**Recommendation**:

⚠️ **DO NOT PROCEED TO PRODUCTION** until:
1. All 3 CRITICAL issues are resolved
2. Rate limiting is implemented on all endpoints
3. HIGH priority authorization issues are fixed

**Security Score**: 58/100 (Acceptable code quality, but critical configuration and design gaps)

---

**Next Steps**:

1. **URGENT**: Address blocker-003 (CRITICAL-1 and CRITICAL-2)
2. **URGENT**: Fix CRITICAL-3 (WebSocket authentication)
3. **HIGH PRIORITY**: Implement comprehensive rate limiting (HIGH-1)
4. **HIGH PRIORITY**: Fix authorization issues (HIGH-2, HIGH-3, HIGH-4)
5. Plan security hardening sprint before production

---

**Report Generated**: 2025-11-14T18:30:00Z
**Agent**: Security Agent
**Phase**: Phase 4 - Collaboration & Communication
**Status**: ❌ **FAIL - CRITICAL ISSUES PRESENT**
