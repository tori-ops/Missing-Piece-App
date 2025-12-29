import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserNotificationPreferences, updateNotificationPreferences } from '@/lib/services/notificationService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/notifications/preferences - Get user's notification preferences
 * PUT /api/notifications/preferences - Update user's notification preferences
 */

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = (session.user as any)?.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preferences = await getUserNotificationPreferences(user.id);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('GET /api/notifications/preferences error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = (session.user as any)?.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      emailOnTaskCreated,
      emailOnTaskCompleted,
      emailOnTaskCommented,
      emailOnMeetingNoteCreated,
      emailOnMeetingNoteCommented,
    } = body;

    const preferences = await updateNotificationPreferences(user.id, {
      emailOnTaskCreated,
      emailOnTaskCompleted,
      emailOnTaskCommented,
      emailOnMeetingNoteCreated,
      emailOnMeetingNoteCommented,
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('PUT /api/notifications/preferences error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
