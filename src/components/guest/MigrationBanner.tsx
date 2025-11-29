/**
 * Migration Banner Component
 *
 * Shows a banner prompting user to import their guest trips after signup/login.
 * Appears at the top of the dashboard or trips page.
 *
 * Usage:
 * Add to your authenticated dashboard/trips layout:
 * <MigrationBanner />
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { hasGuestTripsToMigrate, getGuestTripCount, migrateGuestTripsOnAuth } from '@/lib/guest-migration';

export function MigrationBanner() {
  const [show, setShow] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if there are guest trips to migrate
    if (hasGuestTripsToMigrate()) {
      setShow(true);
      setTripCount(getGuestTripCount());
    }
  }, []);

  const handleImport = async () => {
    setIsImporting(true);
    setImportStatus('idle');
    setErrorMessage('');

    try {
      const result = await migrateGuestTripsOnAuth();

      if (result.success) {
        setImportStatus('success');
        setTimeout(() => {
          setShow(false);
        }, 3000);
      } else {
        setImportStatus('error');
        setErrorMessage(
          result.errors.length > 0
            ? result.errors[0]
            : 'Failed to import trips'
        );
      }
    } catch (error) {
      setImportStatus('error');
      setErrorMessage('An unexpected error occurred');
      console.error('Migration error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {importStatus === 'success' ? (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Success!</strong> {tripCount} {tripCount === 1 ? 'trip has' : 'trips have'} been imported to your account.
            </AlertDescription>
          </Alert>
        ) : importStatus === 'error' ? (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900">
              <strong>Error:</strong> {errorMessage}
              <Button
                variant="link"
                size="sm"
                onClick={handleImport}
                className="ml-2 h-auto p-0 text-red-900 underline"
              >
                Try again
              </Button>
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="absolute right-2 top-2 h-6 w-6"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        ) : (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Upload className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between text-blue-900">
              <div>
                <strong>Welcome!</strong> You have {tripCount} {tripCount === 1 ? 'trip' : 'trips'} saved locally.
                Would you like to import {tripCount === 1 ? 'it' : 'them'} to your account?
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {isImporting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Trips
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={isImporting}
                  size="sm"
                >
                  Maybe Later
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
