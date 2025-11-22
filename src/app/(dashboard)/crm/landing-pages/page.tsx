/**
 * Landing Pages List Page
 *
 * Management dashboard for landing pages with lead capture
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useLandingPages } from '@/hooks/useLandingPages';
import { CreateLandingPageDialog } from '@/components/landing-pages/CreateLandingPageDialog';
import { DeleteLandingPageDialog } from '@/components/landing-pages/DeleteLandingPageDialog';
import type { LandingPage } from '@/types/landing-page';

/**
 * Status badge component
 */
function StatusBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) {
    return (
      <Badge
        className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
        variant="outline"
        aria-label="Status: Published"
      >
        <span className="mr-1" aria-hidden="true">🟢</span>
        Published
      </Badge>
    );
  }

  return (
    <Badge
      className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      variant="outline"
      aria-label="Status: Draft"
    >
      <span className="mr-1" aria-hidden="true">🔴</span>
      Draft
    </Badge>
  );
}

/**
 * Landing pages list page component
 */
export default function LandingPagesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch landing pages with current filters
  const { data, isLoading, error } = useLandingPages({
    page: currentPage,
    limit: 20,
    q: searchQuery,
    status: statusFilter,
    sort: 'updatedAt',
    order: 'desc',
  });

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const timeoutId = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value as 'all' | 'published' | 'draft');
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = (landingPage: LandingPage) => {
    setSelectedLandingPage(landingPage);
    setDeleteDialogOpen(true);
  };

  // Handle duplicate (future enhancement)
  const handleDuplicate = (landingPage: LandingPage) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate:', landingPage);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load landing pages. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const landingPages = data?.data?.landingPages || [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // Empty state
  if (landingPages.length === 0 && !searchQuery && statusFilter === 'all') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            Landing Pages
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Create beautiful landing pages to capture leads
          </p>
        </div>

        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="w-16 h-16 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            No Landing Pages Yet
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 text-center max-w-sm">
            Create your first landing page to start capturing leads for your trips
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Landing Page
          </Button>
        </motion.div>

        <CreateLandingPageDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Landing Pages
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Create beautiful landing pages to capture leads
        </p>
      </motion.div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search landing pages..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search landing pages"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        {/* Create Button */}
        <Button onClick={() => setCreateDialogOpen(true)} size="default">
          <Plus className="w-4 h-4 mr-2" />
          Create Landing Page
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden md:table-cell">Trip</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Leads</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landingPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-neutral-500">
                  No landing pages found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              landingPages.map((landingPage) => (
                <motion.tr
                  key={landingPage.id}
                  variants={itemVariants}
                  className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {landingPage.title}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded font-mono">
                      {landingPage.slug}
                    </code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {landingPage.trip ? (
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {landingPage.trip.name}
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge isPublished={landingPage.isPublished} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <Users className="w-4 h-4" />
                      <span>0 leads</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600 dark:text-neutral-400">
                    {format(new Date(landingPage.updatedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`Actions for ${landingPage.title}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {landingPage.isPublished && (
                          <>
                            <DropdownMenuItem asChild>
                              <a
                                href={`/p/${landingPage.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Public Page
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/crm/landing-pages/${landingPage.slug}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(landingPage)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(landingPage)}
                          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {((currentPage - 1) * (pagination.limit || 20)) + 1} to{' '}
              {Math.min(currentPage * (pagination.limit || 20), pagination.total || 0)} of{' '}
              {pagination.total || 0}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <CreateLandingPageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedLandingPage && (
        <DeleteLandingPageDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          landingPage={selectedLandingPage}
        />
      )}
    </div>
  );
}
