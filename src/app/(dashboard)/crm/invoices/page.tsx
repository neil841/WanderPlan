/**
 * Invoices List Page
 *
 * Display all invoices with search, filters, and pagination
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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { MarkAsPaidDialog } from '@/components/invoices/MarkAsPaidDialog';
import { DeleteInvoiceDialog } from '@/components/invoices/DeleteInvoiceDialog';
import { formatCurrency, formatDate, truncateText } from '@/lib/formatters';
import type { Invoice, InvoiceStatusDB } from '@/types/invoice';

/**
 * Helper to calculate effective invoice status (including OVERDUE)
 */
function getEffectiveStatus(invoice: Invoice) {
  const isOverdue =
    invoice.status === 'SENT' &&
    new Date(invoice.dueDate) < new Date() &&
    !invoice.paidAt;
  return isOverdue ? 'OVERDUE' : invoice.status;
}

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filters from URL
  const page = Number(searchParams.get('page')) || 1;
  const statusFilter = (searchParams.get('status') as InvoiceStatusDB) || undefined;
  const clientId = searchParams.get('clientId') || undefined;

  // Local state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Dialog state
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch invoices
  const { data, isLoading, error } = useInvoices({
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

  const handleView = (invoice: Invoice) => {
    router.push(`/crm/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: Invoice) => {
    router.push(`/crm/invoices/${invoice.id}/edit`);
  };

  const handleMarkPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setMarkPaidDialogOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const canEdit = (invoice: Invoice) => {
    return invoice.status === 'DRAFT';
  };

  const canMarkPaid = (invoice: Invoice) => {
    return invoice.status === 'SENT' || getEffectiveStatus(invoice) === 'OVERDUE';
  };

  const canDelete = (invoice: Invoice) => {
    return invoice.status !== 'PAID';
  };

  // Empty state
  const showEmptyState = !isLoading && data?.invoices.length === 0;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              Create and manage client invoices
            </p>
          </div>
          <Button asChild>
            <Link href="/crm/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices by number or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search invoices by number or title"
          />
        </div>

        <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by invoice status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load invoices'}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first client invoice
          </p>
          <Button asChild>
            <Link href="/crm/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
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
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-[200px]" />
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
                // Invoice rows
                data?.invoices.map((invoice) => {
                  const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;
                  const effectiveStatus = getEffectiveStatus(invoice);

                  return (
                    <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium font-mono text-sm">
                        <button
                          onClick={() => handleView(invoice)}
                          className="text-left hover:underline focus:underline"
                          title={invoice.invoiceNumber}
                        >
                          {invoice.invoiceNumber}
                        </button>
                      </TableCell>
                      <TableCell>{clientName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {truncateText(invoice.title, 40)}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={effectiveStatus} />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(invoice.dueDate, 'short')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(invoice)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {canEdit(invoice) && (
                              <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canMarkPaid(invoice) && (
                              <DropdownMenuItem onClick={() => handleMarkPaid(invoice)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {canDelete(invoice) && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(invoice)}
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
      {selectedInvoice && (
        <>
          <MarkAsPaidDialog
            open={markPaidDialogOpen}
            onOpenChange={setMarkPaidDialogOpen}
            invoice={selectedInvoice}
            onSuccess={() => setMarkPaidDialogOpen(false)}
          />
          <DeleteInvoiceDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            invoice={selectedInvoice}
            onSuccess={() => setDeleteDialogOpen(false)}
          />
        </>
      )}
    </div>
  );
}
