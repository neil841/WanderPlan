/**
 * Individual Invoice API Routes
 *
 * GET /api/invoices/[id] - Get a single invoice
 * PATCH /api/invoices/[id] - Update an invoice
 * DELETE /api/invoices/[id] - Delete (soft delete) an invoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateInvoiceSchema } from '@/lib/validations/invoice';
import type { InvoiceStatus } from '@/types/invoice';

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
 * GET /api/invoices/[id]
 *
 * Get a single invoice by ID
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

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Calculate effective status (including OVERDUE)
    const effectiveStatus = calculateInvoiceStatus(
      invoice.status,
      invoice.dueDate,
      invoice.paidAt
    );

    // Convert Decimal to number for JSON serialization
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices/[id]
 *
 * Update an invoice
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
    const validation = updateInvoiceSchema.safeParse(body);
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
      issueDate,
      dueDate,
      notes,
      terms,
    } = validation.data;

    // Get existing invoice
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    if (status) {
      // Cannot change status from PAID
      if (existingInvoice.status === 'PAID') {
        return NextResponse.json(
          { error: 'Cannot modify a paid invoice' },
          { status: 400 }
        );
      }
    }

    // Calculate new subtotal if lineItems provided
    let newSubtotal = Number(existingInvoice.subtotal);
    if (lineItems) {
      newSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    }

    // Calculate new total
    const newTax = tax !== undefined ? tax : Number(existingInvoice.tax);
    const newDiscount = discount !== undefined ? discount : Number(existingInvoice.discount);
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
    if (issueDate !== undefined) {
      updateData.issueDate = new Date(issueDate);
    }
    if (dueDate !== undefined) {
      updateData.dueDate = new Date(dueDate);
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

      // Set paidAt when changing to PAID
      if (status === 'PAID' && existingInvoice.status !== 'PAID') {
        updateData.paidAt = new Date();
      }
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
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

    // Calculate effective status (including OVERDUE)
    const effectiveStatus = calculateInvoiceStatus(
      updatedInvoice.status,
      updatedInvoice.dueDate,
      updatedInvoice.paidAt
    );

    const response = {
      invoice: {
        ...updatedInvoice,
        lineItems: updatedInvoice.lineItems as any,
        subtotal: Number(updatedInvoice.subtotal),
        tax: Number(updatedInvoice.tax),
        discount: Number(updatedInvoice.discount),
        total: Number(updatedInvoice.total),
        status: effectiveStatus,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 *
 * Soft delete an invoice
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

    // Get existing invoice
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Cannot delete PAID invoices
    if (existingInvoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete a paid invoice' },
        { status: 409 }
      );
    }

    // Soft delete the invoice
    await prisma.invoice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
