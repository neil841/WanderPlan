/**
 * Poll Types
 *
 * Type definitions for the polling system
 */

import type { User } from './user';

export type PollStatus = 'OPEN' | 'CLOSED';

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  order: number;
  createdAt: Date | string;
  _count?: {
    votes: number;
  };
}

export interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date | string;
  user?: User;
}

export interface Poll {
  id: string;
  tripId: string;
  question: string;
  allowMultipleVotes: boolean;
  status: PollStatus;
  expiresAt: Date | string | null;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  creator?: User;
  options?: PollOption[];
  votes?: PollVote[];
}

export interface PollWithResults extends Poll {
  creator: User;
  options: (PollOption & {
    voteCount: number;
    percentage: number;
    userVoted: boolean;
  })[];
  totalVotes: number;
  userHasVoted: boolean;
  userVotedOptionIds: string[];
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  allowMultipleVotes?: boolean;
  expiresAt?: Date | string | null;
}

export interface VotePollRequest {
  optionIds: string[]; // Array to support multiple choice
}

export interface PollsResponse {
  polls: PollWithResults[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
