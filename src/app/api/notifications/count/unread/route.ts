import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUnreadNotificationCount } from '@/lib/services/notificationService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/notifications/count/unread - Get unread notification count for current user
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

    const count = await getUnreadNotificationCount(userId);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('GET /api/notifications/count/unread error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
