/**
 * Real-time Types
 *
 * TypeScript type definitions for Socket.io real-time events.
 */

/**
 * Message event payload
 */
export interface MessageEvent {
  id: string;
  tripId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
}

/**
 * Activity event payload
 */
export interface ActivityEvent {
  id: string;
  tripId: string;
  userId: string;
  type: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Event created/updated payload
 */
export interface EventChangeEvent {
  id: string;
  tripId: string;
  type: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  dayNumber: number | null;
  orderInDay: number;
}

/**
 * Event deleted payload
 */
export interface EventDeletedEvent {
  eventId: string;
  tripId: string;
}

/**
 * Event reordered payload
 */
export interface EventReorderedEvent {
  tripId: string;
  eventId: string;
  dayNumber: number | null;
  orderInDay: number;
}

/**
 * Collaborator joined payload
 */
export interface CollaboratorJoinedEvent {
  tripId: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Collaborator left payload
 */
export interface CollaboratorLeftEvent {
  tripId: string;
  userId: string;
}

/**
 * Collaborator role changed payload
 */
export interface CollaboratorRoleChangedEvent {
  tripId: string;
  userId: string;
  oldRole: 'VIEWER' | 'EDITOR' | 'ADMIN';
  newRole: 'VIEWER' | 'EDITOR' | 'ADMIN';
}

/**
 * Trip updated payload
 */
export interface TripUpdatedEvent {
  tripId: string;
  title?: string;
  description?: string;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Typing indicator payload
 */
export interface TypingEvent {
  userId: string;
  tripId: string;
}

/**
 * Online presence payload
 */
export interface PresenceEvent {
  userId: string;
  tripId: string;
}

/**
 * Socket error payload
 */
export interface SocketError {
  event: string;
  error: string;
  details?: any;
}

/**
 * Socket Event Names
 *
 * All event names used in the Socket.io real-time communication
 */
export enum SocketEvent {
  // Connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Trip room events
  JOIN_TRIP = 'join:trip',
  LEAVE_TRIP = 'leave:trip',

  // Message events
  MESSAGE_SENT = 'message:sent',
  MESSAGE_UPDATED = 'message:updated',
  MESSAGE_DELETED = 'message:deleted',

  // Activity events
  ACTIVITY_CREATED = 'activity:created',

  // Event (itinerary) events
  EVENT_CREATED = 'event:created',
  EVENT_UPDATED = 'event:updated',
  EVENT_DELETED = 'event:deleted',
  EVENT_REORDERED = 'event:reordered',

  // Collaborator events
  COLLABORATOR_JOINED = 'collaborator:joined',
  COLLABORATOR_LEFT = 'collaborator:left',
  COLLABORATOR_ROLE_CHANGED = 'collaborator:role_changed',

  // Trip events
  TRIP_UPDATED = 'trip:updated',

  // Typing indicators
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',

  // Presence events
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
}
