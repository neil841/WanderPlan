/**
 * PDF Export API Route
 *
 * @route GET /api/trips/[tripId]/export/pdf
 * @access Protected - User must be trip owner or collaborator
 *
 * GET: Generates a PDF export of the trip with:
 * - Trip overview (title, dates, destination, description)
 * - Day-by-day itinerary with all events
 * - Budget summary
 * - Collaborator list
 * - Mobile-friendly layout
 *
 * Query Parameters:
 * - includeMap: boolean (default: true) - Include map screenshot
 * - includeBudget: boolean (default: true) - Include budget section
 * - includeCollaborators: boolean (default: true) - Include collaborator list
 * - email: string (optional) - Email address to send PDF to
 *
 * @throws {401} - Unauthorized (not authenticated)
 * @throws {403} - Forbidden (no access to this trip)
 * @throws {404} - Not Found (trip doesn't exist)
 * @throws {500} - Server error during PDF generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { generateTripPDF } from '@/lib/pdf/trip-pdf';
import { sendEmail } from '@/lib/email/client';

/**
 * GET /api/trips/[tripId]/export/pdf
 *
 * Generates and returns or emails a PDF export of the trip
 */
export async function GET(
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

    // 3. Parse query parameters for customization
    const searchParams = req.nextUrl.searchParams;
    const includeMap = searchParams.get('includeMap') !== 'false';
    const includeBudget = searchParams.get('includeBudget') !== 'false';
    const includeCollaborators = searchParams.get('includeCollaborators') !== 'false';
    const emailTo = searchParams.get('email');

    // 4. Fetch trip with all necessary data for PDF
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        deletedAt: null,
        // Row-level security: user must be owner or accepted collaborator
        OR: [
          { createdBy: userId },
          {
            collaborators: {
              some: {
                userId,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      },
      include: {
        // Creator info
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },

        // Events ordered by date for itinerary
        events: {
          orderBy: [
            { startDateTime: 'asc' },
            { order: 'asc' },
          ],
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },

        // Collaborators
        collaborators: {
          where: {
            status: 'ACCEPTED',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },

        // Budget
        budget: true,

        // Expenses for budget calculations
        expenses: {
          select: {
            id: true,
            amount: true,
            currency: true,
            category: true,
            description: true,
          },
        },

        // Tags
        tags: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    // 5. Handle not found or access denied
    if (!trip) {
      const tripExists = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { id: true },
      });

      if (!tripExists) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this trip' },
        { status: 403 }
      );
    }

    // 6. Calculate expense summary for budget
    const expenseSummary = trip.expenses.reduce(
      (acc, expense) => {
        const key = expense.currency;
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] = Number(acc[key]) + Number(expense.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    // 7. Format trip data for PDF generation
    const tripData = {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destinations,
      coverImageUrl: trip.coverImageUrl,
      creator: {
        name: `${trip.creator.firstName} ${trip.creator.lastName}`,
        email: trip.creator.email,
      },
      events: trip.events.map((event) => ({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location,
        cost: event.cost ? {
          amount: Number(event.cost),
          currency: event.currency || 'USD',
        } : null,
        notes: event.notes,
        confirmationNumber: event.confirmationNumber,
      })),
      collaborators: trip.collaborators.map((collab) => ({
        name: `${collab.user.firstName} ${collab.user.lastName}`,
        email: collab.user.email,
        role: collab.role,
      })),
      budget: trip.budget ? {
        totalBudget: Number(trip.budget.totalBudget),
        currency: trip.budget.currency,
        categoryBudgets: trip.budget.categoryBudgets as Record<string, number>,
        expenseSummary,
        totalSpent: Object.values(expenseSummary).reduce(
          (sum, val) => Number(sum) + Number(val),
          0
        ),
      } : null,
      tags: trip.tags.map((tag) => ({
        name: tag.name,
        color: tag.color,
      })),
    };

    // 8. Generate PDF with customization options
    const pdfBuffer = await generateTripPDF(tripData, {
      includeMap,
      includeBudget: includeBudget && !!tripData.budget,
      includeCollaborators: includeCollaborators && tripData.collaborators.length > 0,
    });

    // 9. If email parameter provided, send PDF via email
    if (emailTo) {
      try {
        await sendEmail({
          to: emailTo,
          subject: `Trip Itinerary: ${trip.name}`,
          text: `Please find attached your trip itinerary for ${trip.name}.`,
          html: `
            <h2>Your Trip Itinerary</h2>
            <p>Please find attached your trip itinerary for <strong>${trip.name}</strong>.</p>
            <p>Dates: ${trip.startDate.toLocaleDateString()} - ${trip.endDate.toLocaleDateString()}</p>
            <p>Destination: ${trip.destinations.join(', ')}</p>
          `,
          attachments: [
            {
              filename: `${trip.name.replace(/[^a-z0-9]/gi, '_')}_itinerary.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        return NextResponse.json(
          {
            message: 'PDF sent successfully',
            sentTo: emailTo,
          },
          { status: 200 }
        );
      } catch (emailError) {
        console.error('[PDF Email Error]:', emailError);
        // Still return PDF if email fails
        return new NextResponse(pdfBuffer as any, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${trip.name.replace(/[^a-z0-9]/gi, '_')}_itinerary.pdf"`,
            'Content-Length': pdfBuffer.length.toString(),
            'X-Email-Warning': 'Email delivery failed, but PDF generated successfully',
          },
        });
      }
    }

    // 10. Return PDF as download
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${trip.name.replace(/[^a-z0-9]/gi, '_')}_itinerary.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('[GET /api/trips/[tripId]/export/pdf Error]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error during PDF generation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
