/**
 * Proposals API Routes
 *
 * POST /api/proposals - Create a new proposal
 * GET /api/proposals - List proposals with filtering, search, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createProposalSchema, proposalQuerySchema } from '@/lib/validations/proposal';
import type { ProposalsResponse } from '@/types/proposal';
import { checkGenericRateLimit } from '@/lib/auth/rate-limit';

/**
 * POST /api/proposals
 *
 * Create a new proposal for a client
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (prevent spam/abuse)
    const { isLimited, resetInMinutes } = checkGenericRateLimit(
      `proposals:${session.user.id}`,
      60, // Max 60 proposal creations
      60 * 60 * 1000 // per hour
    );

    if (isLimited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many proposal creations. Please try again in ${resetInMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createProposalSchema.safeParse(body);
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
      validUntil,
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

    // Validate validUntil is in the future (if provided)
    if (validUntil) {
      const validUntilDate = new Date(validUntil);
      if (validUntilDate <= new Date()) {
        return NextResponse.json(
          { error: 'Valid until date must be in the future' },
          { status: 400 }
        );
      }
    }

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

    // Create the proposal
    const proposal = await prisma.proposal.create({
      data: {
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
        validUntil: validUntil ? new Date(validUntil) : null,
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

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/proposals
 *
 * List all proposals for the current user with filtering, search, and pagination
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
    };

    // Validate query params
    const validation = proposalQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, status, clientId, search } = validation.data;

    // Build where clause
    const where: any = {
      userId: session.user.id,
      deletedAt: null, // Only show non-deleted proposals
    };

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by client
    if (clientId) {
      where.clientId = clientId;
    }

    // Search query (title, description)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.proposal.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get proposals
    const proposals = await prisma.proposal.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
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

    const response: ProposalsResponse = {
      proposals: proposals.map((p) => ({
        id: p.id,
        userId: p.userId,
        clientId: p.clientId,
        tripId: p.tripId,
        title: p.title,
        description: p.description,
        lineItems: p.lineItems as any,
        subtotal: Number(p.subtotal),
        tax: Number(p.tax),
        discount: Number(p.discount),
        total: Number(p.total),
        currency: p.currency,
        status: p.status,
        validUntil: p.validUntil,
        notes: p.notes,
        terms: p.terms,
        sentAt: p.sentAt,
        acceptedAt: p.acceptedAt,
        rejectedAt: p.rejectedAt,
        deletedAt: p.deletedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        client: p.client,
        trip: p.trip,
      })),
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
