'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  ListChecks,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import {
  getGuestTrip,
  getTripStatistics,
  getExpensesByCategory,
  type GuestTrip,
} from '@/lib/guest-mode';
import { format } from 'date-fns';
import { useTrip } from '@/hooks/useTrip';

interface OverviewTabProps {
  tripId: string;
  isAuthenticated?: boolean;
}

/**
 * OverviewTab Component
 *
 * Premium dashboard view showing trip statistics, progress, and quick info.
 * Features animated stat cards and visual progress indicators.
 * Supports both Guest (localStorage) and Authenticated (DB) modes with unified UI.
 *
 * @component
 */
export function OverviewTab({ tripId, isAuthenticated }: OverviewTabProps) {
  const isGuestTrip = tripId.startsWith('guest-');

  // Guest State
  const [guestTrip, setGuestTrip] = useState<GuestTrip | null>(null);
  const [guestStats, setGuestStats] = useState<ReturnType<typeof getTripStatistics>>(null);
  const [guestExpensesByCategory, setGuestExpensesByCategory] = useState<Record<string, number>>({});

  // Authenticated Data
  const { data: dbTrip, isLoading: isDbTripLoading } = useTrip({
    tripId,
    enabled: !isGuestTrip
  });

  // Load Guest Data
  useEffect(() => {
    if (isGuestTrip) {
      const loadGuestData = () => {
        setGuestTrip(getGuestTrip(tripId));
        setGuestStats(getTripStatistics(tripId));
        setGuestExpensesByCategory(getExpensesByCategory(tripId));
      };

      loadGuestData();

      const handleStorageChange = () => loadGuestData();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [tripId, isGuestTrip]);

  // Unified Data Mapping
  let trip: GuestTrip | null = null;
  let stats: ReturnType<typeof getTripStatistics> = null;
  let expensesByCategory: Record<string, number> = {};

  if (isGuestTrip) {
    trip = guestTrip;
    stats = guestStats;
    expensesByCategory = guestExpensesByCategory;
  } else if (dbTrip) {
    // Map DB Trip to GuestTrip format
    trip = {
      id: dbTrip.id,
      name: dbTrip.name,
      description: dbTrip.description || undefined,
      startDate: dbTrip.startDate || new Date().toISOString(),
      endDate: dbTrip.endDate || new Date().toISOString(),
      destinations: dbTrip.destinations,
      tags: dbTrip.tags.map(t => t.name),
      visibility: dbTrip.visibility.toLowerCase() as 'private' | 'shared' | 'public',
      events: [], // Not needed for overview
      expenses: [], // Not needed for overview
      createdAt: dbTrip.createdAt,
      updatedAt: dbTrip.updatedAt,
      engagementScore: 0 // TODO: Calculate if needed
    };

    // Map DB Stats
    stats = {
      eventCount: dbTrip.stats.eventCount,
      expenseCount: dbTrip.budget?.expenseCount || 0,
      totalSpent: dbTrip.budget?.totalSpent || 0,
      dayCount: Math.ceil((new Date(dbTrip.endDate || new Date()).getTime() - new Date(dbTrip.startDate || new Date()).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      destinationCount: dbTrip.destinations.length,
      engagementScore: 50 // Default score for auth users
    };

    // Map Expenses by Category (if available in summary)
    // Note: useTrip might not return full expense breakdown, so we might need to fetch it or default to empty
    // For now, we'll leave it empty or try to use budget summary if available
    // Assuming dbTrip.budget might have category breakdown in future, but for now empty is safe
    expensesByCategory = {};
  }

  const isLoading = isGuestTrip ? (!trip || !stats) : isDbTripLoading;

  if (isLoading) {
    return (
      <TabsContent value="overview" className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TabsContent>
    );
  }

  if (!trip || !stats) {
    return (
      <TabsContent value="overview" className="space-y-6">
        <div className="text-center py-12 text-gray-500">Trip not found</div>
      </TabsContent>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  // Calculate progress (engagement score out of 100)
  const progressPercentage = Math.min((stats.engagementScore / 100) * 100, 100);

  const statCards = [
    {
      title: 'Trip Duration',
      value: `${stats.dayCount} ${stats.dayCount === 1 ? 'Day' : 'Days'}`,
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      description: `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`,
    },
    {
      title: 'Events Planned',
      value: stats.eventCount,
      icon: ListChecks,
      gradient: 'from-purple-500 to-pink-500',
      description: stats.eventCount === 0 ? 'Add your first event' : 'Itinerary items',
    },
    {
      title: 'Total Budget',
      value: stats.totalSpent > 0 ? `$${stats.totalSpent.toLocaleString()}` : '$0',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
      description: stats.expenseCount > 0 ? `${stats.expenseCount} expenses tracked` : 'No expenses yet',
    },
    {
      title: 'Destinations',
      value: stats.destinationCount || 0,
      icon: MapPin,
      gradient: 'from-orange-500 to-red-500',
      description: trip.destinations.join(', ') || 'No destinations added',
    },
  ];

  return (
    <TabsContent value="overview" className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Trip Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Planning Progress</CardTitle>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Score: {stats.engagementScore}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completeness</span>
                <span className="font-semibold text-gray-900">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Events per day</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.dayCount > 0 ? (stats.eventCount / stats.dayCount).toFixed(1) : 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Avg. expense</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${stats.expenseCount > 0 ? (stats.totalSpent / stats.expenseCount).toFixed(0) : 0}
                </p>
              </div>
            </div>

            {stats.engagementScore < 50 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> Add more events and budget details to make the most of your trip planning!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Breakdown (if expenses exist) */}
      {Object.keys(expensesByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Budget by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount], index) => {
                    const percentage = (amount / stats!.totalSpent) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 capitalize">{category}</span>
                          <span className="font-semibold text-gray-900">
                            ${amount.toLocaleString()} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tags */}
      {trip.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-600" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Description */}
      {trip.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About This Trip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{trip.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Weather Widget - Coming Soon for Guest Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Weather Forecast
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-5xl mb-4">☀️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Weather Coming Soon</h4>
              <p className="text-sm text-gray-600 mb-4">
                Create an account to see weather forecasts for your trip destinations
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <p>✓ 7-day forecast for your trip dates</p>
                <p>✓ Temperature, precipitation, and wind data</p>
                <p>✓ Location-specific weather alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TabsContent>
  );
}
