/**
 * Tag Management API Route
 *
 * Handles individual tag operations (delete).
 *
 * @route DELETE /api/tags/[tagId] - Delete a tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * DELETE /api/tags/[tagId]
 *
 * Deletes a specific tag.
 * User must have edit access to the trip the tag belongs to.
 *
 * @access Protected - Requires authentication
 *
 * @param tagId - UUID of the tag to delete
 *
 * @returns 200 - Tag deleted successfully
 * @returns 401 - Unauthorized (no valid session)
 * @returns 403 - Forbidden (no access to trip)
 * @returns 404 - Tag not found
 * @returns 500 - Server error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tagId: string } }
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { tagId } = params;

    // Validate tagId format
    if (!tagId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tagId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid tag ID format',
          },
        },
        { status: 400 }
      );
    }

    // Fetch tag with trip information
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        trip: {
          include: {
            collaborators: {
              where: {
                userId,
                status: 'ACCEPTED',
              },
            },
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Tag not found',
          },
        },
        { status: 404 }
      );
    }

    // Check authorization - must be owner or editor/admin collaborator
    const isOwner = tag.trip.createdBy === userId;
    const hasEditAccess =
      isOwner ||
      tag.trip.collaborators.some((collab) => ['EDITOR', 'ADMIN'].includes(collab.role));

    if (!hasEditAccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this tag',
          },
        },
        { status: 403 }
      );
    }

    // Delete the tag
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Tag deleted successfully',
        data: {
          id: tag.id,
          name: tag.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/tags/[tagId]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete tag',
        },
      },
      { status: 500 }
    );
  }
}
