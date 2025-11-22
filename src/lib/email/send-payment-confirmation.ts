/**
 * Send Payment Confirmation Email
 *
 * PLACEHOLDER: This is a placeholder implementation for sending payment
 * confirmation emails to clients when an invoice is paid via Stripe.
 *
 * TODO: Implement email sending with Resend or similar service
 *
 * @param invoiceId - ID of the invoice that was paid
 */
export async function sendPaymentConfirmation(
  invoiceId: string
): Promise<void> {
  // TODO: Implement email sending
  // 1. Fetch invoice details from database
  // 2. Fetch client email
  // 3. Generate payment confirmation email template
  // 4. Send email via Resend
  //
  // Example:
  // const invoice = await prisma.invoice.findUnique({
  //   where: { id: invoiceId },
  //   include: { client: true }
  // });
  //
  // await resend.emails.send({
  //   from: process.env.FROM_EMAIL,
  //   to: invoice.client.email,
  //   subject: `Payment Confirmed - Invoice ${invoice.invoiceNumber}`,
  //   html: generatePaymentConfirmationEmail(invoice)
  // });

  console.log(
    `[PLACEHOLDER] Payment confirmation email should be sent for invoice ${invoiceId}`
  );
  console.log(
    'To implement: Install Resend and create email template in src/lib/email/templates/payment-confirmation.tsx'
  );
}
