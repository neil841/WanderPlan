/**
 * Individual Proposal API Routes
 *
 * GET /api/proposals/[id] - Get a single proposal
 * PATCH /api/proposals/[id] - Update a proposal
 * DELETE /api/proposals/[id] - Delete (soft delete) a proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateProposalSchema } from '@/lib/validations/proposal';

/**
 * GET /api/proposals/[id]
 *
 * Get a single proposal by ID
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

    // Get proposal
    const proposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
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

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Convert Decimal to number for JSON serialization
    const response = {
      proposal: {
        ...proposal,
        lineItems: proposal.lineItems as any,
        subtotal: Number(proposal.subtotal),
        tax: Number(proposal.tax),
        discount: Number(proposal.discount),
        total: Number(proposal.total),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/proposals/[id]
 *
 * Update a proposal
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
    const validation = updateProposalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      lineItems,
      tax,
      discount,
      status,
      validUntil,
      notes,
      terms,
    } = validation.data;

    // Get existing proposal
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingProposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    if (status) {
      // Cannot change status from ACCEPTED or REJECTED
      if (existingProposal.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Cannot modify an accepted proposal' },
          { status: 400 }
        );
      }
      if (existingProposal.status === 'REJECTED') {
        return NextResponse.json(
          { error: 'Cannot modify a rejected proposal' },
          { status: 400 }
        );
      }

      // Validate validUntil is in the future for SENT status
      if (status === 'SENT' && existingProposal.validUntil) {
        if (existingProposal.validUntil <= new Date()) {
          return NextResponse.json(
            { error: 'Cannot send a proposal that has expired' },
            { status: 400 }
          );
        }
      }
    }

    // Calculate new subtotal if lineItems provided
    let newSubtotal = Number(existingProposal.subtotal);
    if (lineItems) {
      newSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    }

    // Calculate new total
    const newTax = tax !== undefined ? tax : Number(existingProposal.tax);
    const newDiscount = discount !== undefined ? discount : Number(existingProposal.discount);
    const newTotal = newSubtotal + newTax - newDiscount;

    // Validate total is positive
    if (newTotal < 0) {
      return NextResponse.json(
        { error: 'Total cannot be negative' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (lineItems !== undefined) {
      updateData.lineItems = lineItems as any;
      updateData.subtotal = newSubtotal;
    }
    if (tax !== undefined) updateData.tax = tax;
    if (discount !== undefined) updateData.discount = discount;
    if (validUntil !== undefined) {
      updateData.validUntil = validUntil ? new Date(validUntil) : null;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (terms !== undefined) updateData.terms = terms;

    // Update total if any financial fields changed
    if (lineItems !== undefined || tax !== undefined || discount !== undefined) {
      updateData.total = newTotal;
    }

    // Handle status changes and set timestamps
    if (status !== undefined) {
      updateData.status = status;

      // Set sentAt when changing to SENT
      if (status === 'SENT' && existingProposal.status !== 'SENT') {
        updateData.sentAt = new Date();
      }

      // Set acceptedAt when changing to ACCEPTED
      if (status === 'ACCEPTED' && existingProposal.status !== 'ACCEPTED') {
        updateData.acceptedAt = new Date();
      }

      // Set rejectedAt when changing to REJECTED
      if (status === 'REJECTED' && existingProposal.status !== 'REJECTED') {
        updateData.rejectedAt = new Date();
      }
    }

    // Update the proposal
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: updateData,
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

    const response = {
      proposal: {
        ...updatedProposal,
        lineItems: updatedProposal.lineItems as any,
        subtotal: Number(updatedProposal.subtotal),
        tax: Number(updatedProposal.tax),
        discount: Number(updatedProposal.discount),
        total: Number(updatedProposal.total),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/proposals/[id]
 *
 * Soft delete a proposal
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

    // Get existing proposal
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingProposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Cannot delete ACCEPTED proposals
    if (existingProposal.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Cannot delete an accepted proposal' },
        { status: 409 }
      );
    }

    // Soft delete the proposal
    await prisma.proposal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json(
      { error: 'Failed to delete proposal' },
      { status: 500 }
    );
  }
}
