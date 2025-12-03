'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Smile, Paperclip, MoreVertical, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

interface MessageUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

interface Message {
  id: string;
  tripId: string;
  userId: string;
  content: string;
  replyTo: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: MessageUser;
}

interface MessagesInterfaceProps {
  tripId: string;
}

/**
 * MessagesInterface Component
 *
 * Real-time messaging interface for authenticated users.
 * Features chat input, message history, and typing indicators.
 *
 * @component
 */
export function MessagesInterface({ tripId }: MessagesInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id || '';
  const currentUserName = session?.user?.name || 'You';

  useEffect(() => {
    // TODO: Fetch messages from API
    // For now, show empty state
    loadMessages();
  }, [tripId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${tripId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${tripId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
      } else {
        setNewMessage(messageContent); // Restore message on error
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <TabsContent value="messages" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-blue-600" />
            Messages
          </h2>
          <p className="text-gray-600 mt-1">
            Chat with your travel companions in real-time
          </p>
        </div>
      </div>

      {/* Info Alert */}
      {messages.length === 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Start the conversation!</strong> Send your first message to start planning with your group.
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Container */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-blue-50/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Group Chat</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Members</DropdownMenuItem>
                <DropdownMenuItem>Notification Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col" style={{ height: '500px' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600 max-w-sm">
                  Start the conversation! Share your ideas, ask questions, or just say hi to your travel group.
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => {
                  const isCurrentUser = message.userId === currentUserId;
                  const userName = `${message.user.firstName} ${message.user.lastName}`.trim() || message.user.email;
                  const messageDate = new Date(message.createdAt);

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.user.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                          {userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {isCurrentUser ? 'You' : userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(messageDate, 'h:mm a')}
                          </span>
                          {message.isEdited && (
                            <span className="text-xs text-gray-400 italic">(edited)</span>
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="pr-20 min-h-[44px] resize-none"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-11"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
