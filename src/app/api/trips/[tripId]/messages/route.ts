/**
 * Trip Messages API Routes
 *
 * POST /api/trips/[tripId]/messages - Create a new message
 * GET /api/trips/[tripId]/messages - List messages with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  createMessageSchema,
  messagePaginationSchema,
} from '@/lib/validations/message';
import type { MessagesResponse } from '@/types/message';
import { broadcastToTrip } from '@/lib/realtime/server';
import { SocketEvent } from '@/types/realtime';

/**
 * POST /api/trips/[tripId]/messages
 *
 * Create a new message in a trip
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = params;
    const body = await request.json();

    // Validate request body
    const validation = createMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, replyTo } = validation.data;

    // Check if user has access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        OR: [
          { createdBy: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // If replyTo is provided, verify it exists and belongs to this trip
    if (replyTo) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: replyTo,
          tripId,
        },
      });

      if (!parentMessage) {
        return NextResponse.json(
          { error: 'Parent message not found' },
          { status: 404 }
        );
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        tripId,
        userId: session.user.id,
        content,
        replyTo: replyTo || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        tripId,
        userId: session.user.id,
        actionType: 'MESSAGE_POSTED',
        actionData: {
          messageId: message.id,
          isReply: !!replyTo,
          userName: session.user.name || session.user.email,
        },
      },
    });

    // Broadcast to trip room via Socket.io
    broadcastToTrip(tripId, SocketEvent.MESSAGE_SENT, {
      message,
      tripId,
    });

    return NextResponse.json(
      {
        message,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[tripId]/messages
 *
 * List messages for a trip with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = params;
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = messagePaginationSchema.safeParse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '50',
      threadId: searchParams.get('threadId') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { page, pageSize, threadId } = validation.data;

    // Check if user has access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        OR: [
          { createdBy: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Build where clause
    const where = threadId
      ? {
          tripId,
          replyTo: threadId, // Get replies to a specific message
        }
      : {
          tripId,
          replyTo: null, // Get only top-level messages (not replies)
        };

    // Get total count
    const total = await prisma.message.count({ where });

    // Get paginated messages
    const messages = await prisma.message.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    const response: MessagesResponse = {
      messages,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
