/**
 * Resend Email Service Client
 *
 * Centralized email service using Resend for transactional emails
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const fromEmail = options.from || process.env.FROM_EMAIL || 'noreply@wanderplan.com';
    const fromName = process.env.FROM_NAME || 'WanderPlan';
    const from = `${fromName} <${fromEmail}>`;

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('Resend API error:', error);
      return false;
    }

    console.log('✅ Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send bulk emails (useful for digest notifications)
 */
export async function sendBulkEmails(
  emails: SendEmailOptions[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const success = await sendEmail(email);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

export { resend };
