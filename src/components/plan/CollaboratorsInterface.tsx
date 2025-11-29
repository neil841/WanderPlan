'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Shield, Mail, MoreVertical, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
  joinedAt: Date;
  status: 'active' | 'pending';
}

interface CollaboratorsInterfaceProps {
  tripId: string;
}

/**
 * CollaboratorsInterface Component
 *
 * Team management interface for authenticated users.
 * Features invitations, role management, and permissions.
 *
 * @component
 */
export function CollaboratorsInterface({ tripId }: CollaboratorsInterfaceProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    // Mock current user
    {
      id: 'current',
      name: 'You',
      email: 'you@example.com',
      role: 'owner',
      joinedAt: new Date(),
      status: 'active',
    },
  ]);

  const handleInvite = () => {
    // TODO: Open invite dialog
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    // TODO: Change user role
  };

  const handleRemoveMember = (userId: string) => {
    // TODO: Remove member
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'admin':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'editor':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'viewer':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <TabsContent value="collaborators" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-7 w-7 text-blue-600" />
            Team Members
          </h2>
          <p className="text-gray-600 mt-1">
            Invite friends and manage team access to your trip
          </p>
        </div>
        <Button
          onClick={handleInvite}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite People
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Collaborate with your group!</strong> Invite friends to help plan the trip. Assign roles to control what they can edit.
        </AlertDescription>
      </Alert>

      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {collaborators.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {collaborators.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {collaborators.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Members ({collaborators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {collaborators.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        {member.status === 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {member.joinedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`${getRoleBadgeColor(member.role)} text-white border-0 capitalize`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role}
                    </Badge>

                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'admin')}>
                            Change to Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'editor')}>
                            Change to Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'viewer')}>
                            Change to Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  Owner
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Full access to all features. Can delete trip and manage all members.
              </p>
            </div>

            <div className="space-y-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                Admin
              </Badge>
              <p className="text-sm text-gray-600">
                Can edit everything and invite members. Cannot delete trip.
              </p>
            </div>

            <div className="space-y-2">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                Editor
              </Badge>
              <p className="text-sm text-gray-600">
                Can edit itinerary, budget, and add comments. Cannot manage members.
              </p>
            </div>

            <div className="space-y-2">
              <Badge className="bg-gray-400 text-white border-0">
                Viewer
              </Badge>
              <p className="text-sm text-gray-600">
                View-only access. Can see trip details but cannot make changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
