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

export type SocketServer = SocketIOServer;

/**
 * Authenticated socket with user info
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

/**
 * Socket event types
 */
export enum SocketEvent {
  // Connection
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Trip rooms
  JOIN_TRIP = 'trip:join',
  LEAVE_TRIP = 'trip:leave',

  // Messages
  MESSAGE_SENT = 'message:sent',
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_DELETED = 'message:deleted',
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',

  // Activity
  ACTIVITY_CREATED = 'activity:created',

  // Collaborators
  COLLABORATOR_JOINED = 'collaborator:joined',
  COLLABORATOR_LEFT = 'collaborator:left',
  COLLABORATOR_ROLE_CHANGED = 'collaborator:role_changed',

  // Events
  EVENT_CREATED = 'event:created',
  EVENT_UPDATED = 'event:updated',
  EVENT_DELETED = 'event:deleted',
  EVENT_REORDERED = 'event:reordered',

  // Trip updates
  TRIP_UPDATED = 'trip:updated',

  // Presence
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
}

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
  });

  // Authentication middleware
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

  // Connection handler
  io.on(SocketEvent.CONNECTION, (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.id})`);

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
      console.log(`User disconnected: ${socket.userId} (${socket.id})`);
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
