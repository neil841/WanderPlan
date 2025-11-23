/**
 * Invoice Payment API Routes
 *
 * POST /api/invoices/[id]/pay - Create Stripe Checkout session for invoice payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe/client';

/**
 * POST /api/invoices/[id]/pay
 *
 * Creates a Stripe Checkout session for paying an invoice.
 * Redirects user to Stripe-hosted checkout page.
 *
 * @param request - Next.js request
 * @param params - Route parameters (invoice ID)
 * @returns Checkout session URL
 *
 * @example
 * POST /api/invoices/123/pay
 * Response: { url: "https://checkout.stripe.com/c/pay/cs_..." }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get invoice with client details
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
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate invoice status
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    if (invoice.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot pay a draft invoice. Please send the invoice first.' },
        { status: 400 }
      );
    }

    // Validate total amount is positive
    const totalAmount = Number(invoice.total);
    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invoice total must be greater than zero' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Get app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: invoice.title,
              description: invoice.description || undefined,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      customer_email: invoice.client.email,
      metadata: {
        invoiceId: invoice.id,
        userId: session.user.id,
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.client.id,
      },
      success_url: `${appUrl}/crm/invoices/${invoice.id}?payment=success`,
      cancel_url: `${appUrl}/crm/invoices/${invoice.id}?payment=cancelled`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { url: checkoutSession.url },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
