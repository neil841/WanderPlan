'use client';

import { motion, type Variants } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Edit, Eye, Plus, Users } from 'lucide-react';
import { TripDetails } from '@/hooks/useTrip';

interface CollaboratorListProps {
  collaborators: TripDetails['collaborators'];
  creator: TripDetails['creator'];
  userRole: TripDetails['userRole'];
  showAddButton?: boolean;
  onAddCollaborator?: () => void;
}

/**
 * CollaboratorList Component
 *
 * Displays trip owner and collaborators with their roles
 * Shows avatars, names, emails, and permission badges
 *
 * Features:
 * - Premium avatar list design
 * - Role badges with icons
 * - Responsive layout
 * - Smooth animations
 * - WCAG 2.1 AA compliant
 *
 * @component
 */
export function CollaboratorList({
  collaborators,
  creator,
  userRole,
  showAddButton = false,
  onAddCollaborator,
}: CollaboratorListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3" />;
      case 'ADMIN':
        return <Shield className="w-3 h-3" />;
      case 'EDITOR':
        return <Edit className="w-3 h-3" />;
      case 'VIEWER':
        return <Eye className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'ADMIN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canManageCollaborators = userRole === 'owner' || userRole === 'ADMIN';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Collaborators</h3>
        {showAddButton && canManageCollaborators && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddCollaborator}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {/* Trip Owner */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={creator.avatarUrl || undefined} alt={creator.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(creator.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm truncate">{creator.name}</p>
                  <Badge variant="default" className="gap-1 text-xs">
                    {getRoleIcon('owner')}
                    <span>Owner</span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{creator.email}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Collaborators */}
        {collaborators.map((collab) => (
          <motion.div key={collab.id} variants={itemVariants}>
            <Card className="p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-muted">
                  <AvatarImage
                    src={collab.user.avatarUrl || undefined}
                    alt={collab.user.name}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                    {getInitials(collab.user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{collab.user.name}</p>
                    <Badge variant={getRoleBadgeVariant(collab.role)} className="gap-1 text-xs">
                      {getRoleIcon(collab.role)}
                      <span className="capitalize">{collab.role.toLowerCase()}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {collab.user.email}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Empty State */}
        {collaborators.length === 0 && (
          <motion.div variants={itemVariants}>
            <Card className="p-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No collaborators yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invite others to collaborate on this trip
                  </p>
                </div>
                {canManageCollaborators && onAddCollaborator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddCollaborator}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Collaborator
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Compact Avatar List (Optional Alternative View) */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <div className="flex -space-x-2">
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarImage src={creator.avatarUrl || undefined} alt={creator.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(creator.name)}
              </AvatarFallback>
            </Avatar>

            {collaborators.slice(0, 4).map((collab) => (
              <Avatar key={collab.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage
                  src={collab.user.avatarUrl || undefined}
                  alt={collab.user.name}
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {getInitials(collab.user.name)}
                </AvatarFallback>
              </Avatar>
            ))}

            {collaborators.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  +{collaborators.length - 4}
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {collaborators.length + 1} member{collaborators.length !== 0 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
