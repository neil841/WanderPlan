/**
 * Test Email API Endpoint
 *
 * Use this endpoint to test your email configuration
 * DELETE THIS FILE IN PRODUCTION
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend-client';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoint disabled in production' },
        { status: 403 }
      );
    }

    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    // Simple test email template
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
    .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ WanderPlan Test Email</h1>
    </div>
    <div class="content">
      <p>${message}</p>
    </div>
  </div>
</body>
</html>
    `;

    const success = await sendEmail({
      to,
      subject,
      html,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
