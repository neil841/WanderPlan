/**
 * Collaborator Invitation Email Sender
 *
 * Sends invitation emails to collaborators when they are invited to a trip.
 */

import { CollaboratorRole } from '@prisma/client';

/**
 * Invitation email parameters
 */
export interface CollaboratorInvitationParams {
  to: string;
  inviterName: string;
  tripTitle: string;
  role: CollaboratorRole;
  message?: string;
  invitationId: string;
}

/**
 * Send collaborator invitation email
 *
 * NOTE: This is a placeholder implementation. In production, you would use:
 * - SendGrid
 * - Resend
 * - AWS SES
 * - Or another email service
 *
 * For now, this logs the invitation details.
 */
export async function sendCollaboratorInvitation(
  params: CollaboratorInvitationParams
): Promise<void> {
  const { to, inviterName, tripTitle, role, message, invitationId } = params;

  // Build invitation URLs
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const acceptUrl = `${baseUrl}/invitations/${invitationId}/accept`;
  const declineUrl = `${baseUrl}/invitations/${invitationId}/decline`;

  // Format role for display
  const roleDisplay = role.charAt(0) + role.slice(1).toLowerCase();

  // Email template (HTML)
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trip Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .trip-info {
      background-color: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .trip-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .role-badge {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      margin: 0 10px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .button-accept {
      background-color: #16a34a;
      color: #ffffff;
    }
    .button-accept:hover {
      background-color: #15803d;
    }
    .button-decline {
      background-color: #dc2626;
      color: #ffffff;
    }
    .button-decline:hover {
      background-color: #b91c1c;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✈️ WanderPlan</div>
      <h1 class="title">You're Invited to Collaborate!</h1>
    </div>

    <p>Hello,</p>

    <p><strong>${inviterName}</strong> has invited you to collaborate on a trip:</p>

    <div class="trip-info">
      <div class="trip-title">${tripTitle}</div>
      <p>Your role: <span class="role-badge">${roleDisplay}</span></p>
    </div>

    ${message ? `
    <div class="message">
      <strong>Personal message from ${inviterName}:</strong>
      <p>${message}</p>
    </div>
    ` : ''}

    <p>As a <strong>${roleDisplay}</strong>, you'll be able to:</p>
    <ul>
      ${getRolePermissions(role)}
    </ul>

    <div class="button-container">
      <a href="${acceptUrl}" class="button button-accept">Accept Invitation</a>
      <a href="${declineUrl}" class="button button-decline">Decline</a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>

    <div class="footer">
      <p>This invitation was sent by ${inviterName} through WanderPlan.</p>
      <p>
        <a href="${baseUrl}">Visit WanderPlan</a> |
        <a href="${baseUrl}/help">Help Center</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Plain text version
  const textContent = `
WanderPlan - Trip Invitation

${inviterName} has invited you to collaborate on a trip:

Trip: ${tripTitle}
Your role: ${roleDisplay}

${message ? `\nPersonal message from ${inviterName}:\n${message}\n` : ''}

As a ${roleDisplay}, you'll be able to:
${getRolePermissionsText(role)}

Accept invitation: ${acceptUrl}
Decline invitation: ${declineUrl}

If you didn't expect this invitation, you can safely ignore this email.

---
This invitation was sent by ${inviterName} through WanderPlan.
Visit WanderPlan: ${baseUrl}
  `.trim();

  // In development, log the email content
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(80));
    console.log('COLLABORATOR INVITATION EMAIL (Development Mode)');
    console.log('='.repeat(80));
    console.log('To:', to);
    console.log('From:', inviterName);
    console.log('Trip:', tripTitle);
    console.log('Role:', roleDisplay);
    console.log('Invitation ID:', invitationId);
    console.log('Accept URL:', acceptUrl);
    console.log('Decline URL:', declineUrl);
    console.log('-'.repeat(80));
    console.log(textContent);
    console.log('='.repeat(80));
  }

  // TODO: In production, send actual email using email service
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to,
    from: process.env.FROM_EMAIL,
    subject: `${inviterName} invited you to collaborate on ${tripTitle}`,
    text: textContent,
    html: htmlContent,
  });
  */

  // Example with Resend:
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject: `${inviterName} invited you to collaborate on ${tripTitle}`,
    text: textContent,
    html: htmlContent,
  });
  */

  // For now, just resolve successfully
  return Promise.resolve();
}

/**
 * Get role permissions as HTML list items
 */
function getRolePermissions(role: CollaboratorRole): string {
  const permissions: Record<CollaboratorRole, string[]> = {
    VIEWER: ['View trip details', 'View itinerary and events', 'View shared documents'],
    EDITOR: [
      'View trip details',
      'Edit trip information',
      'Create and edit events',
      'Manage budget and expenses',
      'Upload documents',
      'Send messages',
    ],
    ADMIN: [
      'All Editor permissions',
      'Invite and manage collaborators',
      'Delete events and documents',
      'Manage trip settings',
      'Full trip management access',
    ],
  };

  return permissions[role].map(p => `<li>${p}</li>`).join('\n');
}

/**
 * Get role permissions as plain text
 */
function getRolePermissionsText(role: CollaboratorRole): string {
  const permissions: Record<CollaboratorRole, string[]> = {
    VIEWER: ['View trip details', 'View itinerary and events', 'View shared documents'],
    EDITOR: [
      'View trip details',
      'Edit trip information',
      'Create and edit events',
      'Manage budget and expenses',
      'Upload documents',
      'Send messages',
    ],
    ADMIN: [
      'All Editor permissions',
      'Invite and manage collaborators',
      'Delete events and documents',
      'Manage trip settings',
      'Full trip management access',
    ],
  };

  return permissions[role].map(p => `- ${p}`).join('\n');
}
