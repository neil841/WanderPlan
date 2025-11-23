/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 *
 * IMPORTANT:
 * - This endpoint must be publicly accessible for Stripe to call it
 * - Use ngrok or similar for local development: `ngrok http 3000`
 * - Configure webhook URL in Stripe Dashboard: https://dashboard.stripe.com/webhooks
 * - Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET in .env
 *
 * Webhook events handled:
 * - checkout.session.completed: Mark invoice as paid when payment succeeds
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/db';
import { sendPaymentConfirmation } from '@/lib/email/send-payment-confirmation';
import type Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 *
 * Verifies Stripe webhook signature and processes events.
 * Currently handles: checkout.session.completed
 *
 * @param request - Raw request body (must NOT be parsed as JSON)
 * @returns 200 OK if processed successfully
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body (Stripe requires raw body for signature verification)
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe not configured');
      return NextResponse.json(
        { error: 'Webhook processing not configured' },
        { status: 503 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      // Future events can be added here
      // case 'payment_intent.payment_failed':
      //   await handlePaymentFailed(event.data.object);
      //   break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 *
 * Updates invoice status to PAID and sends confirmation email.
 *
 * @param session - Stripe checkout session object
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const invoiceId = session.metadata?.invoiceId;
    const userId = session.metadata?.userId;
    const invoiceNumber = session.metadata?.invoiceNumber;

    if (!invoiceId) {
      console.error('No invoiceId in session metadata');
      return;
    }

    console.log(
      `Processing payment for invoice ${invoiceNumber || invoiceId} (session: ${session.id})`
    );

    // Check if invoice exists and is not already paid
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!existingInvoice) {
      console.error(`Invoice ${invoiceId} not found`);
      return;
    }

    if (existingInvoice.status === 'PAID') {
      console.log(`Invoice ${invoiceId} is already paid, skipping update`);
      return;
    }

    // Update invoice to PAID
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
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

    console.log(`Invoice ${invoiceId} marked as PAID`);

    // Send payment confirmation email
    try {
      await sendPaymentConfirmation(invoiceId);
      console.log(`Payment confirmation email sent for invoice ${invoiceId}`);
    } catch (emailError) {
      // Don't fail webhook if email fails
      console.error('Failed to send payment confirmation email:', emailError);
    }

    // Log activity (optional - can be added later)
    // await createActivityLog({
    //   userId: updatedInvoice.userId,
    //   action: 'invoice_paid',
    //   metadata: { invoiceId, amount: updatedInvoice.total }
    // });
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error; // Re-throw to be caught by main handler
  }
}
