/**
 * Collaborator Card Component
 *
 * Displays a single collaborator with their information and actions.
 *
 * Features:
 * - User avatar and name
 * - Role badge with color coding
 * - Role change dropdown (for admins/owners)
 * - Remove button (for admins/owners)
 * - Status indicators (pending/accepted/declined)
 * - Confirmation dialog for removal
 *
 * @component
 */

'use client';

import { useState } from 'react';
import { CollaboratorRole, CollaboratorStatus } from '@prisma/client';
import { Collaborator, getRoleDisplayName, getRoleColor, canManageRole } from '@/types/collaborator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useUpdateCollaboratorRole, useRemoveCollaborator } from '@/hooks/useCollaborators';
import { MoreVertical, UserX, Shield, Eye, Edit, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface CollaboratorCardProps {
  tripId: string;
  collaborator: Collaborator;
  userRole: CollaboratorRole | 'OWNER';
  currentUserId: string;
}

export function CollaboratorCard({
  tripId,
  collaborator,
  userRole,
  currentUserId,
}: CollaboratorCardProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const updateRoleMutation = useUpdateCollaboratorRole(tripId);
  const removeMutation = useRemoveCollaborator(tripId);

  const isCurrentUser = collaborator.userId === currentUserId;
  const canManage = canManageRole(userRole, collaborator.role);
  const canRemove = canManage || isCurrentUser;

  const handleRoleChange = async (newRole: CollaboratorRole) => {
    if (newRole === collaborator.role) return;
    await updateRoleMutation.mutateAsync({
      collaboratorId: collaborator.id,
      role: newRole,
    });
  };

  const handleRemove = async () => {
    await removeMutation.mutateAsync(collaborator.id);
    setShowRemoveDialog(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusIcon = (status: CollaboratorStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return <Check className="h-3 w-3" />;
      case 'PENDING':
        return <Clock className="h-3 w-3" />;
      case 'DECLINED':
        return <X className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: CollaboratorStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'DECLINED':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={collaborator.user.avatarUrl || undefined}
              alt={`${collaborator.user.firstName} ${collaborator.user.lastName}`}
            />
            <AvatarFallback>
              {getInitials(collaborator.user.firstName, collaborator.user.lastName)}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {collaborator.user.firstName} {collaborator.user.lastName}
                {isCurrentUser && (
                  <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                )}
              </p>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {collaborator.user.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Invited {format(new Date(collaborator.invitedAt), 'MMM d, yyyy')}
              </p>
              {collaborator.status === 'ACCEPTED' && collaborator.joinedAt && (
                <p className="text-xs text-muted-foreground">
                  • Joined {format(new Date(collaborator.joinedAt), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status and Role Badges */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <Badge variant="outline" className={getStatusColor(collaborator.status)}>
            {getStatusIcon(collaborator.status)}
            <span className="ml-1 text-xs">
              {collaborator.status.charAt(0) + collaborator.status.slice(1).toLowerCase()}
            </span>
          </Badge>

          {/* Role Badge/Dropdown */}
          {canManage && !isCurrentUser && collaborator.status === 'ACCEPTED' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={getRoleColor(collaborator.role)}>
                  {getRoleDisplayName(collaborator.role)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRoleChange('VIEWER')}>
                  <Eye className="mr-2 h-4 w-4" />
                  {getRoleDisplayName('VIEWER')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('EDITOR')}>
                  <Edit className="mr-2 h-4 w-4" />
                  {getRoleDisplayName('EDITOR')}
                </DropdownMenuItem>
                {userRole === 'OWNER' && (
                  <DropdownMenuItem onClick={() => handleRoleChange('ADMIN')}>
                    <Shield className="mr-2 h-4 w-4" />
                    {getRoleDisplayName('ADMIN')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge className={getRoleColor(collaborator.role)}>
              {getRoleDisplayName(collaborator.role)}
            </Badge>
          )}

          {/* Actions Menu */}
          {canRemove && collaborator.status === 'ACCEPTED' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowRemoveDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  {isCurrentUser ? 'Leave Trip' : 'Remove Collaborator'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCurrentUser ? 'Leave Trip?' : 'Remove Collaborator?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCurrentUser ? (
                <>
                  Are you sure you want to leave this trip? You will lose access to all trip
                  information and won't be able to rejoin unless invited again.
                </>
              ) : (
                <>
                  Are you sure you want to remove{' '}
                  <span className="font-semibold">
                    {collaborator.user.firstName} {collaborator.user.lastName}
                  </span>{' '}
                  from this trip? They will lose access to all trip information.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCurrentUser ? 'Leave Trip' : 'Remove Collaborator'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
