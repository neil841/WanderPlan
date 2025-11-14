/**
 * Trip Polls Page
 *
 * Polling system for group decision-making
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { PollList } from '@/components/polls/PollList';
import { CreatePollDialog } from '@/components/polls/CreatePollDialog';
import {
  usePolls,
  useCreatePoll,
  useVotePoll,
  useUpdatePollStatus,
  useDeletePoll,
} from '@/hooks/usePolls';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, BarChart3, Lock, Unlock } from 'lucide-react';
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
import type { PollStatus } from '@/types/poll';
import type { CollaboratorRole } from '@prisma/client';

export default function PollsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: session } = useSession();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PollStatus | undefined>(undefined);
  const [deletePollId, setDeletePollId] = useState<string | null>(null);

  // Hooks
  const { data: pollsData, isLoading } = usePolls(tripId, statusFilter);
  const createPollMutation = useCreatePoll(tripId);
  const votePollMutation = useVotePoll(tripId);
  const updateStatusMutation = useUpdatePollStatus(tripId);
  const deletePollMutation = useDeletePoll(tripId);

  // TODO: Get user role from trip data (for now, assume EDITOR)
  const userRole: CollaboratorRole | 'OWNER' = 'EDITOR';

  const handleCreatePoll = async (data: any) => {
    await createPollMutation.mutateAsync({
      question: data.question,
      options: data.options.filter((opt: string) => opt.trim()),
      allowMultipleVotes: data.allowMultipleVotes,
      expiresAt: data.expiresAt || null,
    });
    setShowCreateDialog(false);
  };

  const handleVote = (pollId: string, optionIds: string[]) => {
    votePollMutation.mutate({ pollId, vote: { optionIds } });
  };

  const handleClosePoll = (pollId: string) => {
    updateStatusMutation.mutate({ pollId, status: 'CLOSED' });
  };

  const handleReopenPoll = (pollId: string) => {
    updateStatusMutation.mutate({ pollId, status: 'OPEN' });
  };

  const handleDeletePoll = (pollId: string) => {
    setDeletePollId(pollId);
  };

  const confirmDeletePoll = () => {
    if (deletePollId) {
      deletePollMutation.mutate(deletePollId, {
        onSuccess: () => {
          setDeletePollId(null);
        },
      });
    }
  };

  if (!session?.user?.id) {
    return null;
  }

  const polls = pollsData?.polls || [];
  const openPolls = polls.filter((p) => p.status === 'OPEN');
  const closedPolls = polls.filter((p) => p.status === 'CLOSED');

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Polls</h1>
          <p className="text-muted-foreground">
            Make group decisions together
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Poll
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{polls.length}</p>
                <p className="text-sm text-muted-foreground">Total Polls</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Unlock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openPolls.length}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{closedPolls.length}</p>
                <p className="text-sm text-muted-foreground">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs
        value={statusFilter || 'all'}
        onValueChange={(value) =>
          setStatusFilter(value === 'all' ? undefined : (value as PollStatus))
        }
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All ({polls.length})</TabsTrigger>
          <TabsTrigger value="OPEN">Open ({openPolls.length})</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed ({closedPolls.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Poll List */}
      <PollList
        polls={polls}
        currentUserId={session.user.id}
        userRole={userRole}
        isLoading={isLoading}
        onVote={handleVote}
        onClose={handleClosePoll}
        onReopen={handleReopenPoll}
        onDelete={handleDeletePoll}
      />

      {/* Create Poll Dialog */}
      <CreatePollDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePoll}
        isPending={createPollMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePollId} onOpenChange={() => setDeletePollId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone.
              All votes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePoll}
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
