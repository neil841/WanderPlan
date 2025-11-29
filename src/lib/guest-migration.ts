/**
 * Guest Data Migration Utilities
 *
 * Handles migrating guest trips from localStorage to database when user signs up.
 * This ensures users don't lose their work when they create an account.
 *
 * Usage:
 * 1. After successful signup, call migrateGuestTripsToDatabase(userId)
 * 2. This will import all localStorage trips to the user's account
 * 3. Clear localStorage after successful migration
 */

import { getGuestTrips, clearGuestTrips } from './guest-mode';

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Migrate guest trips from localStorage to database
 *
 * @param userId - The authenticated user's ID
 * @returns Migration result with success status and counts
 */
export async function migrateGuestTripsToDatabase(
  userId: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    errors: [],
  };

  try {
    // Get all guest trips from localStorage
    const guestTrips = getGuestTrips();

    if (guestTrips.length === 0) {
      return result; // Nothing to migrate
    }

    console.log(`[Migration] Found ${guestTrips.length} guest trips to migrate for user ${userId}`);

    // Migrate each trip
    for (const guestTrip of guestTrips) {
      try {
        // Call API to create trip in database
        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: guestTrip.name,
            description: guestTrip.description,
            startDate: guestTrip.startDate,
            endDate: guestTrip.endDate,
            destinations: guestTrip.destinations,
            tags: guestTrip.tags,
            visibility: guestTrip.visibility,
            // Mark as migrated from guest mode
            _migratedFromGuest: true,
            _originalGuestId: guestTrip.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to migrate trip: ${response.statusText}`);
        }

        const createdTrip = await response.json();
        console.log(`[Migration] Successfully migrated trip: ${guestTrip.name} (${guestTrip.id} → ${createdTrip.id})`);
        result.migratedCount++;
      } catch (error) {
        console.error(`[Migration] Failed to migrate trip ${guestTrip.id}:`, error);
        result.failedCount++;
        result.errors.push(`Failed to migrate "${guestTrip.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // If all trips migrated successfully, clear localStorage
    if (result.failedCount === 0) {
      clearGuestTrips();
      console.log('[Migration] All trips migrated successfully. Cleared localStorage.');
    } else {
      console.warn(`[Migration] ${result.failedCount} trips failed to migrate. Keeping localStorage data.`);
      result.success = false;
    }
  } catch (error) {
    console.error('[Migration] Migration process failed:', error);
    result.success = false;
    result.errors.push(`Migration process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Check if user has guest trips that need migration
 *
 * @returns true if there are guest trips in localStorage
 */
export function hasGuestTripsToMigrate(): boolean {
  const trips = getGuestTrips();
  return trips.length > 0;
}

/**
 * Get count of guest trips pending migration
 *
 * @returns number of trips in localStorage
 */
export function getGuestTripCount(): number {
  const trips = getGuestTrips();
  return trips.length;
}

/**
 * Show migration prompt to user
 *
 * @returns object with message and trip count
 */
export function getMigrationPromptMessage(): {
  title: string;
  message: string;
  tripCount: number;
} {
  const tripCount = getGuestTripCount();

  return {
    title: 'Import Your Trips',
    message: `You have ${tripCount} ${tripCount === 1 ? 'trip' : 'trips'} saved locally. Would you like to import ${tripCount === 1 ? 'it' : 'them'} to your account?`,
    tripCount,
  };
}

/**
 * Client-side hook to trigger migration after login/signup
 *
 * Call this from your signup/login success handler:
 *
 * @example
 * // In your signup success handler:
 * const result = await migrateGuestTripsOnAuth();
 * if (result.success) {
 *   toast.success(`${result.migratedCount} trips imported successfully!`);
 * }
 */
export async function migrateGuestTripsOnAuth(): Promise<MigrationResult> {
  // Check if user has guest trips
  if (!hasGuestTripsToMigrate()) {
    return {
      success: true,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
    };
  }

  // Get current session to get userId
  const sessionResponse = await fetch('/api/auth/session');
  if (!sessionResponse.ok) {
    return {
      success: false,
      migratedCount: 0,
      failedCount: 0,
      errors: ['No active session found'],
    };
  }

  const session = await sessionResponse.json();
  if (!session?.user?.id) {
    return {
      success: false,
      migratedCount: 0,
      failedCount: 0,
      errors: ['User ID not found in session'],
    };
  }

  // Perform migration
  return await migrateGuestTripsToDatabase(session.user.id);
}

/**
 * Auto-migration wrapper component helper
 *
 * Usage in your auth callback page:
 *
 * @example
 * useEffect(() => {
 *   if (session?.user && hasGuestTripsToMigrate()) {
 *     migrateGuestTripsOnAuth().then((result) => {
 *       if (result.success) {
 *         toast.success(`Imported ${result.migratedCount} trips!`);
 *       } else {
 *         toast.error('Some trips could not be imported');
 *       }
 *     });
 *   }
 * }, [session]);
 */
export function useGuestMigration() {
  return {
    hasTripsToMigrate: hasGuestTripsToMigrate(),
    tripCount: getGuestTripCount(),
    migrate: migrateGuestTripsOnAuth,
    getPromptMessage: getMigrationPromptMessage,
  };
}
