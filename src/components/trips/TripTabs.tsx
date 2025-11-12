'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutGrid,
  Calendar,
  Map,
  DollarSign,
  FileText,
  MessageSquare,
  Lightbulb,
  Users,
} from 'lucide-react';

export type TripTab =
  | 'overview'
  | 'itinerary'
  | 'calendar'
  | 'map'
  | 'budget'
  | 'documents'
  | 'messages'
  | 'ideas'
  | 'collaborators';

interface TripTabsProps {
  activeTab: TripTab;
  onTabChange: (tab: TripTab) => void;
  eventCount?: number;
  documentCount?: number;
  collaboratorCount?: number;
}

/**
 * TripTabs Component
 *
 * Navigation tabs for trip details page
 * Shows icons and labels for each section with counts
 *
 * Features:
 * - Responsive layout (icons only on mobile, full labels on desktop)
 * - Active tab highlighting
 * - Optional badge counts
 * - Smooth transitions
 * - WCAG 2.1 AA compliant
 *
 * @component
 */
export function TripTabs({
  activeTab,
  onTabChange,
  eventCount,
  documentCount,
  collaboratorCount,
}: TripTabsProps) {
  const tabs: Array<{
    value: TripTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = [
    {
      value: 'overview',
      label: 'Overview',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      value: 'itinerary',
      label: 'Itinerary',
      icon: <Calendar className="w-4 h-4" />,
      count: eventCount,
    },
    {
      value: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: 'map',
      label: 'Map',
      icon: <Map className="w-4 h-4" />,
    },
    {
      value: 'budget',
      label: 'Budget',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      value: 'documents',
      label: 'Documents',
      icon: <FileText className="w-4 h-4" />,
      count: documentCount,
    },
    {
      value: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      value: 'ideas',
      label: 'Ideas',
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      value: 'collaborators',
      label: 'Collaborators',
      icon: <Users className="w-4 h-4" />,
      count: collaboratorCount,
    },
  ];

  return (
    <div className="w-full border-b bg-background sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as TripTab)}
          className="w-full"
        >
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-0 rounded-none overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="
                  relative px-3 sm:px-4 py-3 rounded-none border-b-2 border-transparent
                  data-[state=active]:border-primary data-[state=active]:bg-transparent
                  data-[state=active]:shadow-none
                  hover:bg-accent/50 hover:text-accent-foreground
                  transition-all duration-200
                  flex items-center gap-2
                  whitespace-nowrap
                  min-w-0
                "
                aria-label={tab.label}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className="hidden sm:inline text-sm font-medium">
                  {tab.label}
                </span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
