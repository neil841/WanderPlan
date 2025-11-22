/**
 * CRM Clients List Page
 *
 * Main page for managing client relationships
 */

'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';

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

import { useClients } from '@/hooks/useClients';
import { useClientFilters } from '@/hooks/useClientFilters';
import { CreateClientDialog } from '@/components/crm/CreateClientDialog';
import { EditClientDialog } from '@/components/crm/EditClientDialog';
import { DeleteClientDialog } from '@/components/crm/DeleteClientDialog';
import type { Client, ClientStatus } from '@/types/crm';

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: ClientStatus }) {
  const variants = {
    LEAD: 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    INACTIVE: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  };

  const icons = {
    LEAD: '🔵',
    ACTIVE: '🟢',
    INACTIVE: '⚫',
  };

  return (
    <Badge
      className={variants[status]}
      variant="outline"
      aria-label={`Status: ${status}`}
    >
      <span className="mr-1" aria-hidden="true">{icons[status]}</span>
      {status}
    </Badge>
  );
}

/**
 * Client list page component
 */
export default function ClientsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const { filters, setSearch, setStatus, setPage } = useClientFilters();

  // Fetch clients with current filters
  const { data, isLoading, error } = useClients({
    page: filters.page,
    limit: 20,
    q: filters.search,
    status: filters.status === 'all' ? undefined : filters.status,
    sort: filters.sort,
    order: filters.order,
  });

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const timeoutId = setTimeout(() => {
      setSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  // Handle edit client
  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  // Handle delete client
  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  // Table animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Clients
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          Manage your client relationships
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search clients..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Search clients by name, email, or source"
            />
          </div>

          {/* Status filter */}
          <Select
            value={filters.status}
            onValueChange={(value) => setStatus(value as ClientStatus | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by client status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="LEAD">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  LEAD
                </span>
              </SelectItem>
              <SelectItem value="ACTIVE">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  ACTIVE
                </span>
              </SelectItem>
              <SelectItem value="INACTIVE">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  INACTIVE
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add client button */}
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Client
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Loading state */}
        {isLoading && (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>
              {error.message || 'Failed to load clients. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !error && data?.clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first client
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Client
            </Button>
          </div>
        )}

        {/* Data table */}
        {!isLoading && !error && data && data.clients.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Source</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {data.clients.map((client) => (
                  <motion.tr
                    key={client.id}
                    variants={rowVariants}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {client.firstName} {client.lastName}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={client.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.source || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            aria-label={`Actions for ${client.firstName} ${client.lastName}`}
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(client)}>
                            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(client)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </motion.tbody>
            </Table>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(data.page - 1) * data.limit + 1}-
                  {Math.min(data.page * data.limit, data.total)} of {data.total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(filters.page - 1)}
                    disabled={filters.page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, data.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={filters.page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-8"
                          aria-label={`Page ${pageNum}`}
                          aria-current={filters.page === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(filters.page + 1)}
                    disabled={filters.page === data.totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <CreateClientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedClient && (
        <>
          <EditClientDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            client={selectedClient}
          />

          <DeleteClientDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            client={selectedClient}
          />
        </>
      )}
    </div>
  );
}
