# Real-time Infrastructure with Socket.io

This directory contains the Socket.io setup for WanderPlan's real-time features.

## Architecture

- **Server**: `server.ts` - Socket.io server with authentication and room management
- **Client**: `client.ts` - Client-side Socket.io connection singleton
- **Hooks**: `hooks/useRealtime.ts` - React hooks for real-time subscriptions
- **Types**: `types/realtime.ts` - TypeScript type definitions

## Features

- ✅ WebSocket connections with authentication
- ✅ Trip-based room system
- ✅ Real-time messaging
- ✅ Activity feed updates
- ✅ Typing indicators
- ✅ Online presence tracking
- ✅ Event updates (create/update/delete)
- ✅ Automatic reconnection
- ✅ Event broadcasting

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
# Socket.io Server URL (for client)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 2. Custom Server Setup (Development)

For Next.js 14 App Router, Socket.io requires a custom server setup:

**Option A: Standalone Socket.io Server (Recommended for Production)**

Create `server.js` in the root:

\`\`\`javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocketServer } = require('./src/lib/realtime/server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  const io = initSocketServer(httpServer);
  global.socketio = io;

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(\`> Ready on http://\${hostname}:\${port}\`);
    console.log('> Socket.io server initialized');
  });
});
\`\`\`

Update `package.json`:

\`\`\`json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
\`\`\`

**Option B: Separate Socket.io Server (Recommended for Scale)**

Run Socket.io on a separate port (e.g., 3001):

\`\`\`javascript
// socket-server.js
const { createServer } = require('http');
const { initSocketServer } = require('./src/lib/realtime/server');

const port = parseInt(process.env.SOCKET_PORT || '3001', 10);
const httpServer = createServer();

const io = initSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log(\`Socket.io server running on port \${port}\`);
});
\`\`\`

Then update `.env.local`:

\`\`\`bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
\`\`\`

Run both servers:

\`\`\`bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Socket.io
node socket-server.js
\`\`\`

## Usage

### Connect to Socket.io

In your root layout or provider:

\`\`\`typescript
'use client';

import { useSocketConnection } from '@/hooks/useRealtime';

export function RealtimeProvider({ children }) {
  const { connected } = useSocketConnection();

  useEffect(() => {
    if (connected) {
      console.log('Real-time connected!');
    }
  }, [connected]);

  return <>{children}</>;
}
\`\`\`

### Join a Trip Room

\`\`\`typescript
import { useTripRoom } from '@/hooks/useRealtime';

function TripPage({ tripId }) {
  const { inRoom } = useTripRoom(tripId);

  // Automatically joins room on mount, leaves on unmount
  return <div>{inRoom ? 'Connected to trip' : 'Connecting...'}</div>;
}
\`\`\`

### Listen for Real-time Events

\`\`\`typescript
import { useSocketEvent } from '@/hooks/useRealtime';
import { SocketEvent } from '@/lib/realtime/server';

function MessageList({ tripId }) {
  useSocketEvent(SocketEvent.MESSAGE_RECEIVED, (message) => {
    console.log('New message:', message);
    // Update UI
  });

  return <div>Messages...</div>;
}
\`\`\`

### Typing Indicators

\`\`\`typescript
import { useTypingIndicator } from '@/hooks/useRealtime';

function ChatInput({ tripId }) {
  const { startTyping, stopTyping, typingUsers } = useTypingIndicator(tripId);

  return (
    <>
      <input
        onKeyDown={startTyping}
        onBlur={stopTyping}
        placeholder="Type a message..."
      />
      {typingUsers.length > 0 && (
        <div>{typingUsers.length} people typing...</div>
      )}
    </>
  );
}
\`\`\`

### Online Presence

\`\`\`typescript
import { useOnlinePresence } from '@/hooks/useRealtime';

function TripHeader({ tripId }) {
  const { onlineUsers } = useOnlinePresence(tripId);

  return <div>{onlineUsers.length} online</div>;
}
\`\`\`

### Real-time Events

\`\`\`typescript
import { useRealtimeEvents } from '@/hooks/useRealtime';

function ItineraryBuilder({ tripId }) {
  useRealtimeEvents(tripId, {
    onCreated: (event) => {
      // Refetch events or add to list
      queryClient.invalidateQueries(['events', tripId]);
    },
    onUpdated: (event) => {
      // Update event in list
    },
    onDeleted: (eventId) => {
      // Remove event from list
    },
  });

  return <div>Itinerary...</div>;
}
\`\`\`

## Broadcasting Events (Server-side)

From API routes or server actions:

\`\`\`typescript
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/lib/realtime/server';

// In an API route
export async function POST(request: NextRequest) {
  // Create message in database
  const message = await prisma.message.create({ ... });

  // Broadcast to all users in trip room
  broadcastToTrip(message.tripId, SocketEvent.MESSAGE_RECEIVED, message);

  return NextResponse.json(message);
}
\`\`\`

## Event Types

### Connection Events
- `connection` - User connected
- `disconnect` - User disconnected
- `trip:join` - Join trip room
- `trip:leave` - Leave trip room

### Message Events
- `message:sent` - Message sent (client → server)
- `message:received` - Message received (server → clients)
- `message:deleted` - Message deleted
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

### Activity Events
- `activity:created` - New activity created

### Collaborator Events
- `collaborator:joined` - Collaborator joined trip
- `collaborator:left` - Collaborator left trip
- `collaborator:role_changed` - Collaborator role changed

### Event Events
- `event:created` - Event created
- `event:updated` - Event updated
- `event:deleted` - Event deleted
- `event:reordered` - Events reordered

### Trip Events
- `trip:updated` - Trip details updated

### Presence Events
- `user:online` - User came online
- `user:offline` - User went offline

## Security

- ✅ Authentication required via NextAuth JWT
- ✅ Trip access verification before joining rooms
- ✅ User ID attached to socket for authorization
- ✅ Room-based isolation (users only receive events for trips they have access to)

## Performance

- Automatic reconnection with exponential backoff
- Connection pooling via singleton pattern
- Event-based architecture (no polling)
- Room-based broadcasting (only relevant users receive events)

## Production Deployment

### Vercel / Serverless

Socket.io requires a persistent connection, which doesn't work with serverless functions. Options:

1. **Deploy Socket.io separately** on a VPS (DigitalOcean, AWS EC2, Railway)
2. **Use a managed service** like Pusher, Ably, or Socket.io managed hosting
3. **Use Vercel Edge Functions** with WebSockets (experimental)

### Traditional Server (Railway, Heroku, AWS)

The custom server setup works perfectly. Just ensure:
- Set `NEXT_PUBLIC_SOCKET_URL` to your production domain
- Use HTTPS/WSS in production
- Configure CORS properly

## Testing

\`\`\`bash
# Start development servers
npm run dev

# Open browser console
# Check for "Socket connected: <id>"

# Join a trip page
# Check for "User <userId> joined trip:<tripId>"

# Open same trip in another browser/tab
# Test real-time updates
\`\`\`

## Troubleshooting

### Connection Issues

- Check `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Ensure custom server is running (not just `next dev`)
- Check browser console for connection errors
- Verify NextAuth session is active

### Events Not Received

- Confirm you've joined the trip room with `useTripRoom(tripId)`
- Check server logs for broadcasting events
- Verify trip access permissions
- Ensure event listeners are set up before events are emitted

### Performance Issues

- Use room-based broadcasting (don't emit to all sockets)
- Implement rate limiting for high-frequency events (typing)
- Consider debouncing client-side events
- Monitor connection count and server resources
