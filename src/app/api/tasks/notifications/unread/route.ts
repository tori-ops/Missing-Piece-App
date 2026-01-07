import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUnreadTaskNotificationCount } from '@/lib/services/notificationService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tasks/notifications/unread - Get unread task notification count for current user
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

    const count = await getUnreadTaskNotificationCount(userId);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('GET /api/tasks/notifications/unread error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch unread task notification count' },
      { status: 500 }
    );
  }
}
