/**
 * User Notification Settings API
 *
 * GET /api/user/notification-settings - Get current notification settings
 * PATCH /api/user/notification-settings - Update notification settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type {
  UpdateNotificationSettingsRequest,
  NotificationSettingsResponse,
  UserNotificationSettings,
} from '@/types/email-settings';

/**
 * GET /api/user/notification-settings
 *
 * Get the user's current notification settings
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get user settings from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Parse settings JSON
    const settings = user.settings as unknown as UserNotificationSettings;

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/notification-settings
 *
 * Update the user's notification settings
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdateNotificationSettingsRequest = await request.json();

    // 2. Get current settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Merge new settings with existing settings
    const currentSettings = user.settings as unknown as UserNotificationSettings;
    const updatedSettings: UserNotificationSettings = {
      ...currentSettings,
      email: {
        ...currentSettings.email,
        ...body.email,
      },
      push: body.push || currentSettings.push,
    };

    // 4. Update user settings in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        settings: updatedSettings as any,
      },
    });

    const response: NotificationSettingsResponse = {
      success: true,
      settings: updatedSettings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}
