/**
 * Proposals List Page
 *
 * Display all proposals with search, filters, and pagination
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { useDebounce } from '@/hooks/useDebounce';
import { ProposalStatusBadge } from '@/components/proposals/ProposalStatusBadge';
import { SendProposalDialog } from '@/components/proposals/SendProposalDialog';
import { DeleteProposalDialog } from '@/components/proposals/DeleteProposalDialog';
import { formatCurrency, formatDate, truncateText } from '@/lib/formatters';
import type { Proposal, ProposalStatus } from '@/types/proposal';

export default function ProposalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filters from URL
  const page = Number(searchParams.get('page')) || 1;
  const statusFilter = (searchParams.get('status') as ProposalStatus) || undefined;
  const clientId = searchParams.get('clientId') || undefined;

  // Local state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Fetch proposals
  const { data, isLoading, error } = useProposals({
    page,
    limit: 20,
    search: debouncedSearch,
    status: statusFilter,
    clientId,
  });

  // Update URL with filter changes
  const updateFilters = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    if (key !== 'page') {
      params.set('page', '1');
    }

    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    updateFilters('status', value === 'all' ? undefined : value);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters('page', newPage.toString());
  };

  const handleView = (proposal: Proposal) => {
    router.push(`/crm/proposals/${proposal.id}`);
  };

  const handleEdit = (proposal: Proposal) => {
    router.push(`/crm/proposals/${proposal.id}/edit`);
  };

  const handleSend = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setSendDialogOpen(true);
  };

  const handleDelete = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setDeleteDialogOpen(true);
  };

  const canEdit = (proposal: Proposal) => {
    return proposal.status === 'DRAFT';
  };

  const canSend = (proposal: Proposal) => {
    return proposal.status === 'DRAFT';
  };

  const canDelete = (proposal: Proposal) => {
    return proposal.status !== 'ACCEPTED';
  };

  // Empty state
  const showEmptyState = !isLoading && data?.proposals.length === 0;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Proposals</h1>
            <p className="text-muted-foreground">
              Create and manage client proposals
            </p>
          </div>
          <Button asChild>
            <Link href="/crm/proposals/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Proposal
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search proposals by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search proposals by title or description"
          />
        </div>

        <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by proposal status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load proposals'}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first client proposal
          </p>
          <Button asChild>
            <Link href="/crm/proposals/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Proposal
            </Link>
          </Button>
        </div>
      )}

      {/* Table */}
      {!showEmptyState && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Trip</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden lg:table-cell">Valid Until</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                // Proposal rows
                data?.proposals.map((proposal) => {
                  const clientName = `${proposal.client.firstName} ${proposal.client.lastName}`;
                  const tripName = proposal.trip?.name || '-';

                  return (
                    <TableRow key={proposal.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleView(proposal)}
                          className="text-left hover:underline focus:underline"
                          title={proposal.title}
                        >
                          {truncateText(proposal.title, 50)}
                        </button>
                      </TableCell>
                      <TableCell>{clientName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {truncateText(tripName, 30)}
                      </TableCell>
                      <TableCell>
                        <ProposalStatusBadge status={proposal.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(proposal.total, proposal.currency)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(proposal.validUntil, 'short')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label={`Actions for ${proposal.title}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(proposal)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {canEdit(proposal) && (
                              <DropdownMenuItem onClick={() => handleEdit(proposal)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canSend(proposal) && (
                              <DropdownMenuItem onClick={() => handleSend(proposal)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send
                              </DropdownMenuItem>
                            )}
                            {canDelete(proposal) && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(proposal)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {selectedProposal && (
        <>
          <SendProposalDialog
            open={sendDialogOpen}
            onOpenChange={setSendDialogOpen}
            proposal={selectedProposal}
            onSuccess={() => setSendDialogOpen(false)}
          />
          <DeleteProposalDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            proposal={selectedProposal}
            onSuccess={() => setDeleteDialogOpen(false)}
          />
        </>
      )}
    </div>
  );
}
