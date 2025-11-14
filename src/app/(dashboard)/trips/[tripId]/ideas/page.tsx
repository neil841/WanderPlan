/**
 * Trip Ideas Page
 *
 * Ideas and suggestions interface with voting
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { CreateIdeaDialog } from '@/components/ideas/CreateIdeaDialog';
import { IdeaList } from '@/components/ideas/IdeaList';
import {
  useIdeas,
  useCreateIdea,
  useUpdateIdea,
  useDeleteIdea,
  useVoteIdea,
} from '@/hooks/useIdeas';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import type { IdeaStatus, IdeaWithVotes } from '@/types/idea';

export default function IdeasPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('recent');
  const [deleteIdeaId, setDeleteIdeaId] = useState<string | null>(null);

  // Fetch ideas
  const { data: ideasData, isLoading } = useIdeas(tripId, statusFilter);

  // Mutations
  const createIdeaMutation = useCreateIdea(tripId);
  const updateIdeaMutation = useUpdateIdea(tripId);
  const deleteIdeaMutation = useDeleteIdea(tripId);
  const voteIdeaMutation = useVoteIdea(tripId);

  // Assume user role (in a real app, this would come from trip data)
  const userRole = 'EDITOR' as 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

  const handleCreateIdea = (data: { title: string; description: string }) => {
    createIdeaMutation.mutate(data);
  };

  const handleVote = (ideaId: string, vote: number) => {
    voteIdeaMutation.mutate({ ideaId, vote });
  };

  const handleAccept = (ideaId: string) => {
    updateIdeaMutation.mutate({
      ideaId,
      data: { status: 'ACCEPTED' },
    });
  };

  const handleReject = (ideaId: string) => {
    updateIdeaMutation.mutate({
      ideaId,
      data: { status: 'REJECTED' },
    });
  };

  const handleDelete = (ideaId: string) => {
    setDeleteIdeaId(ideaId);
  };

  const confirmDelete = () => {
    if (deleteIdeaId) {
      deleteIdeaMutation.mutate(deleteIdeaId, {
        onSuccess: () => {
          setDeleteIdeaId(null);
        },
      });
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ideas & Suggestions</h1>
          <p className="text-muted-foreground mt-1">
            Share and vote on ideas for the trip
          </p>
        </div>
        <CreateIdeaDialog
          onSubmit={handleCreateIdea}
          isPending={createIdeaMutation.isPending}
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-4 mb-6">
        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter || 'all'}
          onValueChange={(value) =>
            setStatusFilter(value === 'all' ? undefined : (value as IdeaStatus))
          }
          className="flex-1"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="OPEN">Pending</TabsTrigger>
            <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value: 'recent' | 'votes') => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="votes">Most Votes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {ideasData && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold">{ideasData.total}</div>
            <div className="text-sm text-muted-foreground">Total Ideas</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {ideasData.ideas.filter((i) => i.status === 'ACCEPTED').length}
            </div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {ideasData.ideas.filter((i) => i.status === 'OPEN').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </div>
      )}

      {/* Ideas List */}
      <IdeaList
        ideas={ideasData?.ideas || []}
        currentUserId={session.user.id}
        userRole={userRole}
        isLoading={isLoading}
        onVote={handleVote}
        onDelete={handleDelete}
        onAccept={handleAccept}
        onReject={handleReject}
        sortBy={sortBy}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteIdeaId} onOpenChange={() => setDeleteIdeaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this idea? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
