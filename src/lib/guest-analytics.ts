/**
 * Guest Mode Analytics Tracking
 *
 * Tracks user behavior in guest mode to optimize conversion funnel.
 * Integrates with your analytics provider (Google Analytics, Mixpanel, etc.)
 *
 * Key Metrics Tracked:
 * - Landing page visits
 * - Trip creation starts/completions
 * - Signup prompt views/dismissals/conversions
 * - Time spent in guest mode
 * - Feature usage patterns
 */

import { getGuestSession, getGuestTrips } from './guest-mode';

/**
 * Analytics event types
 */
export type AnalyticsEvent =
  | 'landing_page_view'
  | 'cta_click'
  | 'trip_builder_view'
  | 'trip_creation_started'
  | 'trip_creation_completed'
  | 'trip_view'
  | 'trip_list_view'
  | 'signup_prompt_shown'
  | 'signup_prompt_dismissed'
  | 'signup_prompt_clicked'
  | 'signup_completed'
  | 'feature_card_clicked';

/**
 * Event properties interface
 */
export interface AnalyticsEventProperties {
  // Common properties
  sessionId?: string;
  tripCount?: number;
  timeSpent?: number;

  // CTA specific
  ctaLocation?: 'hero' | 'features' | 'cta_section' | 'header' | 'trip_view' | 'trip_list';
  ctaText?: string;

  // Signup prompt specific
  promptReason?: 'collaborate' | 'save' | 'export' | 'engagement' | 'feature_limit';
  promptAction?: 'dismissed' | 'signup' | 'login';

  // Trip specific
  tripId?: string;
  tripName?: string;
  destinationCount?: number;
  tagCount?: number;

  // Feature specific
  featureName?: string;

  // Any additional custom properties
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track analytics event
 *
 * @param event - Event name
 * @param properties - Event properties
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties: AnalyticsEventProperties = {}
) {
  try {
    // Get guest session context
    const session = getGuestSession();
    const trips = getGuestTrips();

    // Enrich properties with session context
    const enrichedProperties: AnalyticsEventProperties = {
      ...properties,
      sessionId: session.sessionId,
      tripCount: trips.length,
      timeSpent: session.timeSpent,
      timestamp: Date.now(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, enrichedProperties);
    }

    // Track with Google Analytics (gtag)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, enrichedProperties);
    }

    // Track with Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event, enrichedProperties);
    }

    // Track with Plausible
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event, { props: enrichedProperties });
    }

    // Track with custom analytics endpoint (optional)
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties: enrichedProperties }),
      }).catch((error) => {
        console.error('[Analytics] Failed to send event:', error);
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, properties: AnalyticsEventProperties = {}) {
  trackEvent('landing_page_view', {
    ...properties,
    pageName,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  });
}

/**
 * Track CTA click
 */
export function trackCTAClick(
  ctaLocation: 'hero' | 'features' | 'cta_section' | 'header' | 'trip_view' | 'trip_list',
  ctaText: string
) {
  trackEvent('cta_click', {
    ctaLocation,
    ctaText,
  });
}

/**
 * Track trip creation
 */
export function trackTripCreation(tripId: string, tripData: {
  name: string;
  destinationCount: number;
  tagCount: number;
}) {
  trackEvent('trip_creation_completed', {
    tripId,
    tripName: tripData.name,
    destinationCount: tripData.destinationCount,
    tagCount: tripData.tagCount,
  });
}

/**
 * Track signup prompt
 */
export function trackSignupPrompt(
  action: 'shown' | 'dismissed' | 'clicked',
  reason: 'collaborate' | 'save' | 'export' | 'engagement' | 'feature_limit'
) {
  const eventMap = {
    shown: 'signup_prompt_shown' as const,
    dismissed: 'signup_prompt_dismissed' as const,
    clicked: 'signup_prompt_clicked' as const,
  };

  trackEvent(eventMap[action], {
    promptReason: reason,
    promptAction: action,
  });
}

/**
 * Track feature card click
 */
export function trackFeatureCardClick(
  featureName: string,
  location: 'trip_view' | 'landing'
) {
  trackEvent('feature_card_clicked', {
    featureName,
    location,
  });
}

/**
 * Track signup conversion
 */
export function trackSignupConversion(source: string) {
  const session = getGuestSession();
  const trips = getGuestTrips();

  trackEvent('signup_completed', {
    source,
    sessionDuration: session.timeSpent,
    tripsCreated: trips.length,
    featuresUsed: session.featuresUsed.length,
  });
}

/**
 * Get conversion funnel metrics
 */
export function getConversionMetrics() {
  const session = getGuestSession();
  const trips = getGuestTrips();

  return {
    sessionId: session.sessionId,
    sessionDuration: session.timeSpent,
    sessionDurationMinutes: Math.round(session.timeSpent / 60000),
    tripsCreated: trips.length,
    featuresUsed: session.featuresUsed,
    lastActive: new Date(session.lastActiveAt),
    shouldPromptSignup: session.timeSpent >= 5 * 60 * 1000 || trips.length >= 2,
  };
}

/**
 * Initialize analytics tracking
 * Call this in your app's root layout or _app.tsx
 */
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  // Track initial page view
  trackPageView('initial_load');

  // Track page views on navigation
  let lastPath = window.location.pathname;
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      trackPageView('navigation', { path: currentPath });
      lastPath = currentPath;
    }
  }, 1000);

  // Track time spent (update every 30 seconds)
  setInterval(() => {
    const session = getGuestSession();
    if (session.timeSpent > 0) {
      trackEvent('landing_page_view', {
        event: 'time_spent_update',
        timeSpent: session.timeSpent,
      });
    }
  }, 30000);

  // Track before unload
  window.addEventListener('beforeunload', () => {
    const metrics = getConversionMetrics();
    trackEvent('landing_page_view', {
      event: 'session_end',
      ...metrics,
    });
  });
}

/**
 * React hook for analytics tracking
 */
export function useGuestAnalytics() {
  return {
    trackPageView,
    trackCTAClick,
    trackTripCreation,
    trackSignupPrompt,
    trackFeatureCardClick,
    trackSignupConversion,
    getMetrics: getConversionMetrics,
  };
}
