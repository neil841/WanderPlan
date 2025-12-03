'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, User, Eye, Filter, Sparkles, Calendar, DollarSign, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'event' | 'expense' | 'member' | 'trip';
  description: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  timestamp: Date;
  metadata?: {
    oldValue?: string;
    newValue?: string;
  };
}

interface ActivityInterfaceProps {
  tripId: string;
}

/**
 * ActivityInterface Component
 *
 * Activity feed and audit trail for authenticated users.
 * Shows all changes and updates to the trip.
 *
 * @component
 */
export function ActivityInterface({ tripId }: ActivityInterfaceProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  const getActivityIcon = (type: string, entity: string) => {
    if (entity === 'event') return <Calendar className="h-4 w-4" />;
    if (entity === 'expense') return <DollarSign className="h-4 w-4" />;
    if (entity === 'member') return <User className="h-4 w-4" />;
    if (entity === 'trip') return <MapPin className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'text-green-600 bg-green-100';
      case 'update':
        return 'text-blue-600 bg-blue-100';
      case 'delete':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'create':
        return 'Added';
      case 'update':
        return 'Updated';
      case 'delete':
        return 'Removed';
      default:
        return 'Changed';
    }
  };

  return (
    <TabsContent value="activity" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="h-7 w-7 text-green-600" />
            Activity Feed
          </h2>
          <p className="text-gray-600 mt-1">
            Track all changes and updates to your trip
          </p>
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="event">Events Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
            <SelectItem value="member">Members Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Sparkles className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          <strong>Full transparency!</strong> Every change made to this trip is logged here. Perfect for staying in sync with your group.
        </AlertDescription>
      </Alert>

      {/* Empty State */}
      {activities.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No activity yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              As you and your team make changes to the trip, they'll appear here. Add events, expenses, or invite members to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <AnimatePresence>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="relative flex gap-4 pb-8 last:pb-0"
                  >
                    {/* Timeline Line */}
                    {index !== activities.length - 1 && (
                      <div className="absolute left-[20px] top-[40px] bottom-0 w-px bg-gray-200" />
                    )}

                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                        {activity.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {activity.user.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getActivityColor(activity.type)}`}
                            >
                              {getActivityIcon(activity.type, activity.entity)}
                              <span className="ml-1">{getActivityTypeLabel(activity.type)}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          {activity.metadata && (activity.metadata.oldValue || activity.metadata.newValue) && (
                            <div className="mt-2 text-xs bg-gray-50 rounded-lg p-2 border">
                              {activity.metadata.oldValue && (
                                <div>
                                  <span className="text-gray-500">From:</span>{' '}
                                  <span className="text-gray-700">{activity.metadata.oldValue}</span>
                                </div>
                              )}
                              {activity.metadata.newValue && (
                                <div>
                                  <span className="text-gray-500">To:</span>{' '}
                                  <span className="text-gray-700">{activity.metadata.newValue}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Clock className="h-3 w-3" />
                          {format(activity.timestamp, 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {activities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {activities.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {new Set(activities.map(a => a.user.name)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-gray-900">
                {activities.length > 0
                  ? format(activities[0].timestamp, 'MMM d, h:mm a')
                  : 'Never'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </TabsContent>
  );
}
