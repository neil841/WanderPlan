/**
 * Email client configuration using Resend
 * Handles sending transactional emails for authentication and notifications
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sender configuration
 * Update this with your verified domain once configured in Resend
 */
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = process.env.FROM_NAME || 'WanderPlan';

/**
 * Send an email using Resend
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML email content
 * @param text - Plain text email content (optional)
 * @returns Promise with send result
 * @throws Error if email sending fails
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      // TODO: Replace with proper error tracking service (e.g., Sentry)
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEV] Email error:', error);
      }
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Log successful sends in development for debugging
    if (process.env.NODE_ENV === 'development') {
      // TODO: Replace with proper logging service (e.g., Winston, Pino)
      console.info('[DEV] Email sent:', { to, subject, id: data?.id });
    }

    return data;
  } catch (error) {
    // TODO: Replace with proper error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Email service error:', error);
    }
    throw error;
  }
}

/**
 * Send verification email to user
 *
 * @param to - User email address
 * @param verificationUrl - URL with verification token
 * @returns Promise with send result
 */
export async function sendVerificationEmail(to: string, verificationUrl: string) {
  const subject = 'Verify your email address - WanderPlan';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                WanderPlan
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                Verify your email address
              </h2>

              <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 24px;">
                Thanks for signing up for WanderPlan! Please verify your email address to complete your registration and start planning your next adventure.
              </p>

              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #3b82f6; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">

              <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 20px;">
                This verification link will expire in 24 hours. If you didn't create an account with WanderPlan, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} WanderPlan. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
                Plan your next adventure with confidence.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Verify your email address

Thanks for signing up for WanderPlan! Please verify your email address to complete your registration.

Click the link below to verify your email:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with WanderPlan, you can safely ignore this email.

© ${new Date().getFullYear()} WanderPlan
  `.trim();

  return sendEmail({ to, subject, html, text });
}

/**
 * Send password reset email to user
 *
 * @param to - User email address
 * @param resetUrl - URL with reset token
 * @returns Promise with send result
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = 'Reset your password - WanderPlan';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                WanderPlan
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                Reset your password
              </h2>

              <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 24px;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>

              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #3b82f6; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">

              <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 20px;">
                This reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} WanderPlan. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Reset your password

We received a request to reset your password for your WanderPlan account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} WanderPlan
  `.trim();

  return sendEmail({ to, subject, html, text });
}
