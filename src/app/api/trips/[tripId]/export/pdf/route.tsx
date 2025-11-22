/**
 * Trip PDF Export API
 *
 * Generates and downloads PDF for a trip
 *
 * @route GET /api/trips/[tripId]/export/pdf - Generate PDF for trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { TripPDF } from '@/lib/pdf/trip-pdf';

/**
 * GET /api/trips/[tripId]/export/pdf
 *
 * Generates and downloads a PDF export of the trip.
 *
 * @access Protected (user must be trip creator or collaborator)
 *
 * Query parameters:
 * - includeBudget: Include budget summary (default: true)
 * - includeCollaborators: Include collaborator list (default: true)
 * - includeMap: Include map (default: false, not implemented yet)
 *
 * @returns 200 - PDF file download
 * @returns 401 - Unauthorized
 * @returns 403 - Forbidden (not a collaborator)
 * @returns 404 - Trip not found
 * @returns 500 - Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
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
            message: 'You must be logged in to export trips',
          },
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { tripId } = params;

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const includeBudget = searchParams.get('includeBudget') !== 'false';
    const includeCollaborators = searchParams.get('includeCollaborators') !== 'false';
    const includeMap = searchParams.get('includeMap') === 'true';

    // Fetch trip with all necessary data
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        collaborators: {
          where: {
            status: 'ACCEPTED',
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            role: 'asc',
          },
        },
        events: {
          orderBy: {
            startDateTime: 'asc',
          },
        },
        budget: true,
        expenses: true,
      },
    });

    // Check if trip exists
    if (!trip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Trip not found',
          },
        },
        { status: 404 }
      );
    }

    // Check permission (creator or accepted collaborator)
    const isCreator = trip.createdBy === userId;
    const isCollaborator = trip.collaborators.some(
      (c) => c.userId === userId && c.status === 'ACCEPTED'
    );

    if (!isCreator && !isCollaborator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to export this trip',
          },
        },
        { status: 403 }
      );
    }

    // Calculate total expenses
    const totalExpenses = trip.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // Prepare PDF data
    const pdfData = {
      trip: {
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        destinations: trip.destinations,
        creator: {
          firstName: trip.creator.firstName,
          lastName: trip.creator.lastName,
        },
      },
      events: trip.events.map((event) => ({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location as {
          name?: string;
          address?: string;
          lat?: number;
          lon?: number;
        } | null,
        confirmationNumber: event.confirmationNumber,
        cost: event.cost ? Number(event.cost) : null,
        currency: event.currency,
        notes: event.notes,
      })),
      collaborators: trip.collaborators.map((c) => ({
        id: c.id,
        role: c.role,
        user: c.user,
      })),
      budget: trip.budget
        ? {
            totalBudget: Number(trip.budget.totalBudget),
            currency: trip.budget.currency,
            categoryBudgets: trip.budget.categoryBudgets as Record<
              string,
              { budgeted: number; spent: number }
            >,
          }
        : null,
      totalExpenses,
      options: {
        includeBudget,
        includeCollaborators,
        includeMap,
      },
    };

    // Generate PDF
    const pdfStream = await renderToStream(<TripPDF {...pdfData} />);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF as download
    const fileName = `${trip.name.replace(/[^a-z0-9]/gi, '_')}_itinerary.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate PDF',
        },
      },
      { status: 500 }
    );
  }
}
