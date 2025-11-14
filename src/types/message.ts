/**
 * Message Types
 *
 * Type definitions for the messaging system
 */

import type { User } from './user';

export interface Message {
  id: string;
  tripId: string;
  userId: string;
  content: string;
  replyTo: string | null;
  isEdited: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: User; // Populated in API responses
}

export interface MessageWithUser extends Message {
  user: User;
}

export interface MessageThread extends MessageWithUser {
  replies: MessageWithUser[];
  replyCount: number;
}

export interface CreateMessageRequest {
  content: string;
  replyTo?: string | null;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface MessagesResponse {
  messages: MessageWithUser[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface MessageEventData {
  message: MessageWithUser;
  tripId: string;
}

export interface MessageUpdatedEventData {
  messageId: string;
  content: string;
  isEdited: boolean;
  updatedAt: string;
  tripId: string;
}

export interface MessageDeletedEventData {
  messageId: string;
  tripId: string;
}
