import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createNotificationLog,
  getUserNotifications,
  markAllNotificationsAsRead,
} from '@/lib/services/notificationService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/notifications - Get user's notifications
 * POST /api/notifications - Create a notification (internal use)
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const markAsRead = searchParams.get('markAsRead') === 'true';

    // Mark all as read if requested
    if (markAsRead) {
      await markAllNotificationsAsRead(userId);
    }

    // Fetch notifications
    const notifications = await getUserNotifications(userId, limit);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, userId, notificationType } = body;

    if (!taskId || !userId || !notificationType) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, userId, notificationType' },
        { status: 400 }
      );
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Create notification
    const notification = await createNotificationLog(taskId, userId, notificationType);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create notification' },
      { status: 500 }
    );
  }
}
