/**
 * Invoices API Routes
 *
 * POST /api/invoices - Create a new invoice
 * GET /api/invoices - List invoices with filtering, search, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInvoiceSchema, invoiceQuerySchema } from '@/lib/validations/invoice';
import { generateInvoiceNumber } from '@/lib/invoices/invoice-number';
import type { InvoicesResponse, InvoiceStatus } from '@/types/invoice';
import { checkGenericRateLimit } from '@/lib/auth/rate-limit';

/**
 * Calculate effective invoice status (including dynamic OVERDUE)
 *
 * @param dbStatus - Status from database (DRAFT, SENT, PAID)
 * @param dueDate - Invoice due date
 * @param paidAt - Payment date (if paid)
 * @param currentDate - Current date for comparison (defaults to now)
 * @returns Effective status including OVERDUE if applicable
 */
function calculateInvoiceStatus(
  dbStatus: string,
  dueDate: Date,
  paidAt: Date | null,
  currentDate: Date = new Date()
): InvoiceStatus {
  // PAID status never changes
  if (dbStatus === 'PAID' || paidAt) {
    return 'PAID';
  }

  // DRAFT status stays DRAFT
  if (dbStatus === 'DRAFT') {
    return 'DRAFT';
  }

  // SENT status can become OVERDUE
  if (dbStatus === 'SENT' && dueDate) {
    // Normalize to midnight for fair comparison
    const dueDateMidnight = new Date(dueDate);
    dueDateMidnight.setHours(0, 0, 0, 0);

    const currentDateMidnight = new Date(currentDate);
    currentDateMidnight.setHours(0, 0, 0, 0);

    // Only overdue if current date is AFTER due date
    if (currentDateMidnight > dueDateMidnight) {
      return 'OVERDUE';
    }
  }

  return dbStatus as InvoiceStatus;
}

/**
 * POST /api/invoices
 *
 * Create a new invoice for a client
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (prevent spam/abuse)
    const { isLimited, resetInMinutes } = checkGenericRateLimit(
      `invoices:${session.user.id}`,
      60, // Max 60 invoice creations
      60 * 60 * 1000 // per hour
    );

    if (isLimited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many invoice creations. Please try again in ${resetInMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      clientId,
      tripId,
      title,
      description,
      lineItems,
      tax,
      discount,
      currency,
      issueDate,
      dueDate,
      notes,
      terms,
    } = validation.data;

    // Verify client exists and belongs to user
    const client = await prisma.crmClient.findFirst({
      where: {
        id: clientId,
        userId: session.user.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Verify trip exists and belongs to user (if provided)
    if (tripId) {
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          createdBy: session.user.id,
        },
      });

      if (!trip) {
        return NextResponse.json(
          { error: 'Trip not found or does not belong to you' },
          { status: 404 }
        );
      }
    }

    // Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate subtotal from line items
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate total: subtotal + tax - discount
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    // Validate total is positive
    if (total < 0) {
      return NextResponse.json(
        { error: 'Total cannot be negative' },
        { status: 400 }
      );
    }

    // Create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: session.user.id,
        clientId,
        tripId: tripId || null,
        title,
        description: description || null,
        lineItems: lineItems as any, // Prisma Json type
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        currency: currency || 'USD',
        status: 'DRAFT',
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes: notes || null,
        terms: terms || null,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        trip: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    // Calculate effective status (including OVERDUE)
    const effectiveStatus = calculateInvoiceStatus(
      invoice.status,
      invoice.dueDate,
      invoice.paidAt
    );

    const response = {
      invoice: {
        ...invoice,
        lineItems: invoice.lineItems as any,
        subtotal: Number(invoice.subtotal),
        tax: Number(invoice.tax),
        discount: Number(invoice.discount),
        total: Number(invoice.total),
        status: effectiveStatus,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invoices
 *
 * List all invoices for the current user with filtering, search, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      clientId: searchParams.get('clientId'),
      search: searchParams.get('search'),
      overdue: searchParams.get('overdue'),
    };

    // Validate query params
    const validation = invoiceQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, status, clientId, search, overdue } = validation.data;

    // Build where clause
    const where: any = {
      userId: session.user.id,
      deletedAt: null, // Only show non-deleted invoices
    };

    // Filter by status
    if (status) {
      if (status === 'OVERDUE') {
        // Special handling for OVERDUE: filter in application layer
        // Get SENT invoices and filter by due date
        where.status = 'SENT';
        where.paidAt = null;
        where.dueDate = { lt: new Date() };
      } else {
        where.status = status;
      }
    }

    // Filter by overdue flag
    if (overdue === true) {
      where.status = 'SENT';
      where.paidAt = null;
      where.dueDate = { lt: new Date() };
    } else if (overdue === false) {
      // Not overdue: either not SENT, or SENT but not past due
      where.OR = [
        { status: { not: 'SENT' } },
        { status: 'SENT', dueDate: { gte: new Date() } },
        { status: 'SENT', paidAt: { not: null } },
      ];
    }

    // Filter by client
    if (clientId) {
      where.clientId = clientId;
    }

    // Search query (title, description, invoice number)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.invoice.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: {
        issueDate: 'desc',
      },
      skip,
      take: limit,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        trip: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    const response: InvoicesResponse = {
      invoices: invoices.map((inv) => {
        // Calculate effective status (including OVERDUE)
        const effectiveStatus = calculateInvoiceStatus(
          inv.status,
          inv.dueDate,
          inv.paidAt
        );

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          userId: inv.userId,
          clientId: inv.clientId,
          tripId: inv.tripId,
          title: inv.title,
          description: inv.description,
          lineItems: inv.lineItems as any,
          subtotal: Number(inv.subtotal),
          tax: Number(inv.tax),
          discount: Number(inv.discount),
          total: Number(inv.total),
          currency: inv.currency,
          status: effectiveStatus,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          paidAt: inv.paidAt,
          notes: inv.notes,
          terms: inv.terms,
          deletedAt: inv.deletedAt,
          createdAt: inv.createdAt,
          updatedAt: inv.updatedAt,
          client: inv.client,
          trip: inv.trip,
        };
      }),
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
