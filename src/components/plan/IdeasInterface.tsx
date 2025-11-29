'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Lightbulb, ThumbsUp, MessageCircle, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateIdeaDialog } from '@/components/ideas/CreateIdeaDialog';
import { CommentsDialog } from '@/components/ideas/CommentsDialog';
import type { IdeaWithVotes } from '@/types/idea';

interface IdeasInterfaceProps {
  tripId: string;
  currentUserId?: string;
}

/**
 * IdeasInterface Component
 *
 * Collaborative ideas and suggestions interface for authenticated users.
 * Features voting, commenting, and approval workflow.
 *
 * @component
 */
export function IdeasInterface({ tripId, currentUserId }: IdeasInterfaceProps) {
  const [ideas, setIdeas] = useState<IdeaWithVotes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [commentsDialog, setCommentsDialog] = useState<{
    open: boolean;
    ideaId: string;
    ideaTitle: string;
  }>({ open: false, ideaId: '', ideaTitle: '' });

  useEffect(() => {
    loadIdeas();
  }, [tripId]);

  const loadIdeas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${tripId}/ideas`);
      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error('Failed to load ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIdea = async (data: any) => {
    try {
      setIsPending(true);
      const response = await fetch(`/api/trips/${tripId}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create idea');
      }

      const idea = await response.json();
      setIdeas((prev) => [idea, ...prev]);
      toast.success('Idea created successfully!');
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error('Failed to create idea');
    } finally {
      setIsPending(false);
    }
  };

  const handleVote = async (ideaId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/ideas/${ideaId}/vote`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Reload ideas to get updated vote counts
      await loadIdeas();
      toast.success('Vote recorded!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    }
  };

  const handleApprove = async (ideaId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve idea');
      }

      // Update idea status locally
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId ? { ...idea, status: 'ACCEPTED' as const } : idea
        )
      );
      toast.success('Idea approved!');
    } catch (error) {
      console.error('Error approving idea:', error);
      toast.error('Failed to approve idea');
    }
  };

  return (
    <TabsContent value="ideas" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Lightbulb className="h-7 w-7 text-yellow-600" />
            Ideas & Suggestions
          </h2>
          <p className="text-gray-600 mt-1">
            Collaborate on trip ideas with voting and discussions
          </p>
        </div>
        <CreateIdeaDialog
          onSubmit={handleAddIdea}
          isPending={isPending}
          trigger={
            <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Suggest Idea
            </Button>
          }
        />
      </div>

      {/* Info Alert */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <Sparkles className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900">
          <strong>Share your ideas!</strong> Suggest activities, restaurants, or attractions. The group can vote and approve the best ones.
        </AlertDescription>
      </Alert>

      {/* Empty State */}
      {ideas.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
              <Lightbulb className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No ideas yet
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Be the first to suggest an activity, restaurant, or attraction for this trip!
            </p>
            <CreateIdeaDialog
              onSubmit={handleAddIdea}
              isPending={isPending}
              trigger={
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Idea
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Ideas Grid */}
      {ideas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <Badge variant={idea.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                        {idea.status?.toLowerCase() || 'open'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{idea.description}</p>

                    {/* Voter Avatars */}
                    {idea.votes && idea.votes.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {idea.votes.slice(0, 5).map((vote) => (
                            <Avatar key={vote.id} className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={vote.user?.avatarUrl || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-xs">
                                {vote.user?.firstName?.charAt(0) || vote.user?.email?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {idea.votes.length > 5 && (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-600">
                              +{idea.votes.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {idea.votes.length} {idea.votes.length === 1 ? 'like' : 'likes'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(idea.id)}
                          className={`gap-2 ${idea.currentUserVote === 1 ? 'text-yellow-600 bg-yellow-50' : ''}`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {idea.currentUserVote === 1 ? 'Liked' : 'Like'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            setCommentsDialog({
                              open: true,
                              ideaId: idea.id,
                              ideaTitle: idea.title,
                            })
                          }
                        >
                          <MessageCircle className="h-4 w-4" />
                          {idea._count?.comments || 0} comments
                        </Button>
                      </div>
                      {idea.status === 'OPEN' && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(idea.id)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Comments Dialog */}
      <CommentsDialog
        open={commentsDialog.open}
        onOpenChange={(open) =>
          setCommentsDialog((prev) => ({ ...prev, open }))
        }
        tripId={tripId}
        ideaId={commentsDialog.ideaId}
        ideaTitle={commentsDialog.ideaTitle}
        currentUserId={currentUserId}
      />
    </TabsContent>
  );
}
