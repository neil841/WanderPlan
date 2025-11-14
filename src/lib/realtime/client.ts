/**
 * Socket.io Client
 *
 * Client-side Socket.io connection management.
 *
 * Features:
 * - Singleton socket instance
 * - Automatic reconnection
 * - Connection state management
 * - Event subscription helpers
 *
 * @module
 */

import { io, Socket } from 'socket.io-client';
import { SocketEvent } from './server';

let socket: Socket | null = null;

/**
 * Initialize Socket.io client
 */
export function initSocketClient(): Socket {
  if (socket) {
    return socket;
  }

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || '';

  socket = io(url, {
    path: '/api/socketio',
    autoConnect: false, // Connect manually when needed
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on(SocketEvent.ERROR, (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

/**
 * Get existing socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Connect to Socket.io server
 */
export function connectSocket(): void {
  if (!socket) {
    initSocketClient();
  }

  if (socket && !socket.connected) {
    socket.connect();
  }
}

/**
 * Disconnect from Socket.io server
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Join a trip room
 */
export function joinTripRoom(tripId: string): void {
  if (!socket?.connected) {
    connectSocket();
  }

  socket?.emit(SocketEvent.JOIN_TRIP, tripId);
}

/**
 * Leave a trip room
 */
export function leaveTripRoom(tripId: string): void {
  socket?.emit(SocketEvent.LEAVE_TRIP, tripId);
}

/**
 * Subscribe to an event
 */
export function onSocketEvent<T = any>(
  event: SocketEvent | string,
  callback: (data: T) => void
): () => void {
  if (!socket) {
    initSocketClient();
  }

  socket?.on(event, callback);

  // Return unsubscribe function
  return () => {
    socket?.off(event, callback);
  };
}

/**
 * Emit an event
 */
export function emitSocketEvent<T = any>(
  event: SocketEvent | string,
  data: T
): void {
  socket?.emit(event, data);
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}
