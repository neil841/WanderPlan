'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Package,
} from 'lucide-react';
import { TripDetails } from '@/hooks/useTrip';
import { CollaboratorList } from './CollaboratorList';
import { format, differenceInDays } from 'date-fns';

interface TripOverviewProps {
  trip: TripDetails;
}

/**
 * TripOverview Component
 *
 * Displays trip overview with description, stats, budget summary, and collaborators
 *
 * Features:
 * - Premium card-based layout
 * - Quick stats grid
 * - Budget breakdown
 * - Collaborator list
 * - Responsive design
 * - Smooth animations
 * - WCAG 2.1 AA compliant
 *
 * @component
 */
export function TripOverview({ trip }: TripOverviewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  const getTripDuration = () => {
    if (!trip.startDate || !trip.endDate) return null;

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = differenceInDays(end, start) + 1; // +1 to include both start and end day

    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const formatBudget = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBudgetStatus = () => {
    if (!trip.budget) return null;

    const { totalBudget, totalSpent, currency } = trip.budget;
    const percentageSpent = (totalSpent / totalBudget) * 100;
    const remaining = totalBudget - totalSpent;

    return {
      percentageSpent,
      remaining,
      currency,
      isOverBudget: totalSpent > totalBudget,
    };
  };

  const budgetStatus = getBudgetStatus();

  const statsData = [
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Events',
      value: trip.stats.eventCount,
      description: trip.stats.eventCount === 1 ? 'event' : 'events',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Collaborators',
      value: trip.stats.collaboratorCount + 1, // +1 for owner
      description: 'member' + (trip.stats.collaboratorCount !== 0 ? 's' : ''),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Documents',
      value: trip.stats.documentCount,
      description: trip.stats.documentCount === 1 ? 'document' : 'documents',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Duration',
      value: getTripDuration() || 'N/A',
      description: '',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Description */}
      {trip.description && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>About This Trip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {trip.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.description && (
                        <p className="text-sm text-muted-foreground">
                          {stat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Budget Summary */}
      {trip.budget && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Budget Summary
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Track your trip expenses
                  </CardDescription>
                </div>
                {budgetStatus && (
                  <Badge
                    variant={budgetStatus.isOverBudget ? 'destructive' : 'secondary'}
                    className="text-sm"
                  >
                    {budgetStatus.percentageSpent.toFixed(0)}% spent
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-semibold">
                    {formatBudget(trip.budget.totalBudget, trip.budget.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-semibold">
                    {formatBudget(trip.budget.totalSpent, trip.budget.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span
                    className={`font-semibold ${
                      budgetStatus?.isOverBudget
                        ? 'text-destructive'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {budgetStatus &&
                      formatBudget(budgetStatus.remaining, budgetStatus.currency)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      budgetStatus?.isOverBudget
                        ? 'bg-destructive'
                        : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(budgetStatus?.percentageSpent || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* Budget Breakdown */}
              {trip.budget.categoryBudgets && Object.keys(trip.budget.categoryBudgets).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Budget Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(trip.budget.categoryBudgets as Record<string, any>).map(([category, data]) => (
                      <div key={category} className="space-y-1">
                        <p className="text-xs text-muted-foreground capitalize">{category}</p>
                        <p className="text-sm font-medium">
                          {formatBudget(data.budgeted || 0, trip.budget.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expense Count */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {trip.budget.expenseCount} expense
                  {trip.budget.expenseCount !== 1 ? 's' : ''} recorded
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Collaborators */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <CollaboratorList
              collaborators={trip.collaborators}
              creator={trip.creator}
              userRole={trip.userRole}
              showAddButton={true}
              onAddCollaborator={() => {
                // TODO: Open add collaborator dialog
                console.log('Add collaborator clicked');
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Trip Metadata */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {format(new Date(trip.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {format(new Date(trip.updatedAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Visibility</p>
                <Badge variant="outline" className="capitalize">
                  {trip.visibility.toLowerCase()}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Your Role</p>
                <Badge variant="secondary" className="capitalize">
                  {trip.userRole === 'owner' ? 'Owner' : trip.userRole.toLowerCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
