/**
 * Socket.io Server Setup
 *
 * WebSocket server for real-time features (messaging, activity feed, notifications).
 *
 * Features:
 * - Socket.io integration with Next.js
 * - Room-based architecture (trip rooms)
 * - Authentication for socket connections
 * - Connection/disconnection handling
 * - Event broadcasting
 *
 * @module
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { SocketEvent } from './events';

export type SocketServer = SocketIOServer;

// Re-export SocketEvent for backward compatibility
export { SocketEvent };

/**
 * Authenticated socket with user info
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

/**
 * Connection rate limiter
 * Limits connections per IP address to prevent DoS attacks
 */
const connectionAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_CONNECTIONS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = connectionAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    // First attempt or window expired
    connectionAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (attempt.count >= MAX_CONNECTIONS_PER_MINUTE) {
    return false; // Rate limit exceeded
  }

  attempt.count++;
  return true;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempt] of connectionAttempts.entries()) {
    if (now > attempt.resetAt) {
      connectionAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Connection tracking for per-user limits
 */
const userConnections = new Map<string, number>();
const MAX_CONNECTIONS_PER_USER = 5; // Max 5 concurrent connections per user

/**
 * Initialize Socket.io server
 */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/api/socketio',
    // Connection limits and performance tuning
    maxHttpBufferSize: 1e6, // 1 MB max message size
    pingTimeout: 20000, // 20 seconds - disconnect if no pong received
    pingInterval: 25000, // 25 seconds - send ping to check connection
    connectTimeout: 45000, // 45 seconds - max time to establish connection
    transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
    // Resource limits
    maxConnections: 1000, // Max 1000 concurrent connections to server
    allowUpgrades: true, // Allow transport upgrades (polling -> websocket)
    perMessageDeflate: {
      threshold: 1024, // Only compress messages > 1KB
    },
  });

  // Rate limiting middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    const ip = socket.handshake.address || 'unknown';

    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return next(new Error('Too many connection attempts. Please try again later.'));
    }

    next();
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Validate NEXTAUTH_SECRET exists
      if (!process.env.NEXTAUTH_SECRET) {
        console.error('CRITICAL: NEXTAUTH_SECRET environment variable is not set');
        return next(new Error('Server configuration error'));
      }

      const token = await getToken({
        req: socket.request as any,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Strict authentication check
      if (!token || !token.sub || !token.email) {
        console.warn('Socket connection rejected: Invalid or missing token');
        return next(new Error('Unauthorized: Invalid authentication token'));
      }

      // Verify user exists in database (prevents deleted user connections)
      const user = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { id: true, email: true },
      });

      if (!user) {
        console.warn(`Socket connection rejected: User ${token.sub} not found in database`);
        return next(new Error('Unauthorized: User not found'));
      }

      // Attach user info to socket
      socket.userId = token.sub;
      socket.userEmail = token.email;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error')));
    }
  });

  // Connection handler
  io.on(SocketEvent.CONNECTION, (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    // Track user connections
    const currentConnections = userConnections.get(userId) || 0;
    if (currentConnections >= MAX_CONNECTIONS_PER_USER) {
      console.warn(`User ${userId} exceeded max connections (${MAX_CONNECTIONS_PER_USER})`);
      socket.emit(SocketEvent.ERROR, {
        error: 'Maximum concurrent connections exceeded',
      });
      socket.disconnect(true);
      return;
    }
    userConnections.set(userId, currentConnections + 1);

    console.log(`User connected: ${userId} (${socket.id}) - ${currentConnections + 1}/${MAX_CONNECTIONS_PER_USER} connections`);

    // Join trip room
    socket.on(SocketEvent.JOIN_TRIP, async (tripId: string) => {
      try {
        // Verify user has access to trip
        const hasAccess = await verifyTripAccess(socket.userId!, tripId);

        if (!hasAccess) {
          socket.emit(SocketEvent.ERROR, {
            event: SocketEvent.JOIN_TRIP,
            error: 'Access denied to trip',
          });
          return;
        }

        // Join room
        socket.join(`trip:${tripId}`);

        // Notify others in room
        socket.to(`trip:${tripId}`).emit(SocketEvent.USER_ONLINE, {
          userId: socket.userId,
          tripId,
        });

        console.log(`User ${socket.userId} joined trip:${tripId}`);
      } catch (error) {
        console.error('Error joining trip:', error);
        socket.emit(SocketEvent.ERROR, {
          event: SocketEvent.JOIN_TRIP,
          error: 'Failed to join trip',
        });
      }
    });

    // Leave trip room
    socket.on(SocketEvent.LEAVE_TRIP, (tripId: string) => {
      socket.leave(`trip:${tripId}`);

      // Notify others
      socket.to(`trip:${tripId}`).emit(SocketEvent.USER_OFFLINE, {
        userId: socket.userId,
        tripId,
      });

      console.log(`User ${socket.userId} left trip:${tripId}`);
    });

    // Typing indicators
    socket.on(SocketEvent.TYPING_START, ({ tripId }: { tripId: string }) => {
      socket.to(`trip:${tripId}`).emit(SocketEvent.TYPING_START, {
        userId: socket.userId,
        tripId,
      });
    });

    socket.on(SocketEvent.TYPING_STOP, ({ tripId }: { tripId: string }) => {
      socket.to(`trip:${tripId}`).emit(SocketEvent.TYPING_STOP, {
        userId: socket.userId,
        tripId,
      });
    });

    // Disconnect handler
    socket.on(SocketEvent.DISCONNECT, () => {
      // Decrement user connection count
      const currentConnections = userConnections.get(userId) || 1;
      const newCount = currentConnections - 1;
      if (newCount <= 0) {
        userConnections.delete(userId);
      } else {
        userConnections.set(userId, newCount);
      }

      console.log(`User disconnected: ${userId} (${socket.id}) - ${newCount}/${MAX_CONNECTIONS_PER_USER} connections remaining`);
    });
  });

  return io;
}

/**
 * Verify user has access to a trip
 */
async function verifyTripAccess(
  userId: string,
  tripId: string
): Promise<boolean> {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      deletedAt: null,
      OR: [
        { createdBy: userId },
        {
          collaborators: {
            some: {
              userId,
              status: 'ACCEPTED',
            },
          },
        },
      ],
    },
  });

  return !!trip;
}

/**
 * Get Socket.io server instance
 * (will be attached to global in server.ts)
 */
export function getSocketServer(): SocketIOServer | null {
  if (typeof window !== 'undefined') {
    return null; // Client-side
  }

  return (global as any).socketio || null;
}

/**
 * Broadcast event to trip room
 */
export function broadcastToTrip(
  tripId: string,
  event: SocketEvent,
  data: any
): void {
  const io = getSocketServer();
  if (io) {
    io.to(`trip:${tripId}`).emit(event, data);
  }
}

/**
 * Broadcast event to specific user
 */
export function broadcastToUser(
  userId: string,
  event: SocketEvent,
  data: any
): void {
  const io = getSocketServer();
  if (io) {
    // Find all sockets for this user
    const sockets = Array.from(io.sockets.sockets.values()).filter(
      (socket: any) => socket.userId === userId
    );

    sockets.forEach((socket) => {
      socket.emit(event, data);
    });
  }
}
