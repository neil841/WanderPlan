/**
 * Trip Sharing API Route
 *
 * @route POST /api/trips/[tripId]/share
 * @route GET /api/trips/[tripId]/share
 * @route DELETE /api/trips/[tripId]/share
 * @access Protected - User must be trip owner or admin collaborator
 *
 * POST: Generates a shareable link with guest access token
 * - Creates unique share token (UUID)
 * - Sets token expiry (default 30 days, max 365)
 * - Returns share URL for public access
 *
 * GET: Lists all active share tokens for the trip
 * - Shows token details, expiry, and creation date
 * - Only active (non-revoked, non-expired) tokens
 *
 * DELETE: Revokes all share tokens for the trip
 * - Marks all tokens as inactive
 * - Sets revokedAt timestamp
 *
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (no admin access to this trip)
 * @throws {404} - Not Found (trip doesn't exist)
 * @throws {500} - Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

/**
 * Validation schema for share token creation
 */
const createShareTokenSchema = z.object({
  expiresIn: z
    .number()
    .int()
    .min(1)
    .max(365)
    .default(30)
    .optional()
    .describe('Expiration time in days (default 30, max 365)'),
  permissions: z
    .enum(['view_only', 'comment'])
    .default('view_only')
    .optional()
    .describe('Access permissions for the shared link'),
});

/**
 * POST /api/trips/[tripId]/share
 *
 * Generates a shareable link for guest access to the trip
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { tripId } = params;

    // 2. Validate tripId
    if (!tripId || typeof tripId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    // 3. Parse and validate request body
    let requestData: {
      expiresIn?: number;
      permissions?: 'view_only' | 'comment';
    } = {};

    try {
      const body = await req.json().catch(() => ({}));
      requestData = createShareTokenSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
    }

    // 4. Check if trip exists and verify permissions
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      include: {
        collaborators: {
          where: {
            userId,
            status: 'ACCEPTED',
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // 5. Check permissions: Must be owner or admin collaborator
    const isOwner = trip.createdBy === userId;
    const isAdminCollaborator =
      trip.collaborators.length > 0 &&
      trip.collaborators[0].role === 'ADMIN';

    if (!isOwner && !isAdminCollaborator) {
      return NextResponse.json(
        {
          error:
            'Forbidden - Only trip owner or admin collaborators can share this trip',
        },
        { status: 403 }
      );
    }

    // 6. Calculate expiration date
    const expiresIn = requestData.expiresIn || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    // 7. Create share token
    const shareToken = await prisma.tripShareToken.create({
      data: {
        tripId,
        expiresAt,
        permissions: requestData.permissions || 'view_only',
        createdBy: userId,
        isActive: true,
      },
    });

    // 8. Build share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/trips/share/${shareToken.token}`;

    // 9. Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          token: shareToken.token,
          shareUrl,
          expiresAt: shareToken.expiresAt,
          permissions: shareToken.permissions,
          createdAt: shareToken.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/trips/[tripId]/share Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[tripId]/share
 *
 * Lists all active share tokens for the trip
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { tripId } = params;

    // 2. Validate tripId
    if (!tripId || typeof tripId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    // 3. Check if trip exists and verify permissions
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      include: {
        collaborators: {
          where: {
            userId,
            status: 'ACCEPTED',
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // 4. Check permissions: Must be owner or admin collaborator
    const isOwner = trip.createdBy === userId;
    const isAdminCollaborator =
      trip.collaborators.length > 0 &&
      trip.collaborators[0].role === 'ADMIN';

    if (!isOwner && !isAdminCollaborator) {
      return NextResponse.json(
        {
          error:
            'Forbidden - Only trip owner or admin collaborators can view share tokens',
        },
        { status: 403 }
      );
    }

    // 5. Fetch all active share tokens
    const now = new Date();
    const shareTokens = await prisma.tripShareToken.findMany({
      where: {
        tripId,
        isActive: true,
        expiresAt: {
          gt: now, // Only non-expired tokens
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 6. Build response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const tokens = shareTokens.map((token) => ({
      id: token.id,
      token: token.token,
      shareUrl: `${baseUrl}/trips/share/${token.token}`,
      expiresAt: token.expiresAt,
      permissions: token.permissions,
      createdBy: {
        id: token.creator.id,
        name: `${token.creator.firstName} ${token.creator.lastName}`,
        email: token.creator.email,
        avatarUrl: token.creator.avatarUrl,
      },
      createdAt: token.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          tokens,
          count: tokens.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/trips/[tripId]/share Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/share
 *
 * Revokes all share tokens for the trip
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { tripId } = params;

    // 2. Validate tripId
    if (!tripId || typeof tripId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    // 3. Check if trip exists and verify permissions
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
      },
      include: {
        collaborators: {
          where: {
            userId,
            status: 'ACCEPTED',
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // 4. Check permissions: Must be owner or admin collaborator
    const isOwner = trip.createdBy === userId;
    const isAdminCollaborator =
      trip.collaborators.length > 0 &&
      trip.collaborators[0].role === 'ADMIN';

    if (!isOwner && !isAdminCollaborator) {
      return NextResponse.json(
        {
          error:
            'Forbidden - Only trip owner or admin collaborators can revoke share tokens',
        },
        { status: 403 }
      );
    }

    // 5. Revoke all active share tokens
    const now = new Date();
    const result = await prisma.tripShareToken.updateMany({
      where: {
        tripId,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: now,
      },
    });

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        message: 'All share tokens revoked successfully',
        data: {
          revokedCount: result.count,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/trips/[tripId]/share Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
