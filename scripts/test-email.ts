/**
 * Test Email Script
 *
 * Run this script to test your email configuration:
 * npx ts-node -r tsconfig-paths/register scripts/test-email.ts
 */

import { sendEmail } from '../src/lib/email/resend-client.js';

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');

  // Check environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env');
    console.log('\n📝 Steps to fix:');
    console.log('1. Sign up at https://resend.com');
    console.log('2. Get your API key from the dashboard');
    console.log('3. Add to .env: RESEND_API_KEY=re_...');
    process.exit(1);
  }

  if (!process.env.FROM_EMAIL) {
    console.warn('⚠️  FROM_EMAIL is not set, using default');
  }

  // Test email
  const testRecipient = process.argv[2] || 'test@example.com';

  console.log(`📧 Sending test email to: ${testRecipient}`);
  console.log(`📤 From: ${process.env.FROM_EMAIL || 'noreply@wanderplan.com'}\n`);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ WanderPlan</h1>
      <p>Email Configuration Test</p>
    </div>
    <div class="content">
      <h2>🎉 Success!</h2>
      <p>Your email configuration is working correctly.</p>
      <p>This is a test email sent from your WanderPlan application to verify that the Resend integration is functioning properly.</p>
      <p><strong>Configuration Details:</strong></p>
      <ul>
        <li>Service: Resend</li>
        <li>From: ${process.env.FROM_EMAIL || 'noreply@wanderplan.com'}</li>
        <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
        <li>Timestamp: ${new Date().toISOString()}</li>
      </ul>
      <a href="http://localhost:3000" class="button">Visit WanderPlan</a>
    </div>
    <div class="footer">
      <p>This is a test email. You can safely ignore or delete it.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const success = await sendEmail({
      to: testRecipient,
      subject: '✈️ WanderPlan Email Test',
      html,
    });

    if (success) {
      console.log('✅ Email sent successfully!');
      console.log(`\n📬 Check your inbox at: ${testRecipient}`);
      console.log('\n💡 Next steps:');
      console.log('1. Check your email inbox');
      console.log('2. Verify the email formatting looks good');
      console.log('3. Update FROM_EMAIL in .env with your verified domain');
    } else {
      console.error('❌ Failed to send email');
      console.log('\n🔍 Troubleshooting:');
      console.log('1. Verify your RESEND_API_KEY is correct');
      console.log('2. Check Resend dashboard for errors');
      console.log('3. Ensure FROM_EMAIL uses a verified domain');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail();
