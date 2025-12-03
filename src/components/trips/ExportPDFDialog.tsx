'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Mail, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { downloadICS } from '@/lib/calendar/ics-generator';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon } from 'lucide-react';

interface ExportPDFDialogProps {
  tripId: string;
  tripName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportOptions {
  includeMap: boolean;
  includeBudget: boolean;
  includeCollaborators: boolean;
}

/**
 * ExportPDFDialog Component
 *
 * Provides a dialog for exporting trip details as a PDF
 * with customizable options and email delivery
 *
 * Features:
 * - Customizable export sections (map, budget, collaborators)
 * - Download PDF to device
 * - Email PDF to specified address
 * - Loading states during PDF generation
 * - Success/error toast notifications
 * - Responsive design (mobile-friendly)
 * - WCAG 2.1 AA compliant
 *
 * @component
 */
export function ExportPDFDialog({
  tripId,
  tripName,
  open,
  onOpenChange,
}: ExportPDFDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailError, setEmailError] = useState('');

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMap: true,
    includeBudget: true,
    includeCollaborators: true,
  });

  // Fetch trip data for ICS generation
  const { data: tripData } = useQuery({
    queryKey: ['trip-events', tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}`);
      if (!res.ok) throw new Error('Failed to fetch trip data');
      return res.json();
    },
    enabled: open,
  });

  const handleCalendarSync = () => {
    if (!tripData?.data) {
      toast.error('Trip data not loaded yet');
      return;
    }

    try {
      downloadICS({
        name: tripName,
        events: tripData.data.events || []
      });
      toast.success('Calendar file downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate calendar file');
    }
  };

  /**
   * Validate email address format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Build query parameters for PDF export API
   */
  const buildQueryParams = (email?: string): string => {
    const params = new URLSearchParams();

    if (exportOptions.includeMap) params.append('includeMap', 'true');
    if (exportOptions.includeBudget) params.append('includeBudget', 'true');
    if (exportOptions.includeCollaborators) params.append('includeCollaborators', 'true');
    if (email) params.append('email', email);

    return params.toString();
  };

  /**
   * Handle PDF download to device
   */
  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/trips/${tripId}/export/pdf?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate PDF');
      }

      // Get blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tripName.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success toast
      toast.success('PDF Downloaded', {
        description: 'Your trip itinerary has been downloaded successfully',
        icon: <CheckCircle2 className="w-4 h-4" />,
      });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to download PDF:', error);

      toast.error('Download Failed', {
        description: error instanceof Error ? error.message : 'Failed to generate PDF',
        icon: <XCircle className="w-4 h-4" />,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Handle PDF email delivery
   */
  const handleEmailSend = async () => {
    // Validate email
    if (!emailAddress.trim()) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(emailAddress)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setIsEmailSending(true);

    try {
      const queryParams = buildQueryParams(emailAddress);
      const response = await fetch(`/api/trips/${tripId}/export/pdf?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send PDF');
      }

      const data = await response.json();

      // Show success toast
      toast.success('PDF Sent', {
        description: `Trip itinerary has been sent to ${emailAddress}`,
        icon: <CheckCircle2 className="w-4 h-4" />,
      });

      // Reset form and close dialog
      setEmailAddress('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send PDF:', error);

      toast.error('Send Failed', {
        description: error instanceof Error ? error.message : 'Failed to send PDF via email',
        icon: <XCircle className="w-4 h-4" />,
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  /**
   * Toggle export option
   */
  const toggleOption = (option: keyof ExportOptions) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Export Trip as PDF
          </DialogTitle>
          <DialogDescription>
            Customize your PDF export and download or email your trip itinerary
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 py-4"
        >
          {/* Export Options */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Include in PDF</Label>

            <div className="space-y-3">
              {/* Include Map */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMap"
                  checked={exportOptions.includeMap}
                  onCheckedChange={() => toggleOption('includeMap')}
                />
                <Label
                  htmlFor="includeMap"
                  className="text-sm font-normal cursor-pointer"
                >
                  Map with event markers
                </Label>
              </div>

              {/* Include Budget */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeBudget"
                  checked={exportOptions.includeBudget}
                  onCheckedChange={() => toggleOption('includeBudget')}
                />
                <Label
                  htmlFor="includeBudget"
                  className="text-sm font-normal cursor-pointer"
                >
                  Budget summary and expenses
                </Label>
              </div>

              {/* Include Collaborators */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCollaborators"
                  checked={exportOptions.includeCollaborators}
                  onCheckedChange={() => toggleOption('includeCollaborators')}
                />
                <Label
                  htmlFor="includeCollaborators"
                  className="text-sm font-normal cursor-pointer"
                >
                  Collaborator list
                </Label>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email to (optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={emailAddress}
              onChange={(e) => {
                setEmailAddress(e.target.value);
                setEmailError('');
              }}
              className={emailError ? 'border-destructive' : ''}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {emailError}
              </p>
            )}
          </div>
        </motion.div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Download Button */}
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading || isEmailSending}
            className="w-full sm:w-auto"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>



          {/* Calendar Sync Button */}
          <Button
            variant="outline"
            onClick={handleCalendarSync}
            disabled={!tripData}
            className="w-full sm:w-auto"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Add to Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
