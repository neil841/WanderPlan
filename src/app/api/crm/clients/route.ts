/**
 * CRM Clients API Routes
 *
 * POST /api/crm/clients - Create a new client
 * GET /api/crm/clients - List clients with filtering, search, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createClientSchema, clientQuerySchema } from '@/lib/validations/crm';
import type { ClientsResponse } from '@/types/crm';

/**
 * POST /api/crm/clients
 *
 * Create a new client for the current user (travel agent)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = createClientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      status,
      source,
      tags,
      notes,
    } = validation.data;

    // Check for duplicate email for this user
    const existingClient = await prisma.crmClient.findFirst({
      where: {
        userId: session.user.id,
        email,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email address already exists' },
        { status: 409 }
      );
    }

    // Create the client
    const client = await prisma.crmClient.create({
      data: {
        userId: session.user.id,
        firstName,
        lastName,
        email,
        phone: phone || null,
        status: status || 'LEAD',
        source: source || null,
        tags: tags || [],
        notes: notes || null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crm/clients
 *
 * List all clients for the current user with filtering, search, and pagination
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
      q: searchParams.get('q'),
      status: searchParams.get('status'),
      tags: searchParams.get('tags'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order'),
    };

    // Validate query params
    const validation = clientQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, q, status, tags, sort, order } = validation.data;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    // Search query (firstName, lastName, email, source)
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { source: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        where.tags = {
          hasSome: tagArray,
        };
      }
    }

    // Build orderBy
    const orderBy: any = {};
    if (sort === 'firstName' || sort === 'lastName' || sort === 'email') {
      orderBy[sort] = order;
    } else {
      orderBy.createdAt = order;
    }

    // Get total count
    const total = await prisma.crmClient.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get clients
    const clients = await prisma.crmClient.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    const response: ClientsResponse = {
      clients: clients.map((c) => ({
        id: c.id,
        userId: c.userId,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        status: c.status,
        source: c.source,
        tags: c.tags,
        notes: c.notes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
