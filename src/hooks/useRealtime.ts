/**
 * Real-time Hooks
 *
 * React hooks for Socket.io real-time functionality.
 *
 * Features:
 * - Socket connection management
 * - Trip room subscriptions
 * - Event listeners
 * - Typing indicators
 * - Online presence
 *
 * @module
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  connectSocket,
  disconnectSocket,
  joinTripRoom,
  leaveTripRoom,
  onSocketEvent,
  emitSocketEvent,
  isSocketConnected,
  getSocket,
} from '@/lib/realtime/client';
import { SocketEvent } from '@/lib/realtime/server';

/**
 * Hook to manage socket connection
 *
 * Automatically connects when user is authenticated
 * and disconnects on unmount.
 */
export function useSocketConnection() {
  const { data: session, status } = useSession();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      connectSocket();

      const socket = getSocket();

      const handleConnect = () => setConnected(true);
      const handleDisconnect = () => setConnected(false);

      socket?.on('connect', handleConnect);
      socket?.on('disconnect', handleDisconnect);

      // Set initial state
      setConnected(isSocketConnected());

      return () => {
        socket?.off('connect', handleConnect);
        socket?.off('disconnect', handleDisconnect);
      };
    }

    return undefined;
  }, [status, session]);

  return { connected };
}

/**
 * Hook to join/leave a trip room
 *
 * Automatically joins room on mount and leaves on unmount.
 */
export function useTripRoom(tripId: string | null) {
  const { connected } = useSocketConnection();
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    if (!tripId || !connected) {
      return undefined;
    }

    // Join room
    joinTripRoom(tripId);
    setInRoom(true);

    // Leave room on cleanup
    return () => {
      leaveTripRoom(tripId);
      setInRoom(false);
    };
  }, [tripId, connected]);

  return { inRoom };
}

/**
 * Hook to subscribe to a socket event
 *
 * @example
 * useSocketEvent(SocketEvent.MESSAGE_RECEIVED, (message) => {
 *   console.log('New message:', message);
 * });
 */
export function useSocketEvent<T = any>(
  event: SocketEvent | string,
  callback: (data: T) => void
) {
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = onSocketEvent<T>(event, (data) => {
      callbackRef.current(data);
    });

    return unsubscribe;
  }, [event]);
}

/**
 * Hook for typing indicators
 *
 * @example
 * const { startTyping, stopTyping, typingUsers } = useTypingIndicator(tripId);
 */
export function useTypingIndicator(tripId: string | null) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!tripId) return;

    emitSocketEvent(SocketEvent.TYPING_START, { tripId });

    // Auto-stop typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [tripId]);

  const stopTyping = useCallback(() => {
    if (!tripId) return;

    emitSocketEvent(SocketEvent.TYPING_STOP, { tripId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [tripId]);

  // Listen for typing events from others
  useSocketEvent<{ userId: string; tripId: string }>(
    SocketEvent.TYPING_START,
    useCallback(
      ({ userId, tripId: eventTripId }) => {
        if (eventTripId === tripId) {
          setTypingUsers((prev) => new Set(prev).add(userId));
        }
      },
      [tripId]
    )
  );

  useSocketEvent<{ userId: string; tripId: string }>(
    SocketEvent.TYPING_STOP,
    useCallback(
      ({ userId, tripId: eventTripId }) => {
        if (eventTripId === tripId) {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }
      },
      [tripId]
    )
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    startTyping,
    stopTyping,
    typingUsers: Array.from(typingUsers),
  };
}

/**
 * Hook for online presence
 *
 * @example
 * const { onlineUsers } = useOnlinePresence(tripId);
 */
export function useOnlinePresence(tripId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // User came online
  useSocketEvent<{ userId: string; tripId: string }>(
    SocketEvent.USER_ONLINE,
    useCallback(
      ({ userId, tripId: eventTripId }) => {
        if (eventTripId === tripId) {
          setOnlineUsers((prev) => new Set(prev).add(userId));
        }
      },
      [tripId]
    )
  );

  // User went offline
  useSocketEvent<{ userId: string; tripId: string }>(
    SocketEvent.USER_OFFLINE,
    useCallback(
      ({ userId, tripId: eventTripId }) => {
        if (eventTripId === tripId) {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }
      },
      [tripId]
    )
  );

  return {
    onlineUsers: Array.from(onlineUsers),
  };
}

/**
 * Hook for real-time messages
 *
 * @example
 * const { messages } = useRealtimeMessages(tripId, (message) => {
 *   // Handle new message
 * });
 */
export function useRealtimeMessages(
  tripId: string | null,
  onMessage?: (message: any) => void
) {
  useTripRoom(tripId);

  useSocketEvent(
    SocketEvent.MESSAGE_RECEIVED,
    useCallback(
      (message: any) => {
        if (message.tripId === tripId && onMessage) {
          onMessage(message);
        }
      },
      [tripId, onMessage]
    )
  );

  useSocketEvent(
    SocketEvent.MESSAGE_DELETED,
    useCallback(
      (data: { messageId: string; tripId: string }) => {
        if (data.tripId === tripId && onMessage) {
          // Handle message deletion
        }
      },
      [tripId, onMessage]
    )
  );
}

/**
 * Hook for real-time activity feed
 *
 * @example
 * useRealtimeActivity(tripId, (activity) => {
 *   // Handle new activity
 * });
 */
export function useRealtimeActivity(
  tripId: string | null,
  onActivity?: (activity: any) => void
) {
  useTripRoom(tripId);

  useSocketEvent(
    SocketEvent.ACTIVITY_CREATED,
    useCallback(
      (activity: any) => {
        if (activity.tripId === tripId && onActivity) {
          onActivity(activity);
        }
      },
      [tripId, onActivity]
    )
  );
}

/**
 * Hook for real-time event updates
 *
 * @example
 * useRealtimeEvents(tripId, {
 *   onCreated: (event) => console.log('Created:', event),
 *   onUpdated: (event) => console.log('Updated:', event),
 *   onDeleted: (eventId) => console.log('Deleted:', eventId),
 * });
 */
export function useRealtimeEvents(
  tripId: string | null,
  handlers: {
    onCreated?: (event: any) => void;
    onUpdated?: (event: any) => void;
    onDeleted?: (eventId: string) => void;
    onReordered?: (data: any) => void;
  }
) {
  useTripRoom(tripId);

  const { onCreated, onUpdated, onDeleted, onReordered } = handlers;

  useSocketEvent(
    SocketEvent.EVENT_CREATED,
    useCallback(
      (event: any) => {
        if (event.tripId === tripId && onCreated) {
          onCreated(event);
        }
      },
      [tripId, onCreated]
    )
  );

  useSocketEvent(
    SocketEvent.EVENT_UPDATED,
    useCallback(
      (event: any) => {
        if (event.tripId === tripId && onUpdated) {
          onUpdated(event);
        }
      },
      [tripId, onUpdated]
    )
  );

  useSocketEvent(
    SocketEvent.EVENT_DELETED,
    useCallback(
      (data: { eventId: string; tripId: string }) => {
        if (data.tripId === tripId && onDeleted) {
          onDeleted(data.eventId);
        }
      },
      [tripId, onDeleted]
    )
  );

  useSocketEvent(
    SocketEvent.EVENT_REORDERED,
    useCallback(
      (data: any) => {
        if (data.tripId === tripId && onReordered) {
          onReordered(data);
        }
      },
      [tripId, onReordered]
    )
  );
}
