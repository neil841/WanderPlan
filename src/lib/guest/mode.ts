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
  createdAt: string;
  updatedAt: string;
}

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
 */
export function getGuestTrips(): GuestTrip[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(GUEST_TRIPS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
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
