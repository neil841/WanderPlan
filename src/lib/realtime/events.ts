/**
 * Socket Event Types
 *
 * Shared event names for Socket.io real-time communication.
 * Can be imported in both client and server code.
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
  MESSAGE_UPDATED = 'message:updated',
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
