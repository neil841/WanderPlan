/**
 * Guest Storage Error Handling & Recovery
 *
 * Handles localStorage edge cases:
 * - Quota exceeded
 * - Storage disabled (private browsing)
 * - Data corruption
 * - Automatic recovery and backup
 */

/**
 * Storage error types
 */
export type StorageError =
  | 'QUOTA_EXCEEDED'
  | 'STORAGE_DISABLED'
  | 'DATA_CORRUPTED'
  | 'UNKNOWN_ERROR';

/**
 * Storage result interface
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
  errorMessage?: string;
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get storage quota information
 */
export async function getStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
    const available = quota - usage;

    return { usage, quota, percentUsed, available };
  }

  // Fallback for browsers without storage API
  return {
    usage: 0,
    quota: 5 * 1024 * 1024, // Assume 5MB
    percentUsed: 0,
    available: 5 * 1024 * 1024,
  };
}

/**
 * Check if storage is nearly full
 */
export async function isStorageNearlyFull(): Promise<boolean> {
  const { percentUsed } = await getStorageQuota();
  return percentUsed > 80; // Consider 80%+ as nearly full
}

/**
 * Safe localStorage get with error handling
 */
export function safeGetItem<T>(key: string): StorageResult<T> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'STORAGE_DISABLED',
        errorMessage: 'localStorage is not available (private browsing mode?)',
      };
    }

    const item = localStorage.getItem(key);
    if (!item) {
      return { success: true, data: undefined };
    }

    const parsed = JSON.parse(item) as T;
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'DATA_CORRUPTED',
        errorMessage: 'Failed to parse stored data',
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Safe localStorage set with error handling and quota checking
 */
export async function safeSetItem(
  key: string,
  value: any
): Promise<StorageResult<void>> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'STORAGE_DISABLED',
        errorMessage: 'localStorage is not available',
      };
    }

    // Check if storage is nearly full before attempting to save
    const nearlyFull = await isStorageNearlyFull();
    if (nearlyFull) {
      console.warn('[Storage] Storage is nearly full. Consider clearing old data.');
    }

    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);

    return { success: true };
  } catch (error) {
    // Check if it's a quota exceeded error
    if (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      return {
        success: false,
        error: 'QUOTA_EXCEEDED',
        errorMessage: 'Storage quota exceeded. Please clear some trips or sign up to save permanently.',
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create backup of data before modification
 */
export function createBackup(key: string): StorageResult<void> {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      localStorage.setItem(`${key}_backup`, data);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorMessage: 'Failed to create backup',
    };
  }
}

/**
 * Restore from backup
 */
export function restoreFromBackup(key: string): StorageResult<void> {
  try {
    const backup = localStorage.getItem(`${key}_backup`);
    if (backup) {
      localStorage.setItem(key, backup);
      return { success: true };
    }
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorMessage: 'No backup found',
    };
  } catch (error) {
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorMessage: 'Failed to restore from backup',
    };
  }
}

/**
 * Clear old session data to free up space
 */
export function clearOldSessionData(): StorageResult<void> {
  try {
    const keysToCheck = [
      'guest_trips',
      'guest_session',
      'guest_trips_backup',
      'guest_session_backup',
    ];

    for (const key of keysToCheck) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          // If it has a lastActiveAt field, check if it's old
          if (parsed.lastActiveAt) {
            const lastActive = new Date(parsed.lastActiveAt);
            const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

            // Clear data older than 30 days
            if (daysSinceActive > 30) {
              localStorage.removeItem(key);
              console.log(`[Storage] Cleared old data: ${key}`);
            }
          }
        } catch (e) {
          // If we can't parse it, it might be corrupted, remove it
          localStorage.removeItem(key);
        }
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorMessage: 'Failed to clear old data',
    };
  }
}

/**
 * Get storage usage by key
 */
export function getStorageUsageByKey(): Record<string, number> {
  const usage: Record<string, number> = {};

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          usage[key] = new Blob([value]).size;
        }
      }
    }
  } catch (error) {
    console.error('[Storage] Failed to get storage usage:', error);
  }

  return usage;
}

/**
 * Get total localStorage usage
 */
export function getTotalStorageUsage(): number {
  const usage = getStorageUsageByKey();
  return Object.values(usage).reduce((total, size) => total + size, 0);
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get storage health report
 */
export async function getStorageHealthReport(): Promise<{
  available: boolean;
  quota: string;
  usage: string;
  percentUsed: number;
  tripCount: number;
  recommendations: string[];
}> {
  const available = isLocalStorageAvailable();
  const { usage, quota, percentUsed } = await getStorageQuota();
  const recommendations: string[] = [];

  if (!available) {
    recommendations.push('localStorage is disabled. Please disable private browsing mode.');
  }

  if (percentUsed > 80) {
    recommendations.push('Storage is nearly full. Consider signing up to save trips permanently.');
  }

  if (percentUsed > 90) {
    recommendations.push('Storage is critically full. Some trips may not save properly.');
  }

  // Get trip count
  const tripsResult = safeGetItem<any[]>('guest_trips');
  const tripCount = tripsResult.success && tripsResult.data ? tripsResult.data.length : 0;

  if (tripCount > 10) {
    recommendations.push('You have many trips. Sign up to keep them safe and access from any device.');
  }

  return {
    available,
    quota: formatBytes(quota),
    usage: formatBytes(usage),
    percentUsed: Math.round(percentUsed),
    tripCount,
    recommendations,
  };
}

/**
 * React hook for storage monitoring
 */
export function useStorageMonitoring() {
  const checkHealth = async () => {
    const health = await getStorageHealthReport();

    if (health.percentUsed > 80) {
      console.warn('[Storage] Storage usage is high:', health);
    }

    return health;
  };

  return {
    checkHealth,
    isAvailable: isLocalStorageAvailable(),
    getQuota: getStorageQuota,
    getUsage: getTotalStorageUsage,
  };
}
