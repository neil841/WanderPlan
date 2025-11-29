/**
 * Guest Mode Utilities
 *
 * Handles localStorage-based trip management for users who haven't signed up yet.
 * Guest trips are stored in localStorage and can be migrated to the database upon signup.
 *
 * Features:
 * - Create, read, update, delete guest trips
 * - Automatic migration on signup
 * - Engagement tracking (time spent, features used)
 * - Smart signup prompt triggers
 */

const GUEST_TRIPS_KEY = 'wanderplan_guest_trips';
const GUEST_SESSION_KEY = 'wanderplan_guest_session';

export interface GuestTrip {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  tags: string[];
  visibility: 'private' | 'shared' | 'public';
  events: GuestEvent[];        // ⭐ NEW - Itinerary events
  expenses: GuestExpense[];    // ⭐ NEW - Budget tracking
  createdAt: string;
  updatedAt: string;
  engagementScore?: number;    // ⭐ NEW - Track user investment
}

export interface GuestEvent {
  id: string;
  tripId: string;
  day: number;                 // Day of trip (1, 2, 3...)
  title: string;
  startTime?: string;          // e.g., "09:00"
  endTime?: string;            // e.g., "12:00"
  location?: string;
  description?: string;
  estimatedCost?: number;
  category?: EventCategory;
  type?: string;               // ⭐ NEW - Specific event type (FLIGHT, HOTEL, etc.)
  order: number;               // For drag & drop ordering
  createdAt: string;
  updatedAt: string;
}

export interface GuestExpense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paidBy?: string;
  eventId?: string; // Link to itinerary event
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | 'activity'
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'shopping'
  | 'other';

export interface GuestSession {
  sessionId: string;
  startedAt: string;
  timeSpent: number; // milliseconds
  tripsCreated: number;
  featuresUsed: string[];
  lastActiveAt: string;
}

/**
 * Get all guest trips from localStorage
 * Includes automatic migration for old trips without events/expenses
 */
export function getGuestTrips(): GuestTrip[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(GUEST_TRIPS_KEY);
    if (!stored) return [];

    const trips = JSON.parse(stored);

    // Migrate old trips to new schema (add events and expenses arrays if missing)
    const migratedTrips = trips.map((trip: any) => ({
      ...trip,
      events: trip.events || [],
      expenses: trip.expenses || [],
      engagementScore: trip.engagementScore || 0,
    }));

    // Save migrated trips back to localStorage
    if (trips.some((trip: any) => !trip.events || !trip.expenses)) {
      localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(migratedTrips));
    }

    return migratedTrips;
  } catch (error) {
    console.error('Failed to load guest trips:', error);
    return [];
  }
}

/**
 * Get a single guest trip by ID
 */
export function getGuestTrip(id: string): GuestTrip | null {
  const trips = getGuestTrips();
  return trips.find((trip) => trip.id === id) || null;
}

/**
 * Create a new guest trip
 */
export function createGuestTrip(
  trip: Omit<GuestTrip, 'id' | 'createdAt' | 'updatedAt'>
): GuestTrip {
  const trips = getGuestTrips();

  const newTrip: GuestTrip = {
    ...trip,
    id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    events: [],              // ⭐ Initialize empty events array
    expenses: [],            // ⭐ Initialize empty expenses array
    engagementScore: 0,      // ⭐ Initialize engagement score
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  trips.push(newTrip);
  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));

  // Update session tracking
  trackGuestActivity('trip_created');
  incrementTripsCreated();

  return newTrip;
}

/**
 * Update an existing guest trip
 */
export function updateGuestTrip(
  id: string,
  updates: Partial<Omit<GuestTrip, 'id' | 'createdAt' | 'updatedAt'>>
): GuestTrip | null {
  const trips = getGuestTrips();
  const index = trips.findIndex((trip) => trip.id === id);

  if (index === -1) return null;

  const updatedTrip: GuestTrip = {
    ...trips[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  trips[index] = updatedTrip;
  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));

  trackGuestActivity('trip_updated');

  return updatedTrip;
}

/**
 * Delete a guest trip
 */
export function deleteGuestTrip(id: string): boolean {
  const trips = getGuestTrips();
  const filtered = trips.filter((trip) => trip.id !== id);

  if (filtered.length === trips.length) return false;

  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(filtered));
  trackGuestActivity('trip_deleted');

  return true;
}

/**
 * Initialize or get guest session
 */
export function getGuestSession(): GuestSession {
  if (typeof window === 'undefined') {
    return createNewGuestSession();
  }

  try {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (!stored) {
      return createNewGuestSession();
    }

    const session: GuestSession = JSON.parse(stored);

    // Update time spent
    const now = Date.now();
    const lastActive = new Date(session.lastActiveAt).getTime();
    const timeDiff = now - lastActive;

    // Only count if less than 30 minutes since last activity (user probably still here)
    if (timeDiff < 30 * 60 * 1000) {
      session.timeSpent += timeDiff;
    }

    session.lastActiveAt = new Date().toISOString();
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));

    return session;
  } catch (error) {
    console.error('Failed to load guest session:', error);
    return createNewGuestSession();
  }
}

/**
 * Create a new guest session
 */
function createNewGuestSession(): GuestSession {
  const session: GuestSession = {
    sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startedAt: new Date().toISOString(),
    timeSpent: 0,
    tripsCreated: 0,
    featuresUsed: [],
    lastActiveAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

/**
 * Track guest activity
 */
export function trackGuestActivity(feature: string) {
  const session = getGuestSession();

  if (!session.featuresUsed.includes(feature)) {
    session.featuresUsed.push(feature);
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Increment trips created counter
 */
function incrementTripsCreated() {
  const session = getGuestSession();
  session.tripsCreated += 1;
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
}

/**
 * Check if should show signup prompt based on engagement
 *
 * Triggers:
 * - 5+ minutes spent
 * - 2+ trips created
 * - Trying to collaborate
 * - Trying to save/export
 */
export function shouldShowSignupPrompt(reason?: SignupPromptReason): boolean {
  const session = getGuestSession();

  // Explicit triggers always show prompt
  if (reason === 'collaborate' || reason === 'save' || reason === 'export') {
    return true;
  }

  // Engagement-based triggers
  const fiveMinutes = 5 * 60 * 1000;
  if (session.timeSpent >= fiveMinutes) {
    return true;
  }

  if (session.tripsCreated >= 2) {
    return true;
  }

  return false;
}

export type SignupPromptReason =
  | 'collaborate'
  | 'share'
  | 'save'
  | 'export'
  | 'engagement'
  | 'feature_limit';

/**
 * Get signup prompt message based on reason
 */
export function getSignupPromptMessage(reason: SignupPromptReason): {
  title: string;
  description: string;
  benefit: string;
} {
  switch (reason) {
    case 'collaborate':
      return {
        title: 'Sign up to collaborate',
        description: 'Invite friends and family to plan together in real-time.',
        benefit: 'Free account • 30 seconds',
      };
    case 'share':
      return {
        title: 'Share your trip',
        description: 'Sign up to share a live read-only link of your itinerary with anyone.',
        benefit: 'Share with anyone',
      };
    case 'save':
      return {
        title: 'Save your trip',
        description:
          'Create a free account to save your trip permanently and access it from any device.',
        benefit: 'Never lose your plans',
      };
    case 'export':
      return {
        title: 'Export your trip',
        description: 'Sign up to export your itinerary as PDF or share a live link.',
        benefit: 'Beautiful PDF exports',
      };
    case 'engagement':
      return {
        title: 'Love planning with WanderPlan?',
        description:
          'Create a free account to save your trips, collaborate with others, and access premium features.',
        benefit: 'Free forever plan',
      };
    case 'feature_limit':
      return {
        title: 'Unlock more features',
        description:
          'You\'ve created multiple trips! Sign up for free to unlock unlimited trips and premium features.',
        benefit: 'No credit card required',
      };
    default:
      return {
        title: 'Create your free account',
        description: 'Save your trips and unlock collaboration features.',
        benefit: 'Free forever plan',
      };
  }
}

/**
 * Clear all guest data (called after successful migration)
 */
export function clearGuestData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_TRIPS_KEY);
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
}

/**
 * Export guest trips for migration to user account
 */
export function exportGuestTripsForMigration(): GuestTrip[] {
  return getGuestTrips();
}

// ============================================
// ⭐ EVENT MANAGEMENT FUNCTIONS
// ============================================

/**
 * Add an event to a trip
 */
export function addGuestEvent(
  tripId: string,
  event: Omit<GuestEvent, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>
): GuestEvent | null {
  const trips = getGuestTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) return null;

  const newEvent: GuestEvent = {
    ...event,
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tripId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  trip.events.push(newEvent);
  trip.updatedAt = new Date().toISOString();
  trip.engagementScore = (trip.engagementScore || 0) + 10; // +10 points for adding event

  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));
  trackGuestActivity('event_added');

  return newEvent;
}

/**
 * Get all events for a trip
 */
export function getGuestEvents(tripId: string): GuestEvent[] {
  const trip = getGuestTrip(tripId);
  return trip?.events || [];
}

/**
 * Get a single event
 */
export function getGuestEvent(tripId: string, eventId: string): GuestEvent | null {
  const trip = getGuestTrip(tripId);
  if (!trip) return null;
  return trip.events.find((e) => e.id === eventId) || null;
}

/**
 * Update an event
 */
export function updateGuestEvent(
  tripId: string,
  eventId: string,
  updates: Partial<Omit<GuestEvent, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>>
): GuestEvent | null {
  const trips = getGuestTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) return null;

  const eventIndex = trip.events.findIndex((e) => e.id === eventId);
  if (eventIndex === -1) return null;

  const updatedEvent: GuestEvent = {
    ...trip.events[eventIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  trip.events[eventIndex] = updatedEvent;
  trip.updatedAt = new Date().toISOString();

  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));
  trackGuestActivity('event_updated');

  return updatedEvent;
}

/**
 * Delete an event
 */
export function deleteGuestEvent(tripId: string, eventId: string): boolean {
  const trips = getGuestTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) return false;

  const initialLength = trip.events.length;
  trip.events = trip.events.filter((e) => e.id !== eventId);

  if (trip.events.length === initialLength) return false;

  trip.updatedAt = new Date().toISOString();
  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));
  trackGuestActivity('event_deleted');

  return true;
}

/**
 * Reorder events (for drag & drop)
 */
export function reorderGuestEvents(
  tripId: string,
  eventIds: string[]
): boolean {
  const trips = getGuestTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) return false;

  // Create a map of events by ID for quick lookup
  const eventMap = new Map(trip.events.map((e) => [e.id, e]));

  // Reorder events based on provided IDs
  const reorderedEvents = eventIds
    .map((id, index) => {
      const event = eventMap.get(id);
      if (event) {
        return { ...event, order: index };
      }
      return null;
    })
    .filter((e): e is GuestEvent => e !== null);

  trip.events = reorderedEvents;
  trip.updatedAt = new Date().toISOString();

  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));
  trackGuestActivity('events_reordered');

  return true;
}

// ============================================
// ⭐ EXPENSE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Add an expense to a trip
 */
export function addGuestExpense(
  tripId: string,
  expense: Omit<GuestExpense, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>
): GuestExpense | null {
  const trips = getGuestTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) return null;

  const newExpense: GuestExpense = {
    ...expense,
    id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tripId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  trip.expenses.push(newExpense);
  trip.updatedAt = new Date().toISOString();
  trip.engagementScore = (trip.engagementScore || 0) + 5; // +5 points for adding expense

  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));
  trackGuestActivity('expense_added');

  return newExpense;
}

/**
 * Get all expenses for a trip
 */
export function getGuestExpenses(tripId: string): GuestExpense[] {
  const trip = getGuestTrip(tripId);
  return trip?.expenses || [];
}

/**
 * Get a single expense
 */
export function getGuestExpense(tripId: string, expenseId: string): GuestExpense | null {
  const trip = getGuestTrip(tripId);
  if (!trip) return null;
  return trip.expenses.find((e) => e.id === expenseId) || null;
}

/**
 * Update an expense
 */
export function updateGuestExpense(
  tripId: string,
  expenseId: string,
  updates: Partial<Omit<GuestExpense, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>>
): GuestExpense | null {
  const trips = getGuestTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) return null;

  const expenseIndex = trip.expenses.findIndex((e) => e.id === expenseId);
  if (expenseIndex === -1) return null;

  const updatedExpense: GuestExpense = {
    ...trip.expenses[expenseIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  trip.expenses[expenseIndex] = updatedExpense;
  trip.updatedAt = new Date().toISOString();

  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));
  trackGuestActivity('expense_updated');

  return updatedExpense;
}

/**
 * Delete an expense
 */
export function deleteGuestExpense(tripId: string, expenseId: string): boolean {
  const trips = getGuestTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) return false;

  const initialLength = trip.expenses.length;
  trip.expenses = trip.expenses.filter((e) => e.id !== expenseId);

  if (trip.expenses.length === initialLength) return false;

  trip.updatedAt = new Date().toISOString();
  localStorage.setItem(GUEST_TRIPS_KEY, JSON.stringify(trips));
  trackGuestActivity('expense_deleted');

  return true;
}

/**
 * Get total expenses for a trip
 */
export function getTripTotalExpenses(tripId: string): number {
  const expenses = getGuestExpenses(tripId);
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Get expenses by category
 */
export function getExpensesByCategory(tripId: string): Record<string, number> {
  const expenses = getGuestExpenses(tripId);
  const byCategory: Record<string, number> = {};

  expenses.forEach((expense) => {
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
  });

  return byCategory;
}

// ============================================
// ⭐ HELPER FUNCTIONS
// ============================================

/**
 * Calculate engagement score for a trip
 */
export function calculateEngagementScore(tripId: string): number {
  const trip = getGuestTrip(tripId);
  if (!trip) return 0;

  let score = 0;

  // Base score
  score += 10; // Created trip

  // Events (with defensive check)
  score += (trip.events?.length || 0) * 10; // 10 points per event

  // Expenses (with defensive check)
  score += (trip.expenses?.length || 0) * 5; // 5 points per expense

  // Destinations (with defensive check)
  score += (trip.destinations?.length || 0) * 5; // 5 points per destination

  // Tags (with defensive check)
  score += (trip.tags?.length || 0) * 2; // 2 points per tag

  // Description
  if (trip.description && trip.description.length > 50) {
    score += 15; // Bonus for detailed description
  }

  return score;
}

/**
 * Get trip statistics
 */
export function getTripStatistics(tripId: string): {
  eventCount: number;
  expenseCount: number;
  totalSpent: number;
  dayCount: number;
  destinationCount: number;
  engagementScore: number;
} | null {
  const trip = getGuestTrip(tripId);
  if (!trip) return null;

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    eventCount: trip.events?.length || 0,
    expenseCount: trip.expenses?.length || 0,
    totalSpent: getTripTotalExpenses(tripId),
    dayCount,
    destinationCount: trip.destinations?.length || 0,
    engagementScore: calculateEngagementScore(tripId),
  };
}
