/**
 * Idea Types
 *
 * Type definitions for the ideas/suggestions system
 */

import type { User } from './user';

export type IdeaStatus = 'OPEN' | 'ACCEPTED' | 'REJECTED';

export interface Idea {
  id: string;
  tripId: string;
  title: string;
  description: string;
  status: IdeaStatus;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  creator?: User;
  votes?: IdeaVote[];
  _count?: {
    votes: number;
  };
}

export interface IdeaVote {
  id: string;
  ideaId: string;
  userId: string;
  vote: number; // 1 for upvote, -1 for downvote
  createdAt: Date | string;
  user?: User;
}

export interface IdeaWithVotes extends Idea {
  creator: User;
  votes: IdeaVote[];
  voteCount: number;
  upvoteCount: number;
  downvoteCount: number;
  currentUserVote?: number | null;
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
}

export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  status?: IdeaStatus;
}

export interface VoteIdeaRequest {
  vote: number; // 1 for upvote, -1 for downvote, 0 to remove vote
}

export interface IdeasResponse {
  ideas: IdeaWithVotes[];
  total: number;
}
