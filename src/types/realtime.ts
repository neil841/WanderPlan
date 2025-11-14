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
