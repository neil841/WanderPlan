/**
 * CRM Client API Routes (Individual)
 *
 * GET /api/crm/clients/[id] - Get a single client
 * PATCH /api/crm/clients/[id] - Update a client
 * DELETE /api/crm/clients/[id] - Delete a client
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateClientSchema } from '@/lib/validations/crm';
import type { ClientResponse } from '@/types/crm';

/**
 * GET /api/crm/clients/[id]
 *
 * Get a single client by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Find the client and verify ownership
    const client = await prisma.crmClient.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if the client belongs to the current user
    if (client.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const response: ClientResponse = {
      client: {
        id: client.id,
        userId: client.userId,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        status: client.status,
        source: client.source,
        tags: client.tags,
        notes: client.notes,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/crm/clients/[id]
 *
 * Update a client
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateClientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Find the client and verify ownership
    const existingClient = await prisma.crmClient.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if the client belongs to the current user
    if (existingClient.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // If email is being updated, check for duplicates
    if (validation.data.email && validation.data.email !== existingClient.email) {
      const duplicateClient = await prisma.crmClient.findFirst({
        where: {
          userId: session.user.id,
          email: validation.data.email,
          id: { not: id },
        },
      });

      if (duplicateClient) {
        return NextResponse.json(
          { error: 'A client with this email address already exists' },
          { status: 409 }
        );
      }
    }

    // Update the client
    const updatedClient = await prisma.crmClient.update({
      where: { id },
      data: {
        ...validation.data,
      },
    });

    const response: ClientResponse = {
      client: {
        id: updatedClient.id,
        userId: updatedClient.userId,
        firstName: updatedClient.firstName,
        lastName: updatedClient.lastName,
        email: updatedClient.email,
        phone: updatedClient.phone,
        status: updatedClient.status,
        source: updatedClient.source,
        tags: updatedClient.tags,
        notes: updatedClient.notes,
        createdAt: updatedClient.createdAt,
        updatedAt: updatedClient.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/crm/clients/[id]
 *
 * Delete a client
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Find the client and verify ownership
    const existingClient = await prisma.crmClient.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if the client belongs to the current user
    if (existingClient.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the client
    // Note: Prisma cascade will handle related proposals and invoices
    await prisma.crmClient.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
