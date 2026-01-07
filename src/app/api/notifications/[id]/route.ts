import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { markNotificationAsRead, deleteNotification } from '@/lib/services/notificationService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/notifications/[id] - Mark notification as read
 * DELETE /api/notifications/[id] - Delete a notification
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Mark as read
    const notification = await markNotificationAsRead(id);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete notification
    const notification = await deleteNotification(id);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
