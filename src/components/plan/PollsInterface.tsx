'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart3, Vote, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreatePollDialog } from '@/components/polls/CreatePollDialog';
import type { PollWithResults } from '@/types/poll';

interface PollsInterfaceProps {
  tripId: string;
}

/**
 * PollsInterface Component
 *
 * Group decision-making interface with polls and voting.
 * Features real-time results and deadline management.
 *
 * @component
 */
export function PollsInterface({ tripId }: PollsInterfaceProps) {
  const [polls, setPolls] = useState<PollWithResults[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    loadPolls();
  }, [tripId]);

  const loadPolls = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${tripId}/polls`);
      if (response.ok) {
        const data = await response.json();
        setPolls(data.polls || []);
      }
    } catch (error) {
      console.error('Failed to load polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePoll = () => {
    setIsCreateDialogOpen(true);
  };

  const handlePollSubmit = async (data: any) => {
    try {
      setIsPending(true);
      const response = await fetch(`/api/trips/${tripId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create poll');
      }

      // Reload all polls to get the correct data structure
      await loadPolls();
      toast.success('Poll created successfully!');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setIsPending(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds: [optionId] }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Reload polls to get updated vote counts
      await loadPolls();
      toast.success('Vote recorded!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    }
  };


  return (
    <TabsContent value="polls" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-purple-600" />
            Group Polls
          </h2>
          <p className="text-gray-600 mt-1">
            Make decisions together with polls and voting
          </p>
        </div>
        <Button
          onClick={handleCreatePoll}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="border-purple-200 bg-purple-50">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-900">
          <strong>Make group decisions easier!</strong> Create polls for dates, activities, or destinations. Everyone can vote and see results in real-time.
        </AlertDescription>
      </Alert>

      {/* Empty State */}
      {polls.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No polls created yet
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Create your first poll to help your group make decisions together!
            </p>
            <Button
              variant="outline"
              onClick={handleCreatePoll}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Poll
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Polls List */}
      {polls.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {polls.map((poll) => {
              return (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{poll.question}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={poll.status === 'OPEN' ? 'default' : 'secondary'}>
                              {poll.status.toLowerCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                            </span>
                            {poll.expiresAt && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                Ends {new Date(poll.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {poll.options.map((option) => {
                        const isWinning = option.voteCount === Math.max(...poll.options.map(o => o.voteCount)) && option.voteCount > 0;

                        return (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Button
                                variant="outline"
                                className={`flex-1 justify-start ${poll.userHasVoted ? 'cursor-default' : ''} ${isWinning ? 'border-purple-500 bg-purple-50' : ''} ${option.userVoted ? 'bg-purple-100 border-purple-400' : ''}`}
                                onClick={() => !poll.userHasVoted && handleVote(poll.id, option.id)}
                                disabled={poll.userHasVoted || poll.status === 'CLOSED'}
                              >
                                <Vote className="h-4 w-4 mr-2" />
                                {option.text}
                                {option.userVoted && ' ✓'}
                              </Button>
                              <div className="ml-4 min-w-[80px] text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  {option.voteCount} votes
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {option.percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <Progress value={option.percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Poll Dialog */}
      <CreatePollDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handlePollSubmit}
        isPending={isPending}
      />
    </TabsContent>
  );
}
