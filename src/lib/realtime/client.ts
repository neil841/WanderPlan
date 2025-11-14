/**
 * Socket.io Client (Code-Split)
 *
 * Client-side Socket.io connection management with dynamic imports
 * for optimal bundle size. Socket.io client library (~200KB) is only
 * loaded when real-time features are actually used.
 *
 * Features:
 * - Singleton socket instance
 * - Automatic reconnection
 * - Connection state management
 * - Event subscription helpers
 * - Code-split socket.io-client library
 *
 * @module
 */

import type { Socket } from 'socket.io-client';
import { SocketEvent } from './server';

let socket: Socket | null = null;
let socketIOPromise: Promise<typeof import('socket.io-client')> | null = null;

/**
 * Lazy load socket.io-client library
 * This reduces initial bundle size by ~200KB
 */
async function loadSocketIO(): Promise<typeof import('socket.io-client')> {
  if (!socketIOPromise) {
    socketIOPromise = import('socket.io-client');
  }
  return socketIOPromise;
}

/**
 * Initialize Socket.io client (async)
 * Dynamically imports socket.io-client library on first use
 */
export async function initSocketClient(): Promise<Socket> {
  if (socket) {
    return socket;
  }

  // Dynamically load socket.io-client library
  const { io } = await loadSocketIO();

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
 * Connect to Socket.io server (async)
 */
export async function connectSocket(): Promise<void> {
  if (!socket) {
    await initSocketClient();
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
 * Join a trip room (async)
 */
export async function joinTripRoom(tripId: string): Promise<void> {
  if (!socket?.connected) {
    await connectSocket();
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
 * Subscribe to an event (async)
 */
export async function onSocketEvent<T = any>(
  event: SocketEvent | string,
  callback: (data: T) => void
): Promise<() => void> {
  if (!socket) {
    await initSocketClient();
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
